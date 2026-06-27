import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import confetti from 'canvas-confetti';
import { useLabStore } from '../stores/useLabStore';
import { getLabTasks } from '../data/labTasksMock';
import { saveVirtualLabProgress, enterVirtualLab, resetVirtualLab, renameVirtualLab, getInventoryItems } from '@/lib/api';
import { getGamificationProfile } from '@/api/studentApi';
import { useStudentStore } from '@/stores/useStudentStore';

const AUTO_SAVE_IDLE_DELAY_MS = 5000;

/**
 * useLabLifecycle
 *
 * Manages the full lifecycle of a Virtual Lab session:
 *   - Fetching & loading lab data on mount
 *   - Auto-saving progress with debounce
 *   - Resetting lab (API + local state)
 *   - Triggering the completion modal & confetti
 *   - Cleaning up workspace on unmount
 *
 * @param {string} labId - the lab ID from route params ('new' for sandbox mode)
 * @returns {{ isLoading, saveState, showResetConfirm, setShowResetConfirm, showModal, setShowModal, handleResetLab, debouncedSave }}
 */
export function useLabLifecycle(labId) {
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const idleTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      window.clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  // Store selectors
  const { initFromTemplate, loadLabProgress, resetLabState } = useLabStore();
  const markAsFinished = useLabStore(state => state.markAsFinished);
  const progress = useLabStore(state => state.progress);
  const currentProgress = progress;
  const maxScore = useLabStore(state => state.metadata?.max_score) || 50;
  const score = progress?.score || 0;
  const placedItems = useLabStore(state => state.workspace);
  const viewport = useLabStore(state => state.viewport);

  // ─── 1. Fetch & initialise lab on mount ────────────────────────────────────
  useEffect(() => {
    let isCancelled = false;
    const fetchLab = async () => {
      setIsLoading(true);
      try {
        const [data, inventoryData] = await Promise.all([
          enterVirtualLab(labId),
          getInventoryItems()
        ]);
        
        // ADAPTER LOGIC: Map the id to itemCode so that DnD kit and reaction map work flawlessly
        const backwardCompatibleInventory = inventoryData.map(dbItem => ({
          ...dbItem,
          id: dbItem.itemCode,
          // Extract nested properties safely if present
          ...(dbItem.properties 
              ? (typeof dbItem.properties === 'string' ? JSON.parse(dbItem.properties) : dbItem.properties) 
              : {})
        }));
        
        useLabStore.getState().setInventoryItems(backwardCompatibleInventory);
        
        if (isCancelled || !isMountedRef.current) return;
        loadLabProgress(data, getLabTasks(data));
      } catch (error) {
        if (isCancelled || !isMountedRef.current) return;
        console.error('Lỗi khi tải bài lab:', error);
        toast.error('Không thể tải bài thực hành. Vui lòng thử lại sau.', { position: 'bottom-right' });
      } finally {
        if (!isCancelled && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchLab();

    return () => {
      isCancelled = true;
      useLabStore.getState().clearWorkspace();
    };
  }, [labId, initFromTemplate, loadLabProgress]);

  // ─── 2. Completion confetti & modal ────────────────────────────────────────
  useEffect(() => {
    const labType = useLabStore.getState().labType;
    if (labType === 'PREMADE' && score >= maxScore && maxScore > 0 && !progress.is_finished) {
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

  // ─── 3. Auto-save debounce ──────────────────────────────────────────────────
  const debouncedSave = useMemo(
    () => debounce(async (payload) => {
      if (!isMountedRef.current) return;
      window.clearTimeout(idleTimeoutRef.current);
      setSaveState('saving');
      try {
        await saveVirtualLabProgress(labId, payload);
        if (!isMountedRef.current) return;
        
        // Nạp lại Gamification Profile nếu hoàn thành bài (để update UI XP/Vàng)
        if (payload.status === 'COMPLETED') {
          try {
            const profile = await getGamificationProfile();
            useStudentStore.getState().setGamificationProfile(profile);
          } catch (syncError) {
            console.error('Không thể đồng bộ XP/Vàng:', syncError);
          }
        }

        setSaveState('saved');
        idleTimeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current) setSaveState('idle');
        }, 2000);
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error('Lỗi khi lưu tiến trình lab:', error);
        setSaveState('idle');
        toast.error('Mất kết nối! Chưa thể lưu tiến trình lab.', { position: 'bottom-right' });
      }
    }, AUTO_SAVE_IDLE_DELAY_MS),
    [labId]
  );

  // ─── 4. Auto-save trigger on state change ──────────────────────────────────
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

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

  // ─── 5. Clear desk event listener ──────────────────────────────────────────
  useEffect(() => {
    const handleClearDesk = () => {
      useLabStore.getState().clearWorkspace();
    };
    window.addEventListener('clear-lab-desk', handleClearDesk);
    return () => window.removeEventListener('clear-lab-desk', handleClearDesk);
  }, []);

  // ─── 6. Reset lab ──────────────────────────────────────────────────────────
  const handleResetLab = async () => {
    setShowResetConfirm(false);
    const currentLab = {
      ...useLabStore.getState().metadata,
      config: useLabStore.getState().config,
    };
    const freshTaskList = getLabTasks(currentLab);

    try {
      await resetVirtualLab(labId);
      resetLabState(freshTaskList);
      toast.success('Đã làm mới bài thí nghiệm!', { position: 'bottom-right' });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể reset bài Lab.', { position: 'bottom-right' });
    }
  };

  // ─── 7. Submit Assignment ──────────────────────────────────────────────────
  const handleSubmitAssignment = async () => {
    setSaveState('saving');
    try {
      const payload = {
        currentScore: currentProgress.score,
        progressPercent: currentProgress.percent,
        status: 'SUBMITTED',
        currentWorkspace: useLabStore.getState().workspace,
        viewport: useLabStore.getState().viewport,
        completedActions: currentProgress.completed_actions || []
      };
      await saveVirtualLabProgress(labId, payload);
      setSaveState('saved');
      toast.success('Đã nộp bài thành công!', { position: 'bottom-right' });
      return true; // Indicate success
    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
      setSaveState('idle');
      toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.', { position: 'bottom-right' });
      return false; // Indicate failure
    }
  };

  // ─── 8. Rename Lab ──────────────────────────────────────────────────────────
  const handleRenameLab = async (newTitle) => {
    // Lưu tạm tên cũ để rollback nếu lỗi
    const oldTitle = useLabStore.getState().metadata?.title;
    
    // Optimistic update trên UI
    useLabStore.getState().updateTitle(newTitle);

    try {
      await renameVirtualLab(labId, newTitle);
      toast.success('Đã lưu tên bài lab thành công!', { position: 'bottom-right' });
    } catch (error) {
      console.error('Lỗi khi đổi tên:', error);
      // Rollback
      useLabStore.getState().updateTitle(oldTitle);
      toast.error('Không thể đổi tên bài lab lúc này.', { position: 'bottom-right' });
    }
  };

  return {
    isLoading,
    saveState,
    showResetConfirm,
    setShowResetConfirm,
    showModal,
    setShowModal,
    handleResetLab,
    debouncedSave,
    handleSubmitAssignment,
    handleRenameLab,
  };
}
