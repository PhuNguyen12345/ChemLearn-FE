import api from '../lib/api';

export const loginStudent = async () => {
  const response = await api.post('/api/auth/login', { username: 'student', password: '123456' });
  return response.data;
};

export const getProgressMap = async () => {
  const response = await api.get('/api/student/gamification/map');
  return response.data;
};

// --- Student Profile APIs ---
export const getStudentProfileData = async () => {
  const response = await api.get('/api/student/profile');
  return response.data;
};

export const updateStudentProfileData = async (data) => {
  const response = await api.put('/api/student/profile', data);
  return response.data;
};

export const changeStudentPassword = async (data) => {
  const response = await api.put('/api/student/profile/password', data);
  return response.data;
};

// --- Gamification Profile APIs ---
export const getGamificationProfile = async () => {
  const response = await api.get('/api/gamification/profile');
  return response.data;
};

export const logDailyActivity = async () => {
  const response = await api.post('/api/gamification/profile/activity');
  return response.data;
};

// --- Quest APIs ---
export const getDailyQuests = async () => {
  const response = await api.get('/api/quests/daily');
  return response.data;
};

export const claimQuest = async (questId) => {
  const response = await api.post('/api/quests/claim', { questId });
  return response.data;
};

// --- Pet System APIs ---
export const getMyPets = async () => {
  const response = await api.get('/api/student/pets');
  return response.data;
};

export const getMyCoins = async () => {
  const response = await api.get('/api/student/pets/coins');
  return response.data;
};

export const getMyInventory = async () => {
  const response = await api.get('/api/student/pets/inventory');
  return response.data;
};

export const getShopItems = async () => {
  const response = await api.get('/api/student/pets/shop/items');
  return response.data;
};

export const buyItem = async (itemId, quantity = 1) => {
  const response = await api.post('/api/student/pets/shop/buy', { itemId, quantity });
  return response.data;
};

export const openEgg = async (eggItemId) => {
  const response = await api.post('/api/student/pets/gacha', { itemId: eggItemId, quantity: 1 });
  return response.data;
};

export const feedPet = async (studentPetId, foodItemId, quantity = 1) => {
  const response = await api.post(`/api/student/pets/${studentPetId}/feed`, { itemId: foodItemId, quantity });
  return response.data;
};

export const starUpPet = async (studentPetId) => {
  const response = await api.post(`/api/student/pets/${studentPetId}/star-up`);
  return response.data;
};

// --- Leaderboard APIs ---
export const getLeaderboard = async (category = 'EXPERIENCE', limit = 50) => {
  const response = await api.get(`/api/leaderboard?category=${category}&limit=${limit}`);
  return response.data;
};
