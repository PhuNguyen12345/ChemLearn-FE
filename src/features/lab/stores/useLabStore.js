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
    score: 0
  },
  
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
          completed_actions: [...actions, reactionKey],
          score: (state.progress.score || 0) + 10 // Cộng 10 điểm (EXP) cho mỗi phản ứng mới
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
