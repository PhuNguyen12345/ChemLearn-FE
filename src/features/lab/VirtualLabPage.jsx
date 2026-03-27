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

// ---------------------------------------------------------------------------
// REACTION_MAP  –  Strategy Pattern / Data-Driven Lookup Dictionary
//
// Key: alphabetically sorted reactant names joined by '_'
//      e.g. dropping Na into H2O  →  key = 'H2O_Na (Rắn)'
//
// Schema (multi-layer rendering):
//   • liquidContent    – text label shown inside the liquid layer
//   • solidContent     – text label shown inside the solid/precipitate bottom layer (optional)
//   • gasContent       – text label attached to smoke particles (optional)
//   • liquidColor      – updated beaker liquid tint (optional)
//   • precipitateColor – precipitate/solid layer tint (optional)
//   • reactionState    – CSS animation state: 'violent'|'precipitation'|'exothermic' (optional)
//   • clearStateAfter  – ms after which reactionState is auto-reset to null (optional)
//   • reactionInfo     – { equation, condition, description } shown in the left panel
// ---------------------------------------------------------------------------
const REACTION_MAP = {
  // 1. Na (solid) + H2O  →  NaOH  (violent, H₂ gas label, clears after 4 s)
  'H2O_Na (Rắn)': {
    liquidContent: 'NaOH',
    gasContent: 'H₂',
    liquidColor: '#ec4899',
    reactionState: 'violent',
    clearStateAfter: 4000,
    reactionInfo: {
      equation: '2Na + 2H₂O → 2NaOH + H₂↑',
      condition: 'Tỏa nhiệt',
      description: 'Phản ứng cháy nổ sinh khí Hydro.',
    },
  },

  // 2. KMnO4 (solid) + H2O  →  Purple Solution
  'H2O_KMnO4 (Rắn)': {
    liquidContent: 'KMnO4',
    liquidColor: '#AC26EF',
    reactionInfo: {
      equation: 'KMnO₄ + H₂O → Purple Solution',
      condition: 'Phân tán',
      description: 'Thuốc tím (KMnO4) hòa tan tạo thành dung dịch màu tím đậm.',
    },
  },

  // 3. KMnO4 (templateId) dissolving into H2O
  'H2O_kmno4_template': {
    liquidContent: 'KMnO4',
    liquidColor: '#AC26EF',
    reactionInfo: {
      equation: 'KMnO₄ + H₂O → Purple Solution',
      condition: 'Phân tán',
      description: 'Thuốc tím (KMnO4) hòa tan tạo thành dung dịch màu tím đậm.',
    },
  },

  // 4. AgNO3 + NaCl  →  AgCl↓ + NaNO₃
  'AgNO3_NaCl': {
    liquidContent: 'NaNO₃',
    solidContent: 'AgCl↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
      condition: 'Kết tủa trắng',
      description: 'Tạo thành kết tủa trắng Bạc Clorua.',
    },
  },

  // 5. AgNO3 + HCl  →  AgCl↓ + HNO₃
  'AgNO3_HCl': {
    liquidContent: 'HNO₃',
    solidContent: 'AgCl↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'AgNO₃ + HCl → AgCl↓ + HNO₃',
      condition: 'Kết tủa trắng',
      description: 'Bạc Clorua kết tủa ngay lập tức.',
    },
  },

  // 6. BaCl2 + Na2SO4  →  BaSO₄↓ + 2NaCl
  'BaCl2_Na2SO4': {
    liquidContent: '2NaCl',
    solidContent: 'BaSO₄↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl',
      condition: 'Kết tủa trắng',
      description: 'Bari Sunfat kết tủa trắng không tan trong axit.',
    },
  },

  // 7. Fe (Rắn) + CuSO4  →  FeSO₄ (liquid) + Cu (copper precipitate deposit)
  'CuSO4_Fe (Rắn)': {
    liquidContent: 'FeSO₄',
    solidContent: 'Cu',
    liquidColor: 'rgba(187, 247, 208, 0.7)',
    precipitateColor: 'rgba(180, 83, 9, 0.8)',
    reactionInfo: {
      equation: 'Fe + CuSO₄ → FeSO₄ + Cu↓',
      condition: 'Nhiệt độ thường',
      description: 'Sắt đẩy đồng ra khỏi dung dịch, đồng bám vào thanh sắt.',
    },
  },

  // 8. H2C2O4 + KMnO4  →  Mn²⁺ (Colorless) — color fades to near-transparent
  'H2C2O4_KMnO4': {
    liquidContent: 'Mn²⁺',
    liquidColor: 'rgba(200, 230, 255, 0.15)',
    reactionInfo: {
      equation: '2KMnO₄ + 5H₂C₂O₄ + 3H₂SO₄ → 2MnSO₄ + 10CO₂↑ + 8H₂O',
      condition: 'Mất màu tím',
      description: 'Axit oxalic khử KMnO4 tím thành Mn²⁺ không màu.',
    },
  },

  // 9. Na2CO3 + HCl  →  NaCl + CO₂↑ + H₂O  (violent, CO₂ gas label, clears after 3 s)
  'HCl_Na2CO3': {
    liquidContent: 'NaCl + H₂O',
    gasContent: 'CO₂',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionState: 'violent',
    clearStateAfter: 3000,
    reactionInfo: {
      equation: 'Na₂CO₃ + 2HCl → 2NaCl + CO₂↑ + H₂O',
      condition: 'Sủi bọt mạnh',
      description: 'Natri Cacbonat phản ứng với axit clohidric giải phóng CO₂.',
    },
  },

  // 10. Zn (solid/grain) + HCl  →  ZnCl₂ (liquid) + H₂↑ (gas label, clears after 3 s)
  'HCl_Zn (Rắn)': {
    liquidContent: 'ZnCl₂',
    gasContent: 'H₂',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionState: 'violent',
    clearStateAfter: 3000,
    reactionInfo: {
      equation: 'Zn + 2HCl → ZnCl₂ + H₂↑',
      condition: 'Sủi bọt',
      description: 'Kẽm hòa tan trong axit clohidric tạo khí Hydro.',
    },
  },

  // 11. NaOH + HCl  →  NaCl + H₂O
  'HCl_NaOH': {
    liquidContent: 'NaCl + H₂O',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionInfo: {
      equation: 'NaOH + HCl → NaCl + H₂O',
      condition: 'Trung hòa',
      description: 'Phản ứng trung hòa giữa bazơ và axit tạo muối và nước.',
    },
  },

  // 12. CaO + H2O  →  Ca(OH)₂ (exothermic)
  'CaO (Rắn)_H2O': {
    liquidContent: 'Ca(OH)₂',
    liquidColor: 'rgba(255, 255, 255, 0.8)',
    reactionState: 'exothermic',
    reactionInfo: {
      equation: 'CaO + H₂O → Ca(OH)₂',
      condition: 'Tỏa nhiệt mạnh',
      description: 'Canxi oxit phản ứng mãnh liệt với nước tạo Canxi hidroxit.',
    },
  },
};

// ---------------------------------------------------------------------------
// Helper: build a bi-directional lookup key from two reactant labels.
// Sorting alphabetically means 'H2O + Na' and 'Na + H2O' map to the same key.
// ---------------------------------------------------------------------------
const getReactionKey = (a, b) => [a, b].sort().join('_');

// ---------------------------------------------------------------------------
// templateId → the string that is placed as the initial container content
// when dropping a solid/chemical with no reaction target.
// Also used to map the templateId to the canonical content name before
// looking up reactions.
// ---------------------------------------------------------------------------
const TEMPLATE_TO_CONTENT = {
  water:     'H2O',
  kmno4:     'KMnO4 (Rắn)',
  sodium:    'Na (Rắn)',
  agno3:     'AgNO3',
  nacl:      'NaCl',
  bacl2:     'BaCl2',
  na2so4:    'Na2SO4',
  fe_powder: 'Fe (Rắn)',
  cuso4:     'CuSO4',
  h2c2o4:   'H2C2O4',
  na2co3:    'Na2CO3',
  hcl:       'HCl',
  zn_grain:  'Zn (Rắn)',
  cao:       'CaO (Rắn)',
  naoh_sol:  'NaOH',
};

// Liquid colors shown when a chemical is deposited into an EMPTY container.
const EMPTY_DROP_LIQUID_COLOR = {
  water:     'rgba(96, 165, 250, 0.6)',
  agno3:     'rgba(200, 230, 255, 0.7)',
  nacl:      'rgba(200, 230, 255, 0.7)',
  bacl2:     'rgba(200, 230, 255, 0.7)',
  na2so4:    'rgba(200, 230, 255, 0.7)',
  cuso4:     'rgba(37, 99, 235, 0.6)',
  h2c2o4:   'rgba(200, 230, 255, 0.7)',
  na2co3:    'rgba(200, 230, 255, 0.7)',
  hcl:       'rgba(200, 230, 255, 0.7)',
  naoh_sol:  'rgba(200, 230, 255, 0.7)',
};

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

        // 3. Chemical-to-Container Drop Logic (Data-Driven Strategy Pattern)
        const draggedObj = updatedItems.find(i => i.instanceId === instanceId);
        if (
          draggedObj &&
          Object.prototype.hasOwnProperty.call(TEMPLATE_TO_CONTENT, draggedObj.templateId)
        ) {
          const targetContainer = updatedItems.find(
            i =>
              i.instanceId !== instanceId &&
              ['beaker', 'test_tube'].includes(i.templateId) &&
              Math.abs(i.x - draggedObj.x) < 70 &&
              Math.abs(i.y - draggedObj.y) < 70
          );

          if (targetContainer) {
            const currentContent  = targetContainer.content;
            const instanceToUpdate = targetContainer.instanceId;

            // Translate the dragged item's templateId to its canonical content name.
            // For kmno4 we use the canonical 'KMnO4 (Rắn)' in the key lookup.
            const draggedContentName = TEMPLATE_TO_CONTENT[draggedObj.templateId];

            // Build the bi-directional lookup key.
            const key = getReactionKey(currentContent, draggedContentName);
            const reaction = REACTION_MAP[key];

            if (reaction && currentContent) {
              // ── REACTION FOUND ──────────────────────────────────────────
              // Apply multi-layer content fields
              targetContainer.liquidContent    = reaction.liquidContent ?? null;
              targetContainer.solidContent     = reaction.solidContent  ?? null;
              targetContainer.gasContent       = reaction.gasContent    ?? null;
              // Keep legacy `content` in sync for any backward-compat code paths
              targetContainer.content =
                reaction.liquidContent ?? reaction.solidContent ?? null;

              if (reaction.liquidColor)      targetContainer.liquidColor      = reaction.liquidColor;
              if (reaction.precipitateColor) targetContainer.precipitateColor = reaction.precipitateColor;
              if (reaction.reactionState)    targetContainer.reactionState    = reaction.reactionState;
              if (reaction.reactionInfo)     setReactionInfo(reaction.reactionInfo);

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
              // ── EMPTY CONTAINER: deposit chemical ────────────────────────
              const isSolid = draggedContentName.includes('(Rắn)');

              if (isSolid) {
                // Solids render as a bottom solid layer with no liquid above
                targetContainer.solidContent  = draggedContentName;
                targetContainer.liquidContent = null;
                targetContainer.content       = draggedContentName; // compat
              } else {
                // Liquids/solutions fill the liquid layer
                targetContainer.liquidContent = draggedContentName;
                targetContainer.solidContent  = null;
                targetContainer.content       = draggedContentName; // compat
                const liquidColor = EMPTY_DROP_LIQUID_COLOR[draggedObj.templateId];
                if (liquidColor) targetContainer.liquidColor = liquidColor;
              }

              setReactionInfo({
                equation:    `${draggedContentName} Added`,
                condition:   'Mixing',
                description: `${draggedContentName} đã được thêm vào dụng cụ.`,
              });
            }
            // else: container already has content and no matching reaction → ignore drop

            // Remove the dragged chemical from the canvas once deposited
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
