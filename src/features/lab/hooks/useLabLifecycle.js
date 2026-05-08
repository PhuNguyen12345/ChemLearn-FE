import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import confetti from 'canvas-confetti';
import { useLabStore } from '../stores/useLabStore';
import { LAB_TASKS_MOCK } from '../data/labTasksMock';
import { saveVirtualLabProgress, enterVirtualLab, resetVirtualLab } from '@/lib/api';

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
    const fetchLab = async () => {
      setIsLoading(true);
      try {
        const data = await enterVirtualLab(labId);
        // TODO: select task list by category from BE. Using AXIT_BAZO for now.
        loadLabProgress(data, LAB_TASKS_MOCK.AXIT_BAZO);
      } catch (error) {
        console.error('Lỗi khi tải bài lab:', error);
        toast.error('Không thể tải bài thực hành. Vui lòng thử lại sau.', { position: 'bottom-right' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLab();

    return () => {
      useLabStore.getState().clearWorkspace();
    };
  }, [labId, initFromTemplate, loadLabProgress]);

  // ─── 2. Completion confetti & modal ────────────────────────────────────────
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

  // ─── 3. Auto-save debounce ──────────────────────────────────────────────────
  const debouncedSave = useMemo(
    () => debounce(async (payload) => {
      setSaveState('saving');
      try {
        await saveVirtualLabProgress(labId, payload);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } catch (error) {
        console.error('Lỗi khi lưu tiến trình lab:', error);
        setSaveState('idle');
        toast.error('Mất kết nối! Chưa thể lưu tiến trình lab.', { position: 'bottom-right' });
      }
    }, 1500),
    [labId]
  );

  // ─── 4. Auto-save trigger on state change ──────────────────────────────────
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
    // Dynamically load the correct task list based on the current lab's category
    const currentCategory = useLabStore.getState().metadata?.category || 'AXIT_BAZO';
    const freshTaskList = LAB_TASKS_MOCK[currentCategory] || [];

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
  };
}
