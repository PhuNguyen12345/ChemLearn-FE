import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import LabWorkspaceHeader from './components/LabWorkspaceHeader';
import '/Lab2.css';
import { Beaker, Box, Cloud, Droplet, Flame, Globe, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { INITIAL_INVENTORY, ITEM_TYPE, PHYSICAL_STATE } from './data/constants';
import { Toaster, toast } from 'sonner';
import { useLabStore } from './stores/useLabStore';
import mockAxitBazo from './data/mockAxitBazo.json';
import CentralWorkspace from './components/CentralWorkspace';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DraggableItem from './components/DraggableItem';
import DragPreview from './components/DragPreview';
import confetti from 'canvas-confetti';
import { LAB_TASKS_MOCK } from './data/labTasksMock';
import debounce from 'lodash/debounce';
import { saveVirtualLabProgress, enterVirtualLab, resetVirtualLab } from '@/lib/api';

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
  water: 'H2O',
  kmno4: 'KMnO4 (Rắn)',
  sodium: 'Na (Rắn)',
  agno3: 'AgNO3',
  nacl: 'NaCl',
  bacl2: 'BaCl2',
  na2so4: 'Na2SO4',
  fe_powder: 'Fe (Rắn)',
  cuso4: 'CuSO4',
  h2c2o4: 'H2C2O4',
  na2co3: 'Na2CO3',
  hcl: 'HCl',
  zn_grain: 'Zn (Rắn)',
  cao: 'CaO (Rắn)',
  naoh_sol: 'NaOH',
};

// Liquid colors shown when a chemical is deposited into an EMPTY container.
const EMPTY_DROP_LIQUID_COLOR = {
  water: 'rgba(96, 165, 250, 0.6)',
  agno3: 'rgba(200, 230, 255, 0.7)',
  nacl: 'rgba(200, 230, 255, 0.7)',
  bacl2: 'rgba(200, 230, 255, 0.7)',
  na2so4: 'rgba(200, 230, 255, 0.7)',
  cuso4: 'rgba(37, 99, 235, 0.6)',
  h2c2o4: 'rgba(200, 230, 255, 0.7)',
  na2co3: 'rgba(200, 230, 255, 0.7)',
  hcl: 'rgba(200, 230, 255, 0.7)',
  naoh_sol: 'rgba(200, 230, 255, 0.7)',
};

const FILTER_TABS = [
  { id: 'ALL', label: 'Tất cả', icon: <Globe className="w-7 h-7" /> },
  { id: 'CONTAINER', label: 'Bình phản ứng', icon: <Beaker className="w-7 h-7" /> },
  { id: 'EQUIPMENT', label: 'Thiết bị', icon: <Flame className="w-7 h-7" /> },
  { id: 'LIQUID', label: 'Chất lỏng', icon: <Droplet className="w-7 h-7" /> },
  { id: 'SOLID', label: 'Chất rắn', icon: <Box className="w-7 h-7" /> },
  { id: 'GAS', label: 'Chất khí', icon: <Cloud className="w-7 h-7" /> },
];


export default function VirtualLabPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarView, setSidebarView] = useState('grid');
  const [saveState, setSaveState] = useState('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const markAsFinished = useLabStore(state => state.markAsFinished);
  const progress = useLabStore(state => state.progress);
  const maxScore = useLabStore(state => state.metadata?.max_score) || 50;
  const score = progress?.score || 0;

  useEffect(() => {
    if (score >= maxScore && maxScore > 0 && !progress.is_finished) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#fbbf24', '#34d399', '#ef4444'],
        zIndex: 1000
      });
      setShowModal(true);
      markAsFinished();
    }
  }, [score, maxScore, progress.is_finished, markAsFinished]);

  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  //for closing both filter and inventory 
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);
  //saving current filter status 
  const [activeFilter, setActiveFilter] = useState('ALL');

  // New Free-form & Zoom State
  // Global CSLS State
  const { 
    initFromTemplate, loadLabProgress, resetLabState, workspace: placedItems, setWorkspace: setPlacedItems, removeWorkspaceItem, 
    updateWorkspaceItem, addWorkspaceItem, reactionInfo, setReactionInfo,
    progress: currentProgress, completeTask, tasks 
  } = useLabStore();
  const viewport = useLabStore(state => state.viewport);
  const scale = viewport.zoom_scale;

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

  // Khởi tạo bàn thí nghiệm
  useEffect(() => {
    const fetchLab = async () => {
      setIsLoading(true);
      try {
        if (id === 'new') {
          initFromTemplate(mockAxitBazo);
          useLabStore.getState().initTasks(LAB_TASKS_MOCK.AXIT_BAZO);
        } else {
          const data = await enterVirtualLab(id);
          // TODO: Tùy theo category từ BE để chọn mock tương ứng. Tạm thời dùng AXIT_BAZO
          loadLabProgress(data, LAB_TASKS_MOCK.AXIT_BAZO);
        }
      } catch (error) {
        console.error("Lỗi khi tải bài lab:", error);
        toast.error("Không thể tải bài thực hành. Vui lòng thử lại sau.", { position: 'bottom-right' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLab();

    return () => {
      useLabStore.getState().clearWorkspace();
    };
  }, [id, initFromTemplate, loadLabProgress]);

  // Reset Lab
  const handleResetLab = async () => {
    setShowResetConfirm(false);
    // [FIX #1] Nạp động danh sách task theo category của bài Lab đang chạy
    const currentCategory = useLabStore.getState().metadata?.category || 'AXIT_BAZO';
    const freshTaskList = LAB_TASKS_MOCK[currentCategory] || [];

    if (id === 'new') {
      resetLabState(freshTaskList);
      return;
    }
    try {
      await resetVirtualLab(id);
      resetLabState(freshTaskList);
      toast.success('Đã làm mới bài thí nghiệm!', { position: 'bottom-right' });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể reset bài Lab.', { position: 'bottom-right' });
    }
  };

  // Auto-save với Debounce
  const debouncedSave = useMemo(
    () => debounce(async (payload) => {
      const isMockMode = id === 'new';
      if (isMockMode) {
        console.log('Saved data (Mock Sandbox)', payload);
      } else {
        setSaveState('saving');
        try {
          await saveVirtualLabProgress(id, payload);
          setSaveState('saved');
          setTimeout(() => setSaveState('idle'), 2000);
        } catch (error) {
          console.error("Lỗi khi lưu tiến trình lab:", error);
          setSaveState('idle');
          toast.error("Mất kết nối! Chưa thể lưu tiến trình lab.", { position: "bottom-right" });
        }
      }
    }, 1500),
    [id]
  );

  useEffect(() => {
    const payload = {
      currentScore: currentProgress.score,
      progressPercent: currentProgress.percent,
      status: currentProgress.percent === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      currentWorkspace: placedItems,
      viewport: viewport,
      completedActions: currentProgress.completed_actions || []
    };
    debouncedSave(payload);
  }, [currentProgress.score, currentProgress.percent, placedItems, viewport, debouncedSave]);

  useEffect(() => {
    const handleClearDesk = () => {
      useLabStore.getState().clearWorkspace();
    };
    window.addEventListener('clear-lab-desk', handleClearDesk);
    return () => window.removeEventListener('clear-lab-desk', handleClearDesk);
  }, []);

  const activeDragItem = useMemo(() => {
    if (!activeDragData) return null;
    if (activeDragData.source === 'sidebar') return inventory.find(i => i.id === activeDragData.templateId);
    if (activeDragData.source === 'canvas') return inventory.find(i => i.id === activeDragData.templateId);
    return null;
  }, [activeDragData, inventory]);

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

      // Ghi nhận Task chuẩn bị dụng cụ
      if (sourceData.templateId === 'beaker' || sourceData.templateId === 'test_tube') {
        completeTask('DRAG_FLASK_TO_WORKSPACE');
      }
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
          const targetContainerIndex = updatedItems.findIndex(
            i =>
              i.instanceId !== instanceId &&
              ['beaker', 'test_tube'].includes(i.templateId) &&
              Math.abs(i.x - draggedObj.x) < 70 &&
              Math.abs(i.y - draggedObj.y) < 70
          );

          if (targetContainerIndex !== -1) {
            let targetContainer = { ...updatedItems[targetContainerIndex] };
            const currentContent = targetContainer.content;
            const instanceToUpdate = targetContainer.instanceId;

            // Translate the dragged item's templateId to its canonical content name.
            // For kmno4 we use the canonical 'KMnO4 (Rắn)' in the key lookup.
            const draggedContentName = TEMPLATE_TO_CONTENT[draggedObj.templateId];

            // Build the bi-directional lookup key.
            const key = getReactionKey(currentContent, draggedContentName);
            const reaction = REACTION_MAP[key];

            if (reaction && currentContent) {
              // ── REACTION FOUND ──────────────────────────────────────────
              
              // GAMIFICATION: Nhận thưởng EXP và Toast
              const previousActions = useLabStore.getState().progress.completed_actions;
              if (!previousActions.includes(key)) {
                toast.success(`Phản ứng mới: ${reaction?.reactionInfo?.equation || key}`, {
                  description: "Bạn nhận được EXP!",
                  position: 'bottom-right'
                });
                useLabStore.getState().recordReaction(key);
                completeTask(key);
              }

              // Apply multi-layer content fields
              targetContainer.liquidContent = reaction.liquidContent ?? null;
              targetContainer.solidContent = reaction.solidContent ?? null;
              targetContainer.gasContent = reaction.gasContent ?? null;
              // Keep legacy `content` in sync for any backward-compat code paths
              targetContainer.content =
                reaction.liquidContent ?? reaction.solidContent ?? null;

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
              // ── EMPTY CONTAINER: deposit chemical ────────────────────────
              const originalItem = INITIAL_INVENTORY.find(item => item.id === draggedObj.templateId);
              const isSolid = originalItem?.state === PHYSICAL_STATE.SOLID || draggedContentName.includes('(Rắn)');

              if (isSolid) {
                // Solids render as a bottom solid layer with no liquid above
                targetContainer.solidContent = draggedContentName;
                targetContainer.liquidContent = null;
                targetContainer.content = draggedContentName; // compat
              } else {
                // Liquids/solutions fill the liquid layer
                targetContainer.liquidContent = draggedContentName;
                targetContainer.solidContent = null;
                targetContainer.content = draggedContentName; // compat
                const liquidColor = EMPTY_DROP_LIQUID_COLOR[draggedObj.templateId];
                if (liquidColor) targetContainer.liquidColor = liquidColor;
              }

              setReactionInfo({
                equation: `${draggedContentName} Added`,
                condition: 'Mixing',
                description: `${draggedContentName} đã được thêm vào dụng cụ.`,
              });

              // Ghi nhận Task châm hóa chất đầu tiên
              const actionName = `DRAG_${draggedContentName.toUpperCase()}_TO_FLASK`;
              completeTask(actionName);
            }
            // else: container already has content and no matching reaction → ignore drop

            // Đưa container đã được cập nhật nội dung vào lại mảng
            updatedItems[targetContainerIndex] = targetContainer;

            // Remove the dragged chemical from the canvas once deposited
            updatedItems = updatedItems.filter(i => i.instanceId !== instanceId);
          }
        }
        return checkProximity(updatedItems);
      });
    }
  };

  //this is for filtering inventory with filter bar before searching 
  const filteredInventory = useMemo(() => {
    if (activeFilter === 'ALL') return inventory;
    if (activeFilter === 'EQUIPMENT') return inventory.filter(item => item.type === ITEM_TYPE.EQUIPMENT);
    if (activeFilter === 'CONTAINER') return inventory.filter(item => item.type === ITEM_TYPE.CONTAINER);
    if (activeFilter === 'LIQUID') return inventory.filter(item => item.state === PHYSICAL_STATE.LIQUID);
    if (activeFilter === 'SOLID') return inventory.filter(item => item.state === PHYSICAL_STATE.SOLID);
    if (activeFilter === 'GAS') return inventory.filter(item => item.state === PHYSICAL_STATE.GAS);
    return inventory;
  }, [inventory, activeFilter])
  //this is filter by query using searchBar only 
  const filtered = filteredInventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
      <div className="flex flex-col h-screen w-full overflow-hidden absolute inset-0 z-50">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Đang tải bàn thí nghiệm...</p>
          </div>
        ) : (
          <>
            <LabWorkspaceHeader 
              onBack={() => navigate('/student/virtual-lab')} 
              titleText={id === 'new' ? 'Untitled Experiment' : useLabStore.getState().metadata?.title || 'My Saved Lab'} 
              labId={id}
              saveState={saveState}
              onResetClick={() => setShowResetConfirm(true)}
              onSaveClick={() => {
                if (saveState !== 'idle') return;
                const payload = {
                  currentScore: currentProgress.score,
                  progressPercent: currentProgress.percent,
                  status: currentProgress.percent === 100 ? 'COMPLETED' : 'IN_PROGRESS',
                  currentWorkspace: placedItems,
                  viewport: viewport,
                  completedActions: currentProgress.completed_actions || []
                };
                debouncedSave(payload);
                debouncedSave.flush();
              }}
            />
            <div style={{ display: 'flex', height: '100%', backgroundColor: '#ecf0f1', overflow: 'hidden', position: 'relative' }} className="w-full flex-1">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* ================= LEFT COLUMN ================= */}
        <div style={{ width: isLeftOpen ? '320px' : '0', transition: 'width 0.3s ease', backgroundColor: '#fff', borderRight: '2px solid #e2e8f0', position: 'relative', flexShrink: 0, zIndex: 50 }}>
          <div style={{ display: isLeftOpen ? 'block' : 'none', width: '320px', height: '100%', padding: '24px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <h3 className="text-xl font-bold text-slate-800 border-b-2 border-blue-400 pb-3">📊 Phân tích Lab</h3>

            <div className="mt-6 space-y-4">
              {/* Nhiệm vụ / Tasks */}
              {tasks && tasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nhiệm vụ cần làm:</h4>
                  <ul className="space-y-2">
                    {tasks.map(task => (
                      <li key={task.id} className="flex items-start gap-2 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="shrink-0 mt-0.5 text-base">
                          {task.isCompleted ? (
                            <span className="text-emerald-500 font-bold">☑</span>
                          ) : (
                            <span className="text-slate-300 font-bold">☐</span>
                          )}
                        </span>
                        <span className={`text-slate-700 leading-snug ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
                          {task.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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


          <CentralWorkspace
            placedItems={placedItems}
            scale={scale}
            setScale={useLabStore.getState().setViewportScale}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            onDeleteItem={handleDeleteItem}
          />
        </div>

        {/* ================= RIGHT COLUMN (INVENTORY) ================= */}
        <div style={{ width: isRightOpen ? '450px' : '0', transition: 'width 0.3s ease', backgroundColor: '#f8fafc', borderLeft: '2px solid #e2e8f0', display: 'flex', position: 'relative', flexShrink: 0, zIndex: 50 }}>
          <button onClick={() => setIsRightOpen(!isRightOpen)} className="absolute -left-8 top-6 w-8 h-12 bg-white border border-slate-200 border-r-0 rounded-l-lg flex items-center justify-center cursor-pointer shadow-sm text-slate-500 hover:text-blue-500 z-50">
            {isRightOpen ? '▶' : '◀'}
          </button>

          <div style={{ display: isRightOpen ? 'flex' : 'none', width: '100%', height: '100%' }}>
            {/* 2. THANH FILTER DỌC (DARK MODE) NẰM TRÁI */}
            <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 shrink-0 shadow-sm z-20">
              <TooltipProvider delayDuration={100}>
                {FILTER_TABS.map((tab) => (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveFilter(tab.id)}
                        className={`w-14 h-14 rounded-xl transition-all duration-200 ${activeFilter === tab.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 hover:bg-blue-500' // Trạng thái đang chọn
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' // Trạng thái chưa chọn
                          }`}
                      >
                        {tab.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="font-semibold bg-white text-slate-800 border border-slate-200 shadow-sm text-base px-4 py-2.5">
                      {tab.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>

            {/* BỔ SUNG THẺ BỌC Ở ĐÂY ĐỂ TRÁNH ITEMS NẰM NGANG */}
            <div className="flex-1 bg-slate-50 flex flex-col h-full border-l-2 border-slate-200 overflow-hidden box-border">
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
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bình phản ứng</h4>
                  <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {filtered.filter(i => i.type === ITEM_TYPE.CONTAINER).map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dụng cụ</h4>
                  <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {filtered.filter(i => i.type === ITEM_TYPE.EQUIPMENT).map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chất lỏng</h4>
                  <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {filtered.filter(i => i.state === PHYSICAL_STATE.LIQUID).map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chất rắn</h4>
                  <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {filtered.filter(i => i.state === PHYSICAL_STATE.SOLID).map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
                  </div>
                </div>
              </div>

            </div> {/* ĐÓNG THẺ BỌC KHO ĐỒ */}
          </div>
        </div>

        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
          {activeDragItem ? <DragPreview item={activeDragItem} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Celebration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
              <span className="text-6xl filter drop-shadow-md">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Tuyệt vời! Bạn đã phá đảo!</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Bạn đã khám phá ra toàn bộ các phương trình phản ứng được yêu cầu trong bài học này. 
              <br/><span className="inline-block mt-3 font-bold text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full shadow-inner">{score} / {maxScore} EXP</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1 h-11 border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Khám phá tiếp 🧪
              </Button>
              <Button 
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                onClick={() => {
                  useLabStore.getState().serializeLabState();
                  setShowModal(false);
                  navigate('/student/virtual-lab');
                }}
              >
                💾 Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ====== RESET CONFIRM DIALOG ====== */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <RotateCcw className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Làm lại từ đầu?</h3>
              <p className="text-sm text-slate-500">Toàn bộ tiến trình, điểm số và bàn làm việc sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setShowResetConfirm(false)}
              >
                Huỷ
              </Button>
              <Button
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white"
                onClick={handleResetLab}
              >
                Xác nhận Reset
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
        )}
      </div>
  );
}
