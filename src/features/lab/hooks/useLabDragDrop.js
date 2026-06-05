import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useLabStore } from '../stores/useLabStore';
import { PHYSICAL_STATE } from '../data/constants';
import { REACTION_MAP, getReactionKey } from '../data/reactionMap';
import { TEMPLATE_TO_CONTENT, EMPTY_DROP_LIQUID_COLOR } from '../data/chemicalMappings';

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

  const {
    setWorkspace: setPlacedItems,
    setReactionInfo,
    completeTask,
    labType,
  } = useLabStore();

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

            // Build bi-directional lookup key (alphabetically sorted).
            const key = getReactionKey(currentContent, draggedContentName);
            const reaction = REACTION_MAP[key];

            if (reaction && currentContent) {
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
              targetContainer.liquidContent = reaction.liquidContent ?? null;
              targetContainer.solidContent = reaction.solidContent ?? null;
              targetContainer.gasContent = reaction.gasContent ?? null;
              targetContainer.content = reaction.liquidContent ?? reaction.solidContent ?? null;

              if (reaction.liquidColor) targetContainer.liquidColor = reaction.liquidColor;
              if (reaction.precipitateColor) targetContainer.precipitateColor = reaction.precipitateColor;
              if (reaction.reactionState) targetContainer.reactionState = reaction.reactionState;
              if (reaction.reactionInfo) setReactionInfo(reaction.reactionInfo);

              if (reaction.clearStateAfter) {
                setTimeout(() => {
                  setPlacedItems(curr =>
                    curr.map(it =>
                      it.instanceId === instanceToUpdate ? { ...it, reactionState: null, gasContent: null } : it
                    )
                  );
                }, reaction.clearStateAfter);
              }
            } else if (!currentContent) {
              // ── EMPTY CONTAINER: deposit chemical ─────────────────────────
              const originalItem = inventory.find(item => item.id === draggedObj.templateId);
              const isSolid = originalItem?.state === PHYSICAL_STATE.SOLID || draggedContentName.includes('(Rắn)');

              if (isSolid) {
                targetContainer.solidContent = draggedContentName;
                targetContainer.liquidContent = null;
                targetContainer.content = draggedContentName;
              } else {
                targetContainer.liquidContent = draggedContentName;
                targetContainer.solidContent = null;
                targetContainer.content = draggedContentName;
                const liquidColor = EMPTY_DROP_LIQUID_COLOR[draggedObj.templateId];
                if (liquidColor) targetContainer.liquidColor = liquidColor;
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
            // else: container already has content, no matching reaction → ignore

            updatedItems[targetContainerIndex] = targetContainer;
            // Remove the deposited chemical from the canvas
            updatedItems = updatedItems.filter(i => i.instanceId !== instanceId);
          }
        }

        return checkProximity(updatedItems);
      });
    }
  };

  return { activeDragItem, handleDragStart, handleDragEnd };
}
