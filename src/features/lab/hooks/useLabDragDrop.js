import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useLabStore } from '../stores/useLabStore';
import { PHYSICAL_STATE } from '../data/constants';
import { REACTION_MAP, getReactionKey } from '../data/reactionMap';
import { TEMPLATE_TO_CONTENT, EMPTY_DROP_LIQUID_COLOR } from '../data/chemicalMappings';

const getPhLevel = (content) => {
  if (!content) return 'NEUTRAL';
  const c = content.toLowerCase();
  if (c.includes('hcl') || c.includes('hno₃') || c.includes('h₂c₂o₄') || c.includes('axit')) return 'ACID';
  if (c.includes('naoh') || c.includes('ca(oh)₂') || c.includes('ba(oh)₂') || c.includes('bazơ')) return 'BASE';
  return 'NEUTRAL';
};

const applyIndicatorEffect = (container) => {
  if (container.indicator === 'PHENOLPHTHALEIN') {
    if (container.phLevel === 'BASE') {
      container.liquidColor = '#ec4899'; // Pink
    } else {
      container.liquidColor = 'rgba(200, 230, 255, 0.7)'; // Clear
    }
  } else if (container.indicator === 'LITMUS') {
    if (container.phLevel === 'ACID') {
      container.indicatorPaperColor = '#ef4444'; // Red
    } else if (container.phLevel === 'BASE') {
      container.indicatorPaperColor = '#3b82f6'; // Blue
    } else {
      container.indicatorPaperColor = '#8b5cf6'; // Purple
    }
  }
};

/**
 * useLabDragDrop
 *
 * Encapsulates ALL drag-and-drop logic for the Virtual Lab:
 *   - Tracking the active drag item (for DragOverlay preview)
 *   - Proximity check for Bunsen-burner heating
 *   - Sidebar-to-Canvas drop (place new item)
 *   - Canvas-to-Canvas repositioning
 *   - Chemical-to-Container reaction logic (Data-Driven Strategy Pattern)
 *
 * @param {{ scale: number, inventory: Array }} params
 * @returns {{ activeDragItem, handleDragStart, handleDragEnd }}
 *
 * NOTE: activeDragItem, handleDragStart, handleDragEnd are returned because
 *       they are consumed directly in VirtualLabPage JSX:
 *         <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
 *         <DragOverlay>{activeDragItem ? <DragPreview item={activeDragItem} /> : null}</DragOverlay>
 */
export function useLabDragDrop({ scale, inventory }) {
  const [activeDragData, setActiveDragData] = useState(null);
  const reactionTimeoutsRef = useRef([]);

  const {
    setWorkspace: setPlacedItems,
    setReactionInfo,
    completeTask,
    labType,
  } = useLabStore();

  useEffect(() => {
    return () => {
      reactionTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      reactionTimeoutsRef.current = [];
    };
  }, []);

  // Lắng nghe sự kiện vật lý từ Phaser báo kim loại chạm nước
  useEffect(() => {
    const handlePhaserHitLiquid = (e) => {
      const { containerId, chemicalName, chunkId } = e.detail;
      
      setPlacedItems(curr => {
        let nextItems = [...curr];
        const targetContainerIndex = nextItems.findIndex(i => i.instanceId === containerId);
        if (targetContainerIndex !== -1) {
          let container = { ...nextItems[targetContainerIndex] };
          const currentContent = container.content;
          const isJustIndicator = currentContent === 'Litmus Paper' || currentContent === 'Phenolphthalein';
          
          const key = getReactionKey(currentContent, chemicalName);
          const reaction = REACTION_MAP[key];

          if (reaction && currentContent && !isJustIndicator) {
            const previousActions = useLabStore.getState().progress.completed_actions;
            if (!previousActions.includes(key)) {
              if (labType === 'PREMADE') {
                toast.success(`Phản ứng mới: ${reaction?.reactionInfo?.equation || key}`, { description: 'Bạn nhận được EXP!', position: 'bottom-right' });
              } else if (labType === 'SANDBOX') {
                toast.success(`Phản ứng mới: ${reaction?.reactionInfo?.equation || key}`, { position: 'bottom-right' });
              }
              useLabStore.getState().recordReaction(key);
              completeTask(key);
            }

            container.liquidContent = reaction.liquidContent ?? null;
            container.gasContent = reaction.gasContent ?? null;
            container.solidContent = reaction.solidContent ?? null;
            container.content = reaction.liquidContent ?? reaction.solidContent ?? null;

            if (reaction.liquidColor) container.liquidColor = reaction.liquidColor;
            if (reaction.precipitateColor) container.precipitateColor = reaction.precipitateColor;
            if (reaction.reactionState) container.reactionState = reaction.reactionState;
            if (reaction.reactionInfo) setReactionInfo(reaction.reactionInfo);

            if (reaction.clearStateAfter) {
              const timeoutId = window.setTimeout(() => {
                reactionTimeoutsRef.current = reactionTimeoutsRef.current.filter((id) => id !== timeoutId);
                setPlacedItems(c =>
                  c.map(it =>
                    it.instanceId === containerId ? { 
                      ...it, 
                      reactionState: null, 
                      gasContent: null,
                      isDissolving: false,
                    } : it
                  )
                );
                
                // PHASE 4: STOP PARTICLES
                window.dispatchEvent(new CustomEvent('PHASER_STOP_PARTICLES', {
                  detail: { containerId }
                }));
              }, reaction.clearStateAfter);
              reactionTimeoutsRef.current.push(timeoutId);
            }
            
            // Xóa tan viên kim loại/hóa chất rắn ngay khi có phản ứng
            container.isDissolving = true;
            container.reactionDuration = reaction.clearStateAfter || 3000;
            window.dispatchEvent(new CustomEvent('PHASER_DISSOLVE_CHUNK', {
              detail: { chunkId, duration: container.reactionDuration }
            }));
            
            // PHASE 4: START PARTICLES
            if (reaction.reactionState === 'bubbling' || reaction.reactionState === 'violent') {
              window.dispatchEvent(new CustomEvent('PHASER_START_PARTICLES', {
                detail: { 
                  containerId, 
                  type: reaction.reactionState,
                  duration: container.reactionDuration
                }
              }));
            }
          } else if (!currentContent || isJustIndicator) {
            const chemicalItem = inventory.find(i => TEMPLATE_TO_CONTENT[i.id] === chemicalName) || inventory.find(i => i.name === chemicalName);
            const isSolid = chemicalName.includes('(Rắn)') || chemicalItem?.state === PHYSICAL_STATE.SOLID;
            if (isSolid) {
              container.solidContent = chemicalName;
              container.content = chemicalName;
            } else {
              container.liquidContent = chemicalName;
              container.content = chemicalName;
            }
            setReactionInfo({
              equation: `${chemicalName} Added`,
              condition: 'Mixing',
              description: `${chemicalName} đã được thêm vào dụng cụ.`,
            });
            completeTask(`DRAG_${chemicalName.toUpperCase()}_TO_FLASK`);
          }
          
          if (container.content) {
            container.phLevel = getPhLevel(container.content);
            applyIndicatorEffect(container);
          }
          nextItems[targetContainerIndex] = container;
        }
        return nextItems;
      });
    };

    window.addEventListener('PHASER_HIT_LIQUID', handlePhaserHitLiquid);
    return () => window.removeEventListener('PHASER_HIT_LIQUID', handlePhaserHitLiquid);
  }, [completeTask, labType, setReactionInfo, setPlacedItems]);

  // ─── Active drag item for DragOverlay preview ───────────────────────────────
  const activeDragItem = useMemo(() => {
    if (!activeDragData) return null;
    return inventory.find(i => i.id === activeDragData.templateId) ?? null;
  }, [activeDragData, inventory]);

  // ─── Proximity check: heat containers near a Bunsen burner ──────────────────
  const checkProximity = (items) => {
    const burners = items.filter(i => i.templateId === 'bunsen_burner');
    return items.map(item => {
      let isHeated = false;
      if (item.templateId === 'beaker' || item.templateId === 'test_tube') {
        isHeated = burners.some(burner =>
          Math.abs(burner.x - item.x) < 50 &&
          (burner.y - item.y) > 40 && (burner.y - item.y) < 160
        );
      } else if (item.templateId === 'bunsen_burner') {
        isHeated = items.some(container =>
          ['beaker', 'test_tube'].includes(container.templateId) &&
          Math.abs(container.x - item.x) < 50 &&
          (item.y - container.y) > 40 && (item.y - container.y) < 160
        );
      }
      return { ...item, isHeated };
    });
  };

  // ─── Drag start: record what is being dragged ───────────────────────────────
  const handleDragStart = (event) => {
    setActiveDragData(event.active.data.current);
  };

  // ─── Drag end: resolve drop ──────────────────────────────────────────────────
  const handleDragEnd = (event) => {
    setActiveDragData(null);
    const { active, over, delta } = event;
    if (!over) return;

    const sourceData = active.data.current;

    // @dnd-kit gives screen-pixel deltas; divide by zoom scale for canvas space.
    const adjustedDeltaX = delta.x / scale;
    const adjustedDeltaY = delta.y / scale;

    // ── 1. Sidebar → Canvas drop ──────────────────────────────────────────────
    if (sourceData?.source === 'sidebar' && over.id === 'canvas') {
      const newId = `item-${Date.now()}`;

      // Step A: Get the center of the dragged ghost in screen-space (= cursor position).
      const dropCenterX = event.active.rect.current.translated.left + (event.active.rect.current.translated.width / 2);
      const dropCenterY = event.active.rect.current.translated.top + (event.active.rect.current.translated.height / 2);

      // Step B: Get the live canvas rect (bypass dnd-kit rect cache).
      const canvasEl = document.getElementById('experiment-canvas');
      if (!canvasEl) return;
      const liveRect = canvasEl.getBoundingClientRect();
      const panX = Number(canvasEl.dataset.panX || 0);
      const panY = Number(canvasEl.dataset.panY || 0);

      // Step C: Map center into canvas coordinate space (accounting for zoom).
      const relativeCenterX = (dropCenterX - liveRect.left - panX) / scale;
      const relativeCenterY = (dropCenterY - liveRect.top - panY) / scale;

      // Step D: Offset by half the icon size so the item drops centred on the cursor.
      const x = Math.max(0, relativeCenterX - 45);
      const y = Math.max(0, relativeCenterY - 45);

      const newItem = {
        instanceId: newId,
        templateId: sourceData.templateId,
        x,
        y,
        content: null,
        isHeated: false,
      };

      setPlacedItems(prev => checkProximity([...prev, newItem]));

      setReactionInfo({
        equation: 'Adding ' + (inventory.find(i => i.id === sourceData.templateId)?.name ?? ''),
        condition: 'Workspace setup',
        description: 'Vật phẩm đã được thêm vào bàn làm việc.',
      });

      // Record task: container placed on workspace
      if (sourceData.templateId === 'beaker' || sourceData.templateId === 'test_tube') {
        completeTask('DRAG_FLASK_TO_WORKSPACE');
      }
    }

    // ── 2. Canvas → Canvas reposition + chemical reaction logic ───────────────
    if (sourceData?.source === 'canvas') {
      const instanceId = sourceData.instanceId;

      setPlacedItems(prev => {
        let updatedItems = prev.map(item => {
          if (item.instanceId === instanceId) {
            return { ...item, x: Math.max(0, item.x + adjustedDeltaX), y: Math.max(0, item.y + adjustedDeltaY) };
          }
          return item;
        });

        // ── 3. Chemical-to-Container drop logic (Data-Driven Strategy Pattern) ─
        const draggedObj = updatedItems.find(i => i.instanceId === instanceId);
        if (draggedObj && Object.prototype.hasOwnProperty.call(TEMPLATE_TO_CONTENT, draggedObj.templateId)) {

          const targetContainerIndex = updatedItems.findIndex(i =>
            i.instanceId !== instanceId &&
            ['beaker', 'test_tube'].includes(i.templateId) &&
            Math.abs(i.x - draggedObj.x) < 70 &&
            Math.abs(i.y - draggedObj.y) < 70
          );

          if (targetContainerIndex !== -1) {
            let targetContainer = { ...updatedItems[targetContainerIndex] };
            const currentContent = targetContainer.content;
            const instanceToUpdate = targetContainer.instanceId;

            // Translate templateId → canonical content name for reaction lookup.
            const draggedContentName = TEMPLATE_TO_CONTENT[draggedObj.templateId];

            // Indicator drop logic
            const isJustIndicator = currentContent === 'Litmus Paper' || currentContent === 'Phenolphthalein';
            const originalItem = inventory.find(item => item.id === draggedObj.templateId);
            const isLitmus = draggedObj.templateId === 'litmus_paper';
            
            const subCategory = originalItem?.sub_category || originalItem?.subCategory;
            const isMetal = subCategory === 'METAL';
            const isSaltSolid = subCategory === 'SALT_SOLID' || subCategory === 'OXIDE';
            
            // Chỉ thả khối kim loại rơi tự do
            const isChunkMetal = isMetal || draggedContentName.includes(' (Rắn)');
            const isPowder = isSaltSolid || draggedContentName.includes('(Bột)');

            const processReaction = (container) => {
              if (draggedObj.templateId === 'litmus_paper') {
                container.indicator = 'LITMUS';
                if (!container.content) {
                   container.content = 'Litmus Paper';
                   container.solidContent = 'Litmus Paper';
                }
              } else if (draggedObj.templateId === 'phenolphthalein') {
                container.indicator = 'PHENOLPHTHALEIN';
                if (!container.content) {
                   container.content = 'Phenolphthalein';
                   container.liquidContent = 'Phenolphthalein';
                   container.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
              } else {
                // Build bi-directional lookup key (alphabetically sorted).
                const key = getReactionKey(currentContent, draggedContentName);
                const reaction = REACTION_MAP[key];

                if (reaction && currentContent && !isJustIndicator) {
                  // ── REACTION FOUND ────────────────────────────────────────────
                  const previousActions = useLabStore.getState().progress.completed_actions;
                  if (!previousActions.includes(key)) {
                    if (labType === 'PREMADE') {
                      toast.success(`Phản ứng mới: ${reaction?.reactionInfo?.equation || key}`, {
                        description: 'Bạn nhận được EXP!',
                        position: 'bottom-right',
                      });
                    } else if (labType === 'SANDBOX') {
                      toast.success(`Phản ứng mới: ${reaction?.reactionInfo?.equation || key}`, {
                        position: 'bottom-right',
                      });
                    }
                    useLabStore.getState().recordReaction(key);
                    completeTask(key);
                  }

                  // Apply multi-layer content fields
                  container.liquidContent = reaction.liquidContent ?? null;
                  container.solidContent = reaction.solidContent ?? null;
                  container.gasContent = reaction.gasContent ?? null;
                  container.content = reaction.liquidContent ?? reaction.solidContent ?? null;

                  if (reaction.liquidColor) container.liquidColor = reaction.liquidColor;
                  if (reaction.precipitateColor) container.precipitateColor = reaction.precipitateColor;
                  if (reaction.reactionState) container.reactionState = reaction.reactionState;
                  if (reaction.reactionInfo) setReactionInfo(reaction.reactionInfo);

                  if (reaction.clearStateAfter) {
                    const timeoutId = window.setTimeout(() => {
                      reactionTimeoutsRef.current = reactionTimeoutsRef.current.filter((id) => id !== timeoutId);
                      setPlacedItems(curr =>
                        curr.map(it =>
                          it.instanceId === instanceToUpdate ? { 
                            ...it, 
                            reactionState: null, 
                            gasContent: null,
                            isDissolving: false,
                            solidContent: reaction.solidContent ?? null 
                          } : it
                        )
                      );
                      
                      // PHASE 4: STOP PARTICLES
                      window.dispatchEvent(new CustomEvent('PHASER_STOP_PARTICLES', {
                        detail: { containerId: instanceToUpdate }
                      }));
                    }, reaction.clearStateAfter);
                    reactionTimeoutsRef.current.push(timeoutId);
                  }
                  
                  // Dissolving Solid Logic
                  const draggedIsSolid = draggedContentName.includes('(Rắn)');
                  const currentIsSolid = currentContent.includes('(Rắn)');
                  if (reaction.reactionState === 'bubbling' || reaction.reactionState === 'violent') {
                     if (draggedIsSolid || currentIsSolid) {
                        container.isDissolving = true;
                        container.reactionDuration = reaction.clearStateAfter || 3000;
                        container.solidContent = draggedIsSolid ? draggedContentName : currentContent;
                        window.dispatchEvent(new CustomEvent('PHASER_DISSOLVE_CHUNK', {
                          detail: { containerId: instanceToUpdate, duration: container.reactionDuration }
                        }));
                     }
                     // PHASE 4: START PARTICLES FOR INSTANT REACTIONS
                     window.dispatchEvent(new CustomEvent('PHASER_START_PARTICLES', {
                       detail: { 
                         containerId: instanceToUpdate, 
                         type: reaction.reactionState,
                         duration: reaction.clearStateAfter || 3000
                       }
                     }));
                  }
                } else if (!currentContent || isJustIndicator) {
                  // ── EMPTY CONTAINER OR ONLY INDICATOR: deposit chemical ─────────
                  const depositSolid = isChunkMetal || isPowder || (originalItem?.state === PHYSICAL_STATE.SOLID && !isLitmus);
                  if (depositSolid) {
                    container.solidContent = draggedContentName;
                    if (!isJustIndicator) container.liquidContent = null;
                    container.content = draggedContentName;
                  } else {
                    container.liquidContent = draggedContentName;
                    if (!isJustIndicator) container.solidContent = null;
                    container.content = draggedContentName;
                    const liquidColor = EMPTY_DROP_LIQUID_COLOR[draggedObj.templateId];
                    if (liquidColor) container.liquidColor = liquidColor;
                  }

                  setReactionInfo({
                    equation: `${draggedContentName} Added`,
                    condition: 'Mixing',
                    description: `${draggedContentName} đã được thêm vào dụng cụ.`,
                  });

                  // Record task: first chemical poured
                  const actionName = `DRAG_${draggedContentName.toUpperCase()}_TO_FLASK`;
                  completeTask(actionName);
                }
              }
              
              // Re-evaluate pH based on resulting content and apply indicators
              if (container.content) {
                container.phLevel = getPhLevel(container.content);
                applyIndicatorEffect(container);
              }
            }; // end processReaction

            // Bỏ Hóa chất vừa kéo khỏi Canvas (đã thả vào bình)
            updatedItems = updatedItems.filter(i => i.instanceId !== instanceId);

            if (isChunkMetal && !isPowder) {
               // SPAWN TRONG PHASER VÀ CHỜ SỰ KIỆN CHẠM NƯỚC
               const hexColor = (draggedObj.templateId === 'zn' || draggedObj.templateId.includes('Zn')) ? 0x9ca3af : 
                                (draggedObj.templateId === 'na' || draggedObj.templateId.includes('Na')) ? 0x94a3b8 :
                                (draggedObj.templateId === 'fe' || draggedObj.templateId.includes('Fe')) ? 0x475569 :
                                (draggedObj.templateId === 'kmno4_powder' || draggedObj.templateId.includes('KMnO4')) ? 0x581c87 :
                                (draggedObj.templateId === 'cu' || draggedObj.templateId.includes('Cu')) ? 0xb45309 : 
                                0x94a3b8;
               
               const spawnX = targetContainer.x + (targetContainer.templateId === 'beaker' ? 48 : 24);
               window.dispatchEvent(new CustomEvent('PHASER_SPAWN', { 
                 detail: { 
                   x: spawnX, // Thả ngay giữa miệng bình
                   y: targetContainer.y + 15, // Thả bên TRONG miệng bình để tránh kẹt ở trần thế giới (y=0)
                   name: draggedContentName,
                   color: hexColor 
                 } 
               }));
               
               // KHÔNG GỌI processReaction Ở ĐÂY NỮA
               updatedItems[targetContainerIndex] = targetContainer;
            } else if (isLitmus) {
               // Giấy quỳ vẫn xử lý ngay lập tức bằng CSS (Phaser chưa hỗ trợ giấy quỳ)
               targetContainer.fallingSolid = {
                 label: draggedContentName,
                 color: null,
                 isLitmus: true
               };
               updatedItems[targetContainerIndex] = targetContainer;
               
               setTimeout(() => {
                 setPlacedItems(curr => {
                   let nextItems = [...curr];
                   const idx = nextItems.findIndex(i => i.instanceId === instanceToUpdate);
                   if (idx !== -1) {
                     let updatedContainer = { ...nextItems[idx], fallingSolid: null };
                     processReaction(updatedContainer);
                     nextItems[idx] = updatedContainer;
                   }
                   return nextItems;
                 });
               }, 800);
            } else {
               // Chất lỏng xử lý ngay lập tức
               processReaction(targetContainer);
               updatedItems[targetContainerIndex] = targetContainer;
            }
          }
        }

        return checkProximity(updatedItems);
      });
    }
  };

  return { activeDragItem, handleDragStart, handleDragEnd };
}
