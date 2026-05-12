import { create } from 'zustand';

export const useStudyStore = create((set) => ({
  selectedChapterId: null,
  selectedLessonId: null,
  miniQuizAttempts: {},

  setChapter: (chapterId) => set({ selectedChapterId: chapterId }),
  setLesson: (lessonId) => set({ selectedLessonId: lessonId }),
  recordMiniQuizAttempt: (lessonId, score) =>
    set((state) => ({
      miniQuizAttempts: {
        ...state.miniQuizAttempts,
        [lessonId]: { score, timestamp: Date.now() },
      },
    })),
}));

export default useStudyStore;
