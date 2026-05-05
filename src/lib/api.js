import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getStudyChapters = async () => {
  const response = await api.get('/api/study/chapters');
  return response.data;
};

export const getStudyLesson = async (lessonId) => {
  const response = await api.get(`/api/study/lessons/${lessonId}`);
  return response.data;
};

export const submitLessonMiniQuiz = async (lessonId, payload) => {
  const response = await api.post(`/api/study/lessons/${lessonId}/mini-quiz/submit`, payload);
  return response.data;
};

export const getFreeQuizzes = async () => {
  const response = await api.get('/api/quizzes/free');
  return response.data;
};

export const getQuizDetail = async (quizId) => {
  const response = await api.get(`/api/quizzes/${quizId}`);
  return response.data;
};

export const startQuizAttempt = async (quizId) => {
  const response = await api.post(`/api/quizzes/${quizId}/attempts`);
  return response.data;
};

export const submitQuizAttempt = async (attemptId, payload) => {
  const response = await api.post(`/api/quizzes/attempts/${attemptId}/submit`, payload);
  return response.data;
};

export const getTeacherSummary = async () => {
  const response = await api.get('/api/teacher/summary');
  return response.data;
};

export const getTeacherStudentPerformance = async () => {
  const response = await api.get('/api/teacher/analytics/students');
  return response.data;
};

export const getTeacherSubmissions = async () => {
  const response = await api.get('/api/teacher/submissions');
  return response.data;
};

export const getTeacherQuizzes = async () => {
  const response = await api.get('/api/teacher/quizzes');
  return response.data;
};

export const getTeacherAssignments = async () => {
  const response = await api.get('/api/teacher/assignments');
  return response.data;
};

export const getTeacherChapters = async () => {
  const response = await api.get('/api/teacher/chapters');
  return response.data;
};

export const getTeacherLessons = async () => {
  const response = await api.get('/api/teacher/lessons');
  return response.data;
};

export const getTeacherClasses = async () => {
  const response = await api.get('/api/teacher/classes');
  return response.data;
};

export const getTeacherStudentAccount = async (studentId) => {
  const response = await api.get(`/api/teacher/students/${studentId}`);
  return response.data;
};

// Teacher chapter operations
export const createTeacherChapter = async (payload) => {
  const response = await api.post('/api/teacher/chapters', payload);
  return response.data;
};

export const updateTeacherChapter = async (chapterId, payload) => {
  const response = await api.put(`/api/teacher/chapters/${chapterId}`, payload);
  return response.data;
};

export const deleteTeacherChapter = async (chapterId) => {
  const response = await api.delete(`/api/teacher/chapters/${chapterId}`);
  return response.data;
};

// Teacher lesson operations
export const createTeacherLesson = async (payload) => {
  const response = await api.post('/api/teacher/lessons', payload);
  return response.data;
};

export const updateTeacherLesson = async (lessonId, payload) => {
  const response = await api.put(`/api/teacher/lessons/${lessonId}`, payload);
  return response.data;
};

export const deleteTeacherLesson = async (lessonId) => {
  const response = await api.delete(`/api/teacher/lessons/${lessonId}`);
  return response.data;
};

// Teacher quiz operations
export const createTeacherQuiz = async (payload) => {
  const response = await api.post('/api/teacher/quizzes', payload);
  return response.data;
};

export const updateTeacherQuiz = async (quizId, payload) => {
  const response = await api.put(`/api/teacher/quizzes/${quizId}`, payload);
  return response.data;
};

export const deleteTeacherQuiz = async (quizId) => {
  const response = await api.delete(`/api/teacher/quizzes/${quizId}`);
  return response.data;
};

// Teacher quiz question operations
export const getTeacherQuizQuestions = async (quizId) => {
  const response = await api.get(`/api/teacher/quizzes/${quizId}/questions`);
  return response.data;
};

export const createTeacherQuizQuestion = async (quizId, payload) => {
  const response = await api.post(`/api/teacher/quizzes/${quizId}/questions`, payload);
  return response.data;
};

export const updateTeacherQuizQuestion = async (questionId, payload) => {
  const response = await api.put(`/api/teacher/quiz-questions/${questionId}`, payload);
  return response.data;
};

export const deleteTeacherQuizQuestion = async (questionId) => {
  const response = await api.delete(`/api/teacher/quiz-questions/${questionId}`);
  return response.data;
};

export const getTeacherQuestionBank = async () => {
  const response = await api.get('/api/teacher/question-bank');
  return response.data;
};

export const createTeacherQuestionBankItem = async (payload) => {
  const response = await api.post('/api/teacher/question-bank', payload);
  return response.data;
};

export const updateTeacherQuestionBankItem = async (bankQuestionId, payload) => {
  const response = await api.put(`/api/teacher/question-bank/${bankQuestionId}`, payload);
  return response.data;
};

export const deleteTeacherQuestionBankItem = async (bankQuestionId) => {
  const response = await api.delete(`/api/teacher/question-bank/${bankQuestionId}`);
  return response.data;
};

export const addQuestionFromBankToQuiz = async (quizId, bankQuestionId) => {
  const response = await api.post(`/api/teacher/quizzes/${quizId}/questions/from-bank/${bankQuestionId}`);
  return response.data;
};

// Teacher assignment operations
export const createTeacherAssignment = async (payload) => {
  const response = await api.post('/api/teacher/assignments', payload);
  return response.data;
};

export const updateTeacherAssignment = async (assignmentId, payload) => {
  const response = await api.put(`/api/teacher/assignments/${assignmentId}`, payload);
  return response.data;
};

export const deleteTeacherAssignment = async (assignmentId) => {
  const response = await api.delete(`/api/teacher/assignments/${assignmentId}`);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

export const getAccounts = getUsers;

export const getUserById = async (userId) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post('/api/users', payload);
  return response.data;
};

export const updateUser = async (userId, payload) => {
  const response = await api.patch(`/api/users/${userId}`, payload);
  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await api.patch(`/api/users/${userId}/deactivate`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/users/${userId}`);
  return response.data;
};

export const getAdminClasses = async () => {
  const response = await api.get('/api/admin/classes');
  return response.data;
};

export const createAdminClass = async (payload) => {
  const response = await api.post('/api/admin/classes', payload);
  return response.data;
};

export const updateAdminClass = async (classId, payload) => {
  const response = await api.put(`/api/admin/classes/${classId}`, payload);
  return response.data;
};

export const deleteAdminClass = async (classId) => {
  const response = await api.delete(`/api/admin/classes/${classId}`);
  return response.data;
};

export const getParentChildren = async () => {
  const response = await api.get('/api/parent/children');
  return response.data;
};

export const getParentChildPerformance = async (childId) => {
  const response = await api.get(`/api/parent/children/${childId}/performance`);
  return response.data;
};

export const getParentChildAssessments = async (childId) => {
  const response = await api.get(`/api/parent/children/${childId}/assessments`);
  return response.data;
};

// Virtual Lab operations
export const getVirtualLabs = async (params) => {
  const response = await api.get('/api/v1/student/virtual-labs', { params });
  return response.data;
};

export const enterVirtualLab = async (labId) => {
  const response = await api.get(`/api/v1/student/virtual-labs/${labId}`);
  return response.data;
};

export const saveVirtualLabProgress = async (labId, payload) => {
  const response = await api.put(`/api/v1/student/virtual-labs/${labId}/progress`, payload);
  return response.data;
};

export const resetVirtualLab = async (labId) => {
  const response = await api.delete(`/api/v1/student/virtual-labs/${labId}/reset`);
  return response.data;
};

export default api;
