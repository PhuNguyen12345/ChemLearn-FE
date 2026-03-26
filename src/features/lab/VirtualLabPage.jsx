import React, { useState, useMemo, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import '/Lab2.css'; 
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { INITIAL_INVENTORY } from './data/constants';
import DraggableItem from './components/DraggableItem';
import DragPreview from './components/DragPreview';
import CentralWorkspace from './components/CentralWorkspace';

export default function VirtualLabPage() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarView, setSidebarView] = useState('grid');
  
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  // New Free-form & Zoom State
  const [placedItems, setPlacedItems] = useState([]);
  const [scale, setScale] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleDeleteItem = (id) => {
    setPlacedItems(prev => prev.filter(item => item.instanceId !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid deleting if user is typing in the search input
      if (document.activeElement.tagName === 'INPUT') return;
      if (selectedItemId && (e.key === 'Delete' || e.key === 'Backspace')) {
        handleDeleteItem(selectedItemId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId]);

  // Drag state
  const [activeDragData, setActiveDragData] = useState(null);
  
  const activeDragItem = useMemo(() => {
    if (!activeDragData) return null;
    if (activeDragData.source === 'sidebar') return inventory.find(i => i.id === activeDragData.templateId);
    if (activeDragData.source === 'canvas') return inventory.find(i => i.id === activeDragData.templateId);
    return null;
  }, [activeDragData, inventory]);

  const [reactionInfo, setReactionInfo] = useState({ equation: '-', condition: '-', description: 'Kéo dụng cụ và hóa chất vào Workspace để bắt đầu.' });

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

  const handleDragStart = (event) => {
    setActiveDragData(event.active.data.current); 
  };

  const handleDragEnd = (event) => {
    setActiveDragData(null); 
    const { active, over, delta } = event;
    if (!over) return; 

    const sourceData = active.data.current;
    
    // @dnd-kit provides screen-pixel deltas. Because our canvas is scaled, 
    // we must divide the delta by the current scale so the visual drag 
    // perfectly matches the cursor movement mathematically.
    const adjustedDeltaX = delta.x / scale;
    const adjustedDeltaY = delta.y / scale;
    
    // 1. Drop Sidebar Item onto Canvas
    if (sourceData?.source === 'sidebar' && over.id === 'canvas') {
      const newId = `item-${Date.now()}`;
      
      // // Calculate drop relative to canvas, adjusting for current zoom scale wrapper
      // const x = Math.max(20, (event.active.rect.current.translated.left - over.rect.left) / scale - 20);
      // const y = Math.max(20, (event.active.rect.current.translated.top - over.rect.top) / scale - 20);

      // Bước A: Lấy chính xác tọa độ TÂM của vật thể đang lơ lửng trên màn hình (chính là đầu chuột của em)
      const dropCenterX = event.active.rect.current.translated.left + (event.active.rect.current.translated.width / 2);
      const dropCenterY = event.active.rect.current.translated.top + (event.active.rect.current.translated.height / 2);
      
      // Bước B: Hỏi Trình duyệt tọa độ LIVE của Canvas (Tuyệt chiêu bỏ qua cache của dnd-kit)
      const canvasEl = document.getElementById('experiment-canvas');
      if (!canvasEl) return;
      const liveRect = canvasEl.getBoundingClientRect();

      // Bước C: Ánh xạ tọa độ tâm đó vào không gian của Canvas (đã bù trừ tỷ lệ Zoom)
      const relativeCenterX = (dropCenterX - liveRect.left) / scale;
      const relativeCenterY = (dropCenterY - liveRect.top) / scale;

      // Bước D: Trừ đi một nửa kích thước của icon trên bàn để nó rớt ngay giữa tâm chuột.
      // (Giả sử CanvasItem của em rộng khoảng 80x80px, mình trừ đi 40px)
      const x = Math.max(0, relativeCenterX - 45);
      const y = Math.max(0, relativeCenterY - 45);
      
      const newItem = {
        instanceId: newId,
        templateId: sourceData.templateId,
        x: x,
        y: y,
        content: null,
        isHeated: false
      };
      
      setPlacedItems(prev => checkProximity([...prev, newItem]));
      setReactionInfo({ equation: 'Adding ' + activeDragItem?.name, condition: 'Workspace setup', description: 'Vật phẩm đã được thêm vào bàn làm việc.' });
    }
    
    // 2. Reposition Canvas Item
    if (sourceData?.source === 'canvas') {
      const instanceId = sourceData.instanceId;
      setPlacedItems(prev => {
        let updatedItems = prev.map(item => {
          if (item.instanceId === instanceId) {
             return { ...item, x: Math.max(0, item.x + adjustedDeltaX), y: Math.max(0, item.y + adjustedDeltaY) };
          }
          return item;
        });

        // 3. Chemical to Container Drop Logic
        const draggedObj = updatedItems.find(i => i.instanceId === instanceId);
        if (draggedObj && ['water', 'kmno4', 'sodium', 'agno3', 'nacl', 'bacl2', 'na2so4', 'fe_powder', 'cuso4', 'h2c2o4', 'na2co3', 'hcl', 'zn_grain', 'cao', 'naoh_sol'].includes(draggedObj.templateId)) {
           const targetContainer = updatedItems.find(i => 
             i.instanceId !== instanceId && 
             ['beaker', 'test_tube'].includes(i.templateId) && 
             // Scale down the hitbox for chemistry drops tightly 
             Math.abs(i.x - draggedObj.x) < 70 && 
             Math.abs(i.y - draggedObj.y) < 70
           );

           if (targetContainer) {
             const currentContent = targetContainer.content;
             const instanceToUpdate = targetContainer.instanceId;

             // 1. DROPPING WATER
             if (draggedObj.templateId === 'water') {
                if (currentContent === 'Na (Rắn)') {
                  targetContainer.content = 'NaOH';
                  targetContainer.reactionState = 'violent';
                  setReactionInfo({ equation: `2Na + 2H₂O → 2NaOH + H₂↑`, condition: 'Tỏa nhiệt', description: `Phản ứng cháy nổ sinh khí Hydro.` });
                  setTimeout(() => {
                    setPlacedItems(currentItems => 
                      currentItems.map(item => 
                        item.instanceId === instanceToUpdate ? { ...item, reactionState: null } : item
                      )
                    );
                  }, 4000);
                } else if (currentContent === 'KMnO4 (Rắn)') {
                  targetContainer.content = 'KMnO4';
                  setReactionInfo({ equation: `KMnO₄ + H₂O → Purple Solution`, condition: 'Phân tán', description: `Thuốc tím (KMnO4) hòa tan tạo thành dung dịch màu tím đậm.` });
                } else if (!currentContent) {
                  targetContainer.content = 'H2O';
                  targetContainer.liquidColor = 'rgba(96, 165, 250, 0.6)';
                  setReactionInfo({ equation: `H₂O Added`, condition: 'Mixing', description: `Dung môi Nước cất (H2O) đã được thêm vào cốc.` });
                }
             } 
             // 2. DROPPING KMNO4
             else if (draggedObj.templateId === 'kmno4') {
                if (currentContent === 'H2O') {
                  targetContainer.content = 'KMnO4';
                  setReactionInfo({ equation: `KMnO₄ + H₂O → Purple Solution`, condition: 'Phân tán', description: `Thuốc tím (KMnO4) hòa tan tạo thành dung dịch màu tím đậm.` });
                } else if (!currentContent || currentContent.includes('(Rắn)')) {
                  targetContainer.content = 'KMnO4 (Rắn)';
                }
             }
             // 3. DROPPING SODIUM
             else if (draggedObj.templateId === 'sodium') {
                if (currentContent === 'H2O') {
                  targetContainer.content = 'NaOH';
                  targetContainer.reactionState = 'violent';
                  setReactionInfo({ equation: `2Na + 2H₂O → 2NaOH + H₂↑`, condition: 'Tỏa nhiệt', description: `Phản ứng cháy nổ sinh khí Hydro.` });
                  setTimeout(() => {
                    setPlacedItems(currentItems => 
                      currentItems.map(item => 
                        item.instanceId === instanceToUpdate ? { ...item, reactionState: null } : item
                      )
                    );
                  }, 4000);
                } else if (!currentContent || currentContent.includes('(Rắn)')) {
                  targetContainer.content = 'Na (Rắn)';
                }
             }
             // 4. DROPPING AgNO3
             else if (draggedObj.templateId === 'agno3') {
                if (currentContent === 'NaCl' || currentContent === 'HCl') {
                  targetContainer.content = currentContent === 'HCl' ? 'AgCl↓ + HNO₃' : 'AgCl↓ + NaNO₃';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.precipitateColor = 'rgba(255, 255, 255, 0.9)';
                  targetContainer.reactionState = 'precipitation';
                  setReactionInfo({ equation: `AgNO₃ + ${currentContent} → AgCl↓ + ...`, condition: 'Kết tủa trắng', description: 'Bạc Clorua kết tủa ngay lập tức.' });
                } else if (!currentContent) {
                  targetContainer.content = 'AgNO3';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
             }
             // 5. DROPPING NaCl
             else if (draggedObj.templateId === 'nacl') {
                if (currentContent === 'AgNO3') {
                  targetContainer.content = 'AgCl↓ + NaNO₃';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.precipitateColor = 'rgba(255, 255, 255, 0.9)';
                  targetContainer.reactionState = 'precipitation';
                  setReactionInfo({ equation: `AgNO₃ + NaCl → AgCl↓ + NaNO₃`, condition: 'Kết tủa trắng', description: 'Tạo thành kết tủa trắng Bạc Clorua.' });
                } else if (currentContent === 'BaCl2' || currentContent === 'Na2SO4') {
                  // No reaction, just add? For now ignore or label
                } else if (!currentContent) {
                  targetContainer.content = 'NaCl';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
             }
             // 6. DROPPING HCl
             else if (draggedObj.templateId === 'hcl') {
                if (currentContent === 'AgNO3') {
                  targetContainer.content = 'AgCl↓ + HNO₃';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.precipitateColor = 'rgba(255, 255, 255, 0.9)';
                  targetContainer.reactionState = 'precipitation';
                } else if (currentContent === 'Na2CO3') {
                  targetContainer.content = 'NaCl + CO₂↑ + H₂O';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.reactionState = 'violent';
                  setTimeout(() => setPlacedItems(prev => prev.map(it => it.instanceId === instanceToUpdate ? { ...it, reactionState: null } : it)), 3000);
                } else if (currentContent === 'Zn (Rắn)' || currentContent === 'Zn') {
                  targetContainer.content = 'ZnCl₂ + H₂↑';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.reactionState = 'violent';
                  setTimeout(() => setPlacedItems(prev => prev.map(it => it.instanceId === instanceToUpdate ? { ...it, reactionState: null } : it)), 3000);
                } else if (currentContent === 'NaOH') {
                  targetContainer.content = 'NaCl + H₂O';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                } else if (!currentContent) {
                  targetContainer.content = 'HCl';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
             }
             // 7. DROPPING BaCl2
             else if (draggedObj.templateId === 'bacl2') {
                if (currentContent === 'Na2SO4') {
                  targetContainer.content = 'BaSO₄↓ + 2NaCl';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.precipitateColor = 'rgba(255, 255, 255, 0.9)';
                  targetContainer.reactionState = 'precipitation';
                } else if (!currentContent) {
                  targetContainer.content = 'BaCl2';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
             }
             // 8. DROPPING Na2SO4
             else if (draggedObj.templateId === 'na2so4') {
                if (currentContent === 'BaCl2') {
                  targetContainer.content = 'BaSO₄↓ + 2NaCl';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.precipitateColor = 'rgba(255, 255, 255, 0.9)';
                  targetContainer.reactionState = 'precipitation';
                } else if (!currentContent) {
                  targetContainer.content = 'Na2SO4';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
             }
             // 9. DROPPING Fe (Powder)
             else if (draggedObj.templateId === 'fe_powder') {
                if (currentContent === 'CuSO4') {
                  targetContainer.content = 'FeSO₄ + Cu';
                  targetContainer.liquidColor = 'rgba(187, 247, 208, 0.7)';
                  targetContainer.precipitateColor = 'rgba(180, 83, 9, 0.8)'; // Copper deposit
                } else if (!currentContent) {
                  targetContainer.content = 'Fe (Rắn)';
                }
             }
             // 10. DROPPING CuSO4
             else if (draggedObj.templateId === 'cuso4') {
                if (currentContent === 'Fe (Rắn)' || currentContent === 'Fe') {
                  targetContainer.content = 'FeSO₄ + Cu';
                  targetContainer.liquidColor = 'rgba(187, 247, 208, 0.7)';
                  targetContainer.precipitateColor = 'rgba(180, 83, 9, 0.8)'; // Copper deposit
                } else if (!currentContent) {
                  targetContainer.content = 'CuSO4';
                  targetContainer.liquidColor = 'rgba(37, 99, 235, 0.6)';
                }
             }
             // 11. DROPPING H2C2O4
             else if (draggedObj.templateId === 'h2c2o4') {
                if (currentContent === 'KMnO4') {
                  targetContainer.content = 'Mn²⁺ (Colorless)';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.2)';
                } else if (!currentContent) {
                  targetContainer.content = 'H2C2O4';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
             }
             // 12. DROPPING Na2CO3
             else if (draggedObj.templateId === 'na2co3') {
                if (currentContent === 'HCl') {
                  targetContainer.content = 'NaCl + CO₂↑ + H₂O';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.reactionState = 'violent';
                  setTimeout(() => setPlacedItems(prev => prev.map(it => it.instanceId === instanceToUpdate ? { ...it, reactionState: null } : it)), 3000);
                } else if (!currentContent) {
                  targetContainer.content = 'Na2CO3';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
             }
             // 13. DROPPING Zn
             else if (draggedObj.templateId === 'zn_grain') {
                if (currentContent === 'HCl') {
                  targetContainer.content = 'ZnCl₂ + H₂↑';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                  targetContainer.reactionState = 'violent';
                  setTimeout(() => setPlacedItems(prev => prev.map(it => it.instanceId === instanceToUpdate ? { ...it, reactionState: null } : it)), 3000);
                } else if (!currentContent) {
                  targetContainer.content = 'Zn (Rắn)';
                }
             }
             // 14. DROPPING CaO
             else if (draggedObj.templateId === 'cao') {
                if (currentContent === 'H2O') {
                  targetContainer.content = 'Ca(OH)₂ (Hot)';
                  targetContainer.liquidColor = 'rgba(255, 255, 255, 0.8)';
                  targetContainer.reactionState = 'exothermic';
                } else if (!currentContent) {
                  targetContainer.content = 'CaO (Rắn)';
                }
             }
             // 15. DROPPING NaOH
             else if (draggedObj.templateId === 'naoh_sol') {
                if (currentContent === 'HCl') {
                  targetContainer.content = 'NaCl + H₂O';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                } else if (!currentContent) {
                  targetContainer.content = 'NaOH';
                  targetContainer.liquidColor = 'rgba(200, 230, 255, 0.7)';
                }
             }
             
             // Remove the dragged chemical solid/droplet from the canvas since it was deposited
             updatedItems = updatedItems.filter(i => i.instanceId !== instanceId);
           }
        }
        return checkProximity(updatedItems);
      });
    }
  };

  const filtered = inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#ecf0f1', overflow: 'hidden', position: 'relative' }} className="w-full">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* ================= LEFT COLUMN ================= */}
        <div style={{ width: isLeftOpen ? '320px' : '0', transition: 'width 0.3s ease', backgroundColor: '#fff', borderRight: '2px solid #e2e8f0', position: 'relative', flexShrink: 0, zIndex: 50 }}>
          <div style={{ display: isLeftOpen ? 'block' : 'none', width: '320px', height: '100%', padding: '24px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <h3 className="text-xl font-bold text-slate-800 border-b-2 border-blue-400 pb-3">📊 Phân tích Lab</h3>
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trạng thái/Phản ứng:</h4>
                <div className="p-4 bg-slate-50 border border-slate-100 font-mono text-sm text-red-500 rounded-xl shadow-inner">{reactionInfo.equation}</div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Điều kiện môi trường:</h4>
                <div className="p-3 bg-slate-50 border border-slate-100 text-sm text-slate-700 rounded-xl">{reactionInfo.condition}</div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mô tả chi tiết:</h4>
                <div className="p-4 bg-blue-50/50 border border-blue-100 text-sm leading-relaxed text-slate-700 rounded-xl">{reactionInfo.description}</div>
              </div>
            </div>
          </div>
          <button onClick={() => setIsLeftOpen(!isLeftOpen)} className="absolute -right-8 top-6 w-8 h-12 bg-white border border-slate-200 border-l-0 rounded-r-lg flex items-center justify-center cursor-pointer shadow-sm text-slate-500 hover:text-blue-500 z-50">
            {isLeftOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* ================= MIDDLE WORKSPACE ================= */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s ease' }} className="p-8">
          
          <div className="flex gap-4 w-full mb-6 items-center justify-between bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Virtual Chemistry Lab</h2>
            <div className="flex gap-3">
              <Button variant="outline" className="text-destructive hover:bg-red-50 hover:text-red-600 border-slate-200" onClick={() => { setPlacedItems([]); setReactionInfo({ equation: '-', condition: '-', description: 'Bàn làm việc đã được dọn sạch.' }); }}>
                 <Trash2 className="w-4 h-4 mr-2" /> Clear Desk
              </Button>
            </div>
          </div>

          <CentralWorkspace 
            placedItems={placedItems} 
            scale={scale} 
            setScale={setScale} 
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            onDeleteItem={handleDeleteItem}
          />
        </div>

        {/* ================= RIGHT COLUMN (INVENTORY) ================= */}
        <div style={{ width: isRightOpen ? '360px' : '0', transition: 'width 0.3s ease', backgroundColor: '#f8fafc', borderLeft: '2px solid #e2e8f0', position: 'relative', flexShrink: 0, zIndex: 50 }}>
          <button onClick={() => setIsRightOpen(!isRightOpen)} className="absolute -left-8 top-6 w-8 h-12 bg-white border border-slate-200 border-r-0 rounded-l-lg flex items-center justify-center cursor-pointer shadow-sm text-slate-500 hover:text-blue-500 z-50">
            {isRightOpen ? '▶' : '◀'}
          </button>

          <div style={{ display: isRightOpen ? 'flex' : 'none', flexDirection: 'column', height: '100%', width: '360px', boxSizing: 'border-box' }}>
            <div className="p-5 border-b border-slate-200 bg-white shadow-sm z-10">
              <div className="flex gap-2">
                <input type="text" placeholder="Tìm kiếm dụng cụ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
                <button onClick={() => setSidebarView(sidebarView === 'grid' ? 'list' : 'grid')} className="p-2 aspect-square bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100">
                  {sidebarView === 'grid' ? '☰' : '▦'}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', boxSizing: 'border-box' }} className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dụng Cụ Lab</h4>
                <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {filtered.filter(i => i.type === 'apparatus').map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dung Môi</h4>
                <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {filtered.filter(i => i.type === 'solvent').map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hóa Chất & Kim Loại</h4>
                <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {filtered.filter(i => i.type === 'chemical').map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* <DragOverlay dropAnimation={null}>
          {activeDragItem ? <DragPreview item={activeDragItem} /> : null}
        </DragOverlay> */}
        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
          {activeDragItem ? <DragPreview item={activeDragItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
