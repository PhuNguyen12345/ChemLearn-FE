import { create } from 'zustand';

export const useLabStore = create((set, get) => ({
  // Core CSLS State
  lab_id: null,
  version: "1.0",
  metadata: {
    title: "",
    description: "",
    category: "",
    difficulty: ""
  },
  config: {
    sidebar_locked: false,
    allowed_types: [],
    restricted_chemicals: []
  },
  viewport: {
    zoom_scale: 1.0,
    offset: { x: 0, y: 0 }
  },
  workspace: [], // The array of placed items
  progress: {
    current_step: 1,
    completed_actions: [],
    is_finished: false,
    score: 0,
    percent: 0
  },
  tasks: [],

  
  // Internal UI State
  reactionInfo: { equation: '-', condition: '-', description: 'Bàn làm việc đã được dọn sạch.' },
  _originalTemplate: null, // For resetting

  // ACTIONS
  initFromTemplate: (templateJson) => {
    const clone = structuredClone(templateJson);
    set({
      lab_id: clone.lab_id,
      version: clone.version || "1.0",
      metadata: clone.metadata,
      config: clone.config,
      viewport: clone.viewport,
      workspace: clone.workspace,
      progress: clone.progress,
      _originalTemplate: structuredClone(templateJson),
      reactionInfo: { equation: '-', condition: 'Template Loaded', description: `Đã nạp bài thực hành: ${clone.metadata.title}` }
    });
  },

  loadLabProgress: (apiData, taskMockList) => {
    // Phục hồi cấu hình cơ bản từ API
    const config = apiData.config || {};
    
    // Khôi phục mảng tasks từ mock và áp dụng trạng thái completed
    const apiCompletedActions = apiData.completedActions || [];
    const restoredTasks = (taskMockList || []).map(task => ({
      ...task,
      isCompleted: apiCompletedActions.includes(task.action)
    }));

    set({
      lab_id: apiData.labId,
      version: "1.0",
      metadata: { 
        title: apiData.title, 
        type: apiData.type,
        max_score: 50 // Giả định
      },
      config: config,
      viewport: apiData.viewport || { x: 0, y: 0, zoom_scale: 1.0 },
      workspace: apiData.workspace || [],
      progress: {
        score: apiData.currentScore || 0,
        percent: apiData.progressPercent || 0,
        completed_actions: apiCompletedActions,
        is_finished: apiData.status === 'COMPLETED'
      },
      tasks: restoredTasks,
      _originalTemplate: null, // Bỏ qua original
      reactionInfo: { equation: '-', condition: 'Progress Loaded', description: `Đã khôi phục tiến trình bài: ${apiData.title}` }
    });
  },

  resetToTemplate: () => {
    const original = get()._originalTemplate;
    if (original) {
      set({
        viewport: structuredClone(original.viewport),
        workspace: structuredClone(original.workspace),
        progress: structuredClone(original.progress),
        reactionInfo: { equation: '-', condition: 'Reset', description: 'Đã khôi phục lại trạng thái ban đầu của bài học.' }
      });
    }
  },

  // Reset to blank state - called after Reset Lab API success
  resetLabState: (freshTaskList) => set({
    workspace: [],
    viewport: { zoom_scale: 1.0, offset: { x: 0, y: 0 } },
    progress: {
      score: 0,
      percent: 0,
      completed_actions: [],
      is_finished: false
    },
    tasks: (freshTaskList || []).map(t => ({ ...t, isCompleted: false })),
    reactionInfo: { equation: '-', condition: 'Reset', description: 'Đã làm mới bài thí nghiệm.' }
  }),

  clearWorkspace: () => set((state) => ({
    workspace: [],
    reactionInfo: { equation: '-', condition: 'Cleared', description: 'Bàn làm việc đã được dọn sạch.' }
  })),

  // Viewport action
  setViewportScale: (scale) => set((state) => ({
    viewport: { ...state.viewport, zoom_scale: scale }
  })),

  // Gamification: Record Reaction & Add Score
  recordReaction: (reactionKey) => set((state) => {
    const actions = state.progress.completed_actions;
    if (!actions.includes(reactionKey)) {
      return {
        progress: {
          ...state.progress,
          completed_actions: [...actions, reactionKey]
          // score is now handled by completeTask
        }
      };
    }
    return {};
  }),

  initTasks: (tasks) => set({ tasks: tasks }),

  completeTask: (actionName) => set((state) => {
    let updatedScore = state.progress.score || 0;
    let isChanged = false;
    
    const updatedTasks = state.tasks.map(task => {
      if (task.action === actionName && !task.isCompleted) {
        updatedScore += task.points;
        isChanged = true;
        return { ...task, isCompleted: true };
      }
      return task;
    });

    if (isChanged) {
      const completedCount = updatedTasks.filter(t => t.isCompleted).length;
      const totalCount = updatedTasks.length;
      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // Ensure the task action is also recorded in completed_actions
      const currentCompletedActions = state.progress.completed_actions || [];
      const newCompletedActions = currentCompletedActions.includes(actionName) 
        ? currentCompletedActions 
        : [...currentCompletedActions, actionName];

      return {
        tasks: updatedTasks,
        progress: {
          ...state.progress,
          score: updatedScore,
          percent: percent,
          completed_actions: newCompletedActions
        }
      };
    }
    return {};
  }),

  markAsFinished: () => set((state) => ({
    progress: {
      ...state.progress,
      is_finished: true
    }
  })),

  // Set explicitly (for one-off usages)
  setReactionInfo: (info) => set({ reactionInfo: info }),

  // Workspace Array Updates
  addWorkspaceItem: (item) => set((state) => ({
    workspace: [...state.workspace, item]
  })),

  updateWorkspaceItem: (instanceId, updates) => set((state) => ({
    workspace: state.workspace.map(item => 
      item.instanceId === instanceId ? { ...item, ...updates } : item
    )
  })),

  removeWorkspaceItem: (instanceId) => set((state) => ({
    workspace: state.workspace.filter(item => item.instanceId !== instanceId)
  })),

  // Helper hook to replace the old setPlacedItems pattern 
  // ONLY USE THIS for bulk updates like re-checking distances, etc.
  setWorkspace: (updater) => set((state) => ({
    workspace: typeof updater === 'function' ? updater(state.workspace) : updater
  })),

  // Serialization (Mocking save)
  serializeLabState: () => {
    const state = get();
    const payload = {
      lab_id: state.lab_id,
      version: state.version,
      metadata: state.metadata,
      config: state.config,
      viewport: state.viewport,
      workspace: state.workspace,
      progress: state.progress
    };
    
    console.log("=== MOCK SAVE TO BACKEND: CSLS 1.0 JSON ===");
    console.log(JSON.stringify(payload, null, 2));
    
    // Optional: save to local storage
    localStorage.setItem(`chemlearn_autosave_${state.lab_id}`, JSON.stringify(payload));
    return payload;
  }
}));
