import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import {
  getTeacherQuizzes,
  getTeacherClasses,
  createTeacherQuiz,
  updateTeacherQuiz,
  deleteTeacherQuiz,
  getTeacherQuizQuestions,
  createTeacherQuizQuestion,
  updateTeacherQuizQuestion,
  deleteTeacherQuizQuestion,
} from '@/lib/api';

const quizTypeLabelMap = {
  FREE: 'Free Practice',
  ASSIGNMENT: 'Assignment',
  MINI_QUIZ: 'Mini Quiz',
  EXAM: 'Exam',
};

const questionTypeLabelMap = {
  SINGLE_CHOICE: 'Single choice',
  MULTIPLE_CHOICE: 'Multiple choice',
  TRUE_FALSE: 'True / False',
  ESSAY: 'Essay',
};

const questionTypeOptions = Object.keys(questionTypeLabelMap);

const TeacherQuizCreation = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Forms
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    quizType: 'FREE',
    durationMinutes: 30,
    classId: '',
    startTime: '',
    endTime: '',
  });

  const [questionForm, setQuestionForm] = useState({
    prompt: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    correctOptions: [],
    questionType: 'SINGLE_CHOICE',
    explanation: '',
    pointValue: 1,
    orderIndex: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      loadQuizQuestions(selectedQuiz.id);
    } else {
      setQuizQuestions([]);
    }
  }, [selectedQuiz]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [quizzesData, classesData] = await Promise.all([
        getTeacherQuizzes(),
        getTeacherClasses(),
      ]);
      setQuizzes(quizzesData || []);
      setClasses(classesData || []);
    } catch {
      setError('Failed to load initial data.');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizQuestions = async (quizId) => {
    try {
      const qs = await getTeacherQuizQuestions(quizId);
      setQuizQuestions(qs || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load quiz questions.');
    }
  };

  const handleQuizModalOpen = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title || '',
        description: quiz.description || '',
        quizType: quiz.quizType || 'FREE',
        durationMinutes: quiz.durationMinutes || 30,
        classId: quiz.classId || (quiz.studyClass ? quiz.studyClass.id : ''),
        startTime: quiz.startTime || '',
        endTime: quiz.endTime || '',
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({
        title: '',
        description: '',
        quizType: 'FREE',
        durationMinutes: 30,
        classId: classes.length > 0 ? classes[0].id : '',
        startTime: '',
        endTime: '',
      });
    }
    setShowQuizModal(true);
  };

  const formatDateTimeToISO = (datetimeLocal) => {
    if (!datetimeLocal) return null;
    // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO 8601 with seconds and Z
    // e.g., "2026-05-11T13:50" -> "2026-05-11T13:50:00Z"
    const date = new Date(datetimeLocal);
    return date.toISOString();
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        quizType: quizForm.quizType,
        durationMinutes: parseInt(quizForm.durationMinutes) || 0,
        classId: quizForm.classId,
      };

      // Add start/end times for EXAM and ASSIGNMENT types - convert to ISO 8601
      if ((quizForm.quizType === 'EXAM' || quizForm.quizType === 'ASSIGNMENT') && quizForm.startTime) {
        payload.startTime = formatDateTimeToISO(quizForm.startTime);
      }
      if ((quizForm.quizType === 'EXAM' || quizForm.quizType === 'ASSIGNMENT') && quizForm.endTime) {
        payload.endTime = formatDateTimeToISO(quizForm.endTime);
      }

      if (!payload.classId) {
        alert('Please select a class');
        return;
      }

      // Validate end time is after start time for timed quizzes
      if (payload.startTime && payload.endTime) {
        const start = new Date(payload.startTime);
        const end = new Date(payload.endTime);
        if (end <= start) {
          alert('End time must be after start time');
          return;
        }
      }

      if (editingQuiz) {
        await updateTeacherQuiz(editingQuiz.id, payload);
      } else {
        await createTeacherQuiz(payload);
      }
      await loadInitialData();
      setShowQuizModal(false);
    } catch (err) {
      console.error(err);
      alert('Error saving quiz: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        setSubmitting(true);
        await deleteTeacherQuiz(quizId);
        if (selectedQuiz && selectedQuiz.id === quizId) {
          setSelectedQuiz(null);
        }
        await loadInitialData();
      } catch {
        alert('Failed to delete quiz');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const openQuestionModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        prompt: question.prompt || '',
        optionA: question.optionA || '',
        optionB: question.optionB || '',
        optionC: question.optionC || '',
        optionD: question.optionD || '',
        correctOption: question.correctOption || 'A',
        correctOptions: question.questionType === 'MULTIPLE_CHOICE' ? (question.correctOption?.split(',').map(o=>o.trim()).filter(Boolean) || []) : [],
        questionType: question.questionType || 'SINGLE_CHOICE',
        explanation: question.explanation || '',
        pointValue: question.pointValue ?? 1,
        orderIndex: question.displayOrder ?? question.orderIndex ?? 0,
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        prompt: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        correctOptions: [],
        questionType: 'SINGLE_CHOICE',
        explanation: '',
        pointValue: 1,
        orderIndex: 0,
      });
    }
    setShowQuestionModal(true);
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    try {
      setSubmitting(true);
      const payload = { ...questionForm };
      const pointValue = Number(payload.pointValue);
      if (!Number.isFinite(pointValue) || pointValue <= 0) {
        alert('Point value must be greater than 0');
        setSubmitting(false);
        return;
      }
      
      if (questionForm.questionType === 'MULTIPLE_CHOICE') {
        if (!payload.correctOptions || payload.correctOptions.length === 0) {
          alert('Please select at least one correct option for Multiple Choice question');
          setSubmitting(false);
          return;
        }
        payload.correctOption = payload.correctOptions.join(',');
        delete payload.correctOptions;
      }
      if (questionForm.questionType === 'ESSAY') {
        payload.optionA = payload.optionA || 'N/A';
        payload.optionB = payload.optionB || 'N/A';
        payload.optionC = payload.optionC || 'N/A';
        payload.optionD = payload.optionD || 'N/A';
        payload.correctOption = 'N/A';
      }
      
      const apiPayload = {
        prompt: payload.prompt,
        optionA: payload.optionA,
        optionB: payload.optionB,
        optionC: payload.optionC,
        optionD: payload.optionD,
        correctOption: String(payload.correctOption || 'A').toUpperCase(),
        explanation: payload.explanation,
        pointValue,
        displayOrder: Number.isFinite(Number(payload.orderIndex)) ? Number(payload.orderIndex) : 0,
        questionType: payload.questionType || 'SINGLE_CHOICE',
      };

      if (editingQuestion) {
        await updateTeacherQuizQuestion(editingQuestion.id, apiPayload);
      } else {
        await createTeacherQuizQuestion(selectedQuiz.id, apiPayload);
      }
      await loadQuizQuestions(selectedQuiz.id);
      setShowQuestionModal(false);
    } catch (err) {
      alert('Error saving question: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        setSubmitting(true);
        await deleteTeacherQuizQuestion(questionId);
        if (selectedQuiz) {
          await loadQuizQuestions(selectedQuiz.id);
        }
      } catch {
        alert('Failed to delete question');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz Management</h1>
          <p className="mt-1 text-sm text-slate-500">Create quizzes and manage their questions</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quizzes List */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Quizzes</CardTitle>
              <button
                onClick={() => handleQuizModalOpen()}
                className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> New Quiz
              </button>
            </CardHeader>
            <CardContent className="p-0">
              {quizzes.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No quizzes found. Create one to get started.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {quizzes.map((quiz) => {
                    const isSelected = selectedQuiz?.id === quiz.id;
                    return (
                      <div
                        key={quiz.id}
                        onClick={() => setSelectedQuiz(quiz)}
                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-900">{quiz.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {quizTypeLabelMap[quiz.quizType] || quiz.quizType}
                              </Badge>
                              <span className="text-xs text-slate-500">{quiz.durationMinutes} mins</span>
                            </div>
                          </div>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleQuizModalOpen(quiz)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quiz Questions */}
        <div className="lg:col-span-8">
          {selectedQuiz ? (
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <CardTitle className="text-lg">Questions: {selectedQuiz.title}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">{quizQuestions.length} questions</p>
                </div>
                <button
                  onClick={() => openQuestionModal()}
                  className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4" /> Add Question
                </button>
              </CardHeader>
              <CardContent className="p-0">
                {quizQuestions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No questions in this quiz yet. Click "Add Question" to create one.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {quizQuestions.map((question, index) => (
                      <div key={question.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-slate-700">Q{index + 1}.</span>
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">
                                {questionTypeLabelMap[question.questionType] || question.questionType}
                              </Badge>
                              <Badge variant="outline" className="border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                                {Number(question.pointValue ?? 1)} pts
                              </Badge>
                            </div>
                            <p className="text-slate-900 font-medium whitespace-pre-wrap">{question.prompt}</p>
                            
                            {question.questionType !== 'ESSAY' && question.questionType !== 'TRUE_FALSE' && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                                {(() => {
                                  const correctOpts = question.correctOption?.split(',').map(o => o.trim()) || [];
                                  return (
                                    <>
                                      <div className={correctOpts.includes('A') ? 'font-semibold text-green-600' : ''}>A: {question.optionA}</div>
                                      <div className={correctOpts.includes('B') ? 'font-semibold text-green-600' : ''}>B: {question.optionB}</div>
                                      <div className={correctOpts.includes('C') ? 'font-semibold text-green-600' : ''}>C: {question.optionC}</div>
                                      <div className={correctOpts.includes('D') ? 'font-semibold text-green-600' : ''}>D: {question.optionD}</div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                            {question.questionType === 'TRUE_FALSE' && (
                              <div className="mt-3 text-sm font-semibold text-green-600">
                                Correct Answer: {question.correctOption === 'A' ? 'True' : 'False'}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => openQuestionModal(question)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 min-h-[400px]">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <AlertCircle className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No Quiz Selected</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  Select a quiz from the left panel to manage its questions, or create a new one.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h3>
              <button onClick={() => setShowQuizModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitQuiz} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Type</label>
                  <select
                    value={quizForm.quizType}
                    onChange={(e) => setQuizForm({ ...quizForm, quizType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  >
                    {Object.entries(quizTypeLabelMap).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={quizForm.durationMinutes}
                    onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    min="1"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Class</label>
                <select
                  value={quizForm.classId}
                  onChange={(e) => setQuizForm({ ...quizForm, classId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={submitting}
                >
                  <option value="">Select a class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {(quizForm.quizType === 'EXAM' || quizForm.quizType === 'ASSIGNMENT') && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <p className="text-sm text-slate-600 font-medium">Availability Window</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={quizForm.startTime}
                        onChange={(e) => setQuizForm({ ...quizForm, startTime: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        value={quizForm.endTime}
                        onChange={(e) => setQuizForm({ ...quizForm, endTime: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitQuestion} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
                <textarea
                  value={questionForm.prompt}
                  onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {['A', 'B', 'C', 'D'].map((label) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Option {label}</label>
                    <input
                      type="text"
                      value={questionForm[`option${label}`]}
                      onChange={(e) => setQuestionForm({ ...questionForm, [`option${label}`]: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required={questionForm.questionType !== 'ESSAY'}
                      disabled={submitting || questionForm.questionType === 'TRUE_FALSE' || questionForm.questionType === 'ESSAY'}
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                  <select
                    value={questionForm.questionType}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQuestionForm((prev) => {
                        const next = { ...prev, questionType: v };
                        if (v === 'TRUE_FALSE') {
                          next.optionA = 'True';
                          next.optionB = 'False';
                          next.optionC = 'N/A';
                          next.optionD = 'N/A';
                          next.correctOption = 'A';
                          next.correctOptions = ['A'];
                        } else if (v === 'ESSAY') {
                          next.optionA = 'N/A';
                          next.optionB = 'N/A';
                          next.optionC = 'N/A';
                          next.optionD = 'N/A';
                          next.correctOption = '';
                          next.correctOptions = [];
                        } else if (v === 'SINGLE_CHOICE') {
                          next.correctOptions = [];
                          if (prev.optionA === 'N/A' && prev.optionB === 'N/A') {
                            next.optionA = '';
                            next.optionB = '';
                            next.optionC = '';
                            next.optionD = '';
                          }
                          next.correctOption = prev.correctOption || 'A';
                        } else if (v === 'MULTIPLE_CHOICE') {
                          next.correctOption = '';
                          next.correctOptions = prev.correctOptions || [];
                        }
                        return next;
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  >
                    {questionTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {questionTypeLabelMap[type]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correct Option</label>
                  {questionForm.questionType === 'MULTIPLE_CHOICE' ? (
                    <div className="flex items-center gap-2 pt-2">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Array.isArray(questionForm.correctOptions) && questionForm.correctOptions.includes(opt)}
                            onChange={() =>
                              setQuestionForm((prev) => {
                                const next = new Set(prev.correctOptions || []);
                                if (next.has(opt)) next.delete(opt);
                                else next.add(opt);
                                return { ...prev, correctOptions: Array.from(next) };
                              })
                            }
                            disabled={submitting}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : questionForm.questionType === 'TRUE_FALSE' ? (
                    <select
                      value={(questionForm.correctOptions && questionForm.correctOptions[0]) || questionForm.correctOption || 'A'}
                      onChange={(e) => setQuestionForm((prev) => ({ ...prev, correctOption: e.target.value, correctOptions: [e.target.value] }))}
                      className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={submitting}
                    >
                      <option value="A">Correct: True (A)</option>
                      <option value="B">Correct: False (B)</option>
                    </select>
                  ) : questionForm.questionType === 'ESSAY' ? (
                    <div className="text-sm text-slate-500 pt-2">Essay - no correct option</div>
                  ) : (
                    <select
                      value={questionForm.correctOption}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctOption: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={submitting}
                    >
                      <option value="A">Correct: A</option>
                      <option value="B">Correct: B</option>
                      <option value="C">Correct: C</option>
                      <option value="D">Correct: D</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={questionForm.orderIndex}
                    onChange={(e) => setQuestionForm({ ...questionForm, orderIndex: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Points</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={questionForm.pointValue}
                    onChange={(e) => setQuestionForm({ ...questionForm, pointValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (optional)</label>
                <input
                  type="text"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizCreation;
