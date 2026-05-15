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

const normalizeListResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

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
  const response = await api.get('/api/student/classes/quizzes');
  return normalizeListResponse(response.data);
};

export const getStudentClassQuizzes = getFreeQuizzes;

export const getStudentClassAssignments = async () => {
  const response = await api.get('/api/student/classes/assignments');
  return normalizeListResponse(response.data);
};

export const getQuizDetail = async (quizId) => {
  const response = await api.get(`/api/quizzes/${quizId}`);
  return response.data;
};

export const startQuizAttempt = async (quizId) => {
  const response = await api.post(`/api/quizzes/${quizId}/attempts`, {});
  return response.data;
};

export const submitQuizAttempt = async (attemptId, payload) => {
  const response = await api.post(`/api/quizzes/attempts/${attemptId}/submit`, payload);
  return response.data;
};

export const getQuizAttemptHistory = async (quizId) => {
  const response = await api.get(`/api/quizzes/${quizId}/history`);
  return normalizeListResponse(response.data);
};

export const getTeacherSummary = async () => {
  const response = await api.get('/api/teacher/summary');
  return response.data;
};

export const getTeacherStudentPerformance = async () => {
  const response = await api.get('/api/teacher/analytics/students');
  return normalizeListResponse(response.data);
};

export const getTeacherSubmissions = async () => {
  const response = await api.get('/api/teacher/submissions');
  return normalizeListResponse(response.data);
};

export const getTeacherQuizzes = async () => {
  const response = await api.get('/api/teacher/quizzes');
  return normalizeListResponse(response.data);
};

export const getTeacherAssignments = async () => {
  const response = await api.get('/api/teacher/assignments');
  return normalizeListResponse(response.data);
};

export const getTeacherChapters = async () => {
  const response = await api.get('/api/teacher/chapters');
  return normalizeListResponse(response.data);
};

export const getTeacherLessons = async () => {
  const response = await api.get('/api/teacher/lessons');
  return normalizeListResponse(response.data);
};

export const getTeacherClasses = async () => {
  const response = await api.get('/api/teacher/classes');
  return normalizeListResponse(response.data);
};

export const createTeacherClass = async (payload) => {
  const response = await api.post('/api/teacher/classes', payload);
  return response.data;
};

export const updateTeacherClass = async (classId, payload) => {
  const response = await api.put(`/api/teacher/classes/${classId}`, payload);
  return response.data;
};

export const deleteTeacherClass = async (classId) => {
  const response = await api.delete(`/api/teacher/classes/${classId}`);
  return response.data;
};

export const removeStudentFromTeacherClass = async (classId, studentId) => {
  const response = await api.delete(`/api/teacher/classes/${classId}/students/${studentId}`);
  return response.data;
};

export const getTeacherStudentAccount = async (studentId) => {
  const response = await api.get(`/api/teacher/students/${studentId}`);
  return response.data;
};

export const getStudentClasses = async () => {
  const response = await api.get('/api/student/classes');
  return normalizeListResponse(response.data);
};

export const joinClassByCode = async (classCode) => {
  const response = await api.post('/api/student/classes/join', { classCode });
  return response.data;
};

export const leaveClass = async (classId) => {
  await api.delete(`/api/student/classes/${classId}/leave`);
};

export const getClassChapters = async (classId) => {
  const response = await api.get(`/api/student/classes/${classId}/chapters`);
  return normalizeListResponse(response.data);
};

export const getClassChapterLessons = async (classId, chapterId) => {
  const response = await api.get(`/api/student/classes/${classId}/chapters/${chapterId}/lessons`);
  return normalizeListResponse(response.data);
};

export const getClassLessonDetail = async (classId, lessonId) => {
  const response = await api.get(`/api/student/classes/${classId}/lessons/${lessonId}`);
  return response.data;
};

export const getClassQuizzes = async (classId) => {
  const response = await api.get(`/api/student/classes/${classId}/quizzes`);
  return normalizeListResponse(response.data);
};

export const getClassAssignments = async (classId) => {
  const response = await api.get(`/api/student/classes/${classId}/assignments`);
  return normalizeListResponse(response.data);
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

export const addChapterToClass = async (classId, chapterId) => {
  const response = await api.post(`/api/teacher/classes/${classId}/chapters/${chapterId}`, {});
  return response.data;
};

export const removeChapterFromClass = async (classId, chapterId) => {
  const response = await api.delete(`/api/teacher/classes/${classId}/chapters/${chapterId}`);
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
  return normalizeListResponse(response.data);
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
  const response = await api.post(`/api/teacher/quizzes/${quizId}/questions/from-bank/${bankQuestionId}`, {});
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
  const response = await api.patch(`/api/users/${userId}/deactivate`, {});
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

// Admin Study Zone content endpoints
export const getAdminChapters = async () => {
  const response = await api.get('/api/admin/content/chapters');
  return response.data;
};

export const getAdminChapter = async (chapterId) => {
  const response = await api.get(`/api/admin/content/chapters/${chapterId}`);
  return response.data;
};

export const createAdminChapter = async (payload) => {
  const response = await api.post('/api/admin/content/chapters', payload);
  return response.data;
};

export const updateAdminChapter = async (chapterId, payload) => {
  const response = await api.put(`/api/admin/content/chapters/${chapterId}`, payload);
  return response.data;
};

export const deleteAdminChapter = async (chapterId) => {
  const response = await api.delete(`/api/admin/content/chapters/${chapterId}`);
  return response.data;
};

// Admin lessons
export const getAdminLesson = async (lessonId) => {
  const response = await api.get(`/api/admin/content/lessons/${lessonId}`);
  return response.data;
};

export const getAdminLessonsByChapter = async (chapterId) => {
  const response = await api.get(`/api/admin/content/chapters/${chapterId}/lessons`);
  return response.data;
};

export const createAdminLesson = async (payload) => {
  const response = await api.post('/api/admin/content/lessons', payload);
  return response.data;
};

export const updateAdminLesson = async (lessonId, payload) => {
  const response = await api.put(`/api/admin/content/lessons/${lessonId}`, payload);
  return response.data;
};

export const deleteAdminLesson = async (lessonId) => {
  const response = await api.delete(`/api/admin/content/lessons/${lessonId}`);
  return response.data;
};

// Mini-quiz questions (admin)
export const addMiniQuizQuestion = async (lessonId, payload) => {
  const response = await api.post(`/api/admin/content/lessons/${lessonId}/mini-quiz-questions`, payload);
  return response.data;
};

export const updateMiniQuizQuestion = async (questionId, payload) => {
  const response = await api.put(`/api/admin/content/mini-quiz-questions/${questionId}`, payload);
  return response.data;
};

export const deleteMiniQuizQuestion = async (questionId) => {
  const response = await api.delete(`/api/admin/content/mini-quiz-questions/${questionId}`);
  return response.data;
};

export const getTeacherSubmissionDetail = async (attemptId) => {
  const response = await api.get(`/api/teacher/submissions/${attemptId}`);
  return response.data;
};

export const gradeTeacherSubmission = async (attemptId, payload) => {
  const response = await api.post(`/api/teacher/submissions/${attemptId}/grade`, payload);
  return response.data;
};

export default api;
