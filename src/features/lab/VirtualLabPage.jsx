import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import LabWorkspaceHeader from './components/LabWorkspaceHeader';
import '/Lab2.css';
import { RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { INITIAL_INVENTORY, ITEM_TYPE, PHYSICAL_STATE } from './data/constants';
import { Toaster } from 'sonner';
import { useLabStore } from './stores/useLabStore';
import CentralWorkspace from './components/CentralWorkspace';
import DragPreview from './components/DragPreview';
import LabAnalysisPanel from './components/LabAnalysisPanel';
import LabInventoryPanel from './components/LabInventoryPanel';
import LabConfirmDialog from './components/LabConfirmDialog';
import { useLabLifecycle } from './hooks/useLabLifecycle';
import { useLabDragDrop } from './hooks/useLabDragDrop';
import { useLabTimer } from './hooks/useLabTimer';




export default function VirtualLabPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ── Lifecycle: fetch, save, reset, modal ─────────────────────────────────
  const {
    isLoading,
    saveState,
    showResetConfirm,
    setShowResetConfirm,
    showModal,
    setShowModal,
    handleResetLab,
    debouncedSave,
    handleSubmitAssignment,
  } = useLabLifecycle(id);

  const durationMinutes = useLabStore(state => state.durationMinutes);
  const labType = useLabStore(state => state.labType);

  // Auto-submit when time is up
  const handleTimeUp = async () => {
    const success = await handleSubmitAssignment();
    if (success) {
      setTimeout(() => navigate('/student/virtual-lab'), 1500);
    }
  };

  const { formattedTime } = useLabTimer(
    durationMinutes, 
    handleTimeUp, 
    labType === 'ASSIGNMENT' && !isLoading
  );

  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarView, setSidebarView] = useState('grid');

  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // ── Store state ───────────────────────────────────────────────────────────
  const progress = useLabStore(state => state.progress);
  const maxScore = useLabStore(state => state.metadata?.max_score) || 50;
  const score = progress?.score || 0;
  const { 
    workspace: placedItems, setWorkspace: setPlacedItems,
    reactionInfo, setReactionInfo,
    progress: currentProgress, completeTask, tasks 
  } = useLabStore();
  const viewport = useLabStore(state => state.viewport);
  const scale = viewport.zoom_scale;

  // Drag state & handlers
  const { activeDragItem, handleDragStart, handleDragEnd } = useLabDragDrop({ scale, inventory });

  // Selection & keyboard delete state
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleDeleteItem = (itemId) => {
    setPlacedItems(prev => prev.filter(item => item.instanceId !== itemId));
    if (selectedItemId === itemId) setSelectedItemId(null);
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      if (selectedItemId && (e.key === 'Delete' || e.key === 'Backspace')) {
        handleDeleteItem(selectedItemId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId]);

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
              titleText={useLabStore.getState().metadata?.title || 'My Saved Lab'} 
              labId={id}
              saveState={saveState}
              labType={labType}
              formattedTime={formattedTime}
              onResetClick={() => setShowResetConfirm(true)}
              onSubmitClick={async () => {
                const success = await handleSubmitAssignment();
                if (success) {
                  setTimeout(() => navigate('/student/virtual-lab'), 1500);
                }
              }}
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
        <LabAnalysisPanel
          tasks={tasks}
          reactionInfo={reactionInfo}
          isOpen={isLeftOpen}
          onToggle={() => setIsLeftOpen(!isLeftOpen)}
          labType={labType}
        />

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
        <LabInventoryPanel
          filtered={filtered}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sidebarView={sidebarView}
          onViewToggle={() => setSidebarView(sidebarView === 'grid' ? 'list' : 'grid')}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          isOpen={isRightOpen}
          onToggle={() => setIsRightOpen(!isRightOpen)}
        />

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
      <LabConfirmDialog
        isOpen={showResetConfirm}
        icon={<RotateCcw className="w-7 h-7" />}
        iconBgColor="bg-red-100"
        iconColor="text-red-500"
        title="Làm lại từ đầu?"
        message="Toàn bộ tiến trình, điểm số và bàn làm việc sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận Reset"
        confirmClassName="bg-red-500 hover:bg-red-600 text-white"
        onConfirm={handleResetLab}
        onCancel={() => setShowResetConfirm(false)}
      />

    </>
        )}
      </div>
  );
}
