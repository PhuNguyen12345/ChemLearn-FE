import api from '../lib/api';

// ── DEV-ONLY: Auto-login as parent1 for testing ──────────────────────────────
export const loginParent = async () => {
  const response = await api.post('/api/auth/login', { username: 'parent1', password: '123456' });
  return response.data;
};
// ─────────────────────────────────────────────────────────────────────────────


export const getChildren = async () => {
  const response = await api.get('/api/parent/children');
  return response.data;
};

export const getChildOverview = async (studentId) => {
  const response = await api.get(`/api/parent/children/${studentId}/overview`);
  return response.data;
};

export const getChildGamification = async (studentId) => {
  const response = await api.get(`/api/parent/children/${studentId}/gamification`);
  return response.data;
};

export const getChildScoreTimeline = async (studentId) => {
  const response = await api.get(`/api/parent/children/${studentId}/timeline`);
  return response.data;
};
