import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  BarChart,
  TrendingUp,
  FileCheck,
  LoaderCircle,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import {
  getTeacherAssignments,
  getTeacherChapters,
  getTeacherLessons,
  getTeacherQuizzes,
  getTeacherQuizQuestions,
  getTeacherStudentPerformance,
  getTeacherSubmissions,
  getTeacherSummary,
  createTeacherQuiz,
  createTeacherChapter,
  updateTeacherChapter,
  deleteTeacherChapter,
  createTeacherLesson,
  updateTeacherLesson,
  deleteTeacherLesson,
  createTeacherQuizQuestion,
  updateTeacherQuizQuestion,
  deleteTeacherQuizQuestion,
  updateTeacherQuiz,
  deleteTeacherQuiz,
  createTeacherAssignment,
  updateTeacherAssignment,
  deleteTeacherAssignment,
} from '@/lib/api';
import useAuthStore from '@/stores/useAuthStore';

const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    quizType: 'FREE',
    durationMinutes: 30,
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    quizId: '',
    studentId: '',
    dueAt: '',
  });
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    displayOrder: 0,
    published: true,
  });
  const [lessonForm, setLessonForm] = useState({
    chapterId: '',
    title: '',
    content: '',
    estimatedMinutes: 10,
    displayOrder: 0,
    published: true,
  });
  const [questionForm, setQuestionForm] = useState({
    prompt: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explanation: '',
    displayOrder: 0,
  });

  const loadData = async (keepQuestionSelection = true) => {
    try {
      setLoading(true);
      setError('');

      const [summaryData, performanceData, submissionsData, quizzesData, assignmentsData, chaptersData, lessonsData] = await Promise.all([
        getTeacherSummary(),
        getTeacherStudentPerformance(),
        getTeacherSubmissions(),
        getTeacherQuizzes(),
        getTeacherAssignments(),
        getTeacherChapters(),
        getTeacherLessons(),
      ]);

      setSummary(summaryData);
      setPerformance(performanceData || []);
      setSubmissions(submissionsData || []);
      setQuizzes(quizzesData || []);
      setAssignments(assignmentsData || []);
      setChapters(chaptersData || []);
      setLessons(lessonsData || []);

      if (!keepQuestionSelection || !selectedQuizForQuestions) {
        setSelectedQuizForQuestions((currentValue) => {
          if (currentValue && keepQuestionSelection) return currentValue;
          return quizzesData?.[0]?.id ? String(quizzesData[0].id) : '';
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load teacher dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedQuizForQuestions) {
        setQuizQuestions([]);
        return;
      }

      try {
        const data = await getTeacherQuizQuestions(selectedQuizForQuestions);
        setQuizQuestions(data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load quiz questions.');
      }
    };

    loadQuestions();
  }, [selectedQuizForQuestions]);

  const studentOptions = useMemo(() => {
    const seen = new Set();
    return performance
      .filter((student) => student.studentId != null)
      .map((student) => ({ id: String(student.studentId), label: student.studentName }))
      .filter((student) => {
        if (seen.has(student.id)) return false;
        seen.add(student.id);
        return true;
      });
  }, [performance]);

  const openChapterModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterForm({
        title: chapter.title || '',
        description: chapter.description || '',
        displayOrder: chapter.displayOrder ?? 0,
        published: chapter.published ?? true,
      });
    } else {
      setEditingChapter(null);
      setChapterForm({
        title: '',
        description: '',
        displayOrder: 0,
        published: true,
      });
    }

    setShowChapterModal(true);
  };

  const submitChapter = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...chapterForm,
        displayOrder: Number.isFinite(Number(chapterForm.displayOrder)) ? Number(chapterForm.displayOrder) : 0,
      };

      if (editingChapter) {
        await updateTeacherChapter(editingChapter.id, payload);
      } else {
        await createTeacherChapter(payload);
      }

      await loadData();
      setShowChapterModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save chapter.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter and its lessons?')) return;
    try {
      setSubmitting(true);
      await deleteTeacherChapter(chapterId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete chapter.');
    } finally {
      setSubmitting(false);
    }
  };

  const openLessonModal = (lesson = null) => {
    const defaultChapterId = chapters[0]?.id ? String(chapters[0].id) : '';

    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        chapterId: String(lesson.chapterId || lesson.chapter?.id || defaultChapterId),
        title: lesson.title || '',
        content: lesson.content || '',
        estimatedMinutes: lesson.estimatedMinutes ?? 10,
        displayOrder: lesson.displayOrder ?? 0,
        published: lesson.published ?? true,
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        chapterId: defaultChapterId,
        title: '',
        content: '',
        estimatedMinutes: 10,
        displayOrder: 0,
        published: true,
      });
    }

    setShowLessonModal(true);
  };

  const submitLesson = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...lessonForm,
        chapterId: Number(lessonForm.chapterId),
        estimatedMinutes: Number.isFinite(Number(lessonForm.estimatedMinutes)) ? Number(lessonForm.estimatedMinutes) : null,
        displayOrder: Number.isFinite(Number(lessonForm.displayOrder)) ? Number(lessonForm.displayOrder) : 0,
      };

      if (editingLesson) {
        await updateTeacherLesson(editingLesson.id, payload);
      } else {
        await createTeacherLesson(payload);
      }

      await loadData();
      setShowLessonModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save lesson.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      setSubmitting(true);
      await deleteTeacherLesson(lessonId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete lesson.');
    } finally {
      setSubmitting(false);
    }
  };

  const openQuestionModal = (question = null) => {
    if (!selectedQuizForQuestions && quizzes[0]?.id) {
      setSelectedQuizForQuestions(String(quizzes[0].id));
    }

    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        prompt: question.prompt || '',
        optionA: question.optionA || '',
        optionB: question.optionB || '',
        optionC: question.optionC || '',
        optionD: question.optionD || '',
        correctOption: question.correctOption || 'A',
        explanation: question.explanation || '',
        displayOrder: question.displayOrder ?? 0,
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
        explanation: '',
        displayOrder: 0,
      });
    }

    setShowQuestionModal(true);
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    if (!selectedQuizForQuestions) {
      setError('Choose a quiz before adding questions.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...questionForm,
        correctOption: String(questionForm.correctOption || 'A').toUpperCase(),
        displayOrder: Number.isFinite(Number(questionForm.displayOrder)) ? Number(questionForm.displayOrder) : 0,
      };

      if (editingQuestion) {
        await updateTeacherQuizQuestion(editingQuestion.id, payload);
      } else {
        await createTeacherQuizQuestion(selectedQuizForQuestions, payload);
      }

      const refreshedQuestions = await getTeacherQuizQuestions(selectedQuizForQuestions);
      setQuizQuestions(refreshedQuestions || []);
      setShowQuestionModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save quiz question.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      setSubmitting(true);
      await deleteTeacherQuizQuestion(questionId);
      const refreshedQuestions = await getTeacherQuizQuestions(selectedQuizForQuestions);
      setQuizQuestions(refreshedQuestions || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete quiz question.');
    } finally {
      setSubmitting(false);
    }
  };

  const openQuizModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title || '',
        description: quiz.description || '',
        quizType: quiz.quizType || 'FREE',
        durationMinutes: quiz.durationMinutes || 30,
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({
        title: '',
        description: '',
        quizType: 'FREE',
        durationMinutes: 30,
      });
    }
    setShowQuizModal(true);
  };

  const openAssignmentModal = (assignment = null) => {
    const defaultQuizId = quizzes[0]?.id ? String(quizzes[0].id) : '';
    const defaultStudentId = studentOptions[0]?.id || '';

    if (assignment) {
      setEditingAssignment(assignment);
      setAssignmentForm({
        title: assignment.title || '',
        description: assignment.description || '',
        quizId: String(assignment.quizId || defaultQuizId),
        studentId: String(assignment.studentId || defaultStudentId),
        dueAt: assignment.dueAt ? new Date(assignment.dueAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingAssignment(null);
      setAssignmentForm({
        title: '',
        description: '',
        quizId: defaultQuizId,
        studentId: defaultStudentId,
        dueAt: '',
      });
    }
    setShowAssignmentModal(true);
  };

  const handleQuizModalOpen = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title,
        description: quiz.description || '',
        quizType: quiz.quizType,
        durationMinutes: quiz.durationMinutes || 30,
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({
        title: '',
        description: '',
        quizType: 'FREE',
        durationMinutes: 30,
      });
    }
    setShowQuizModal(true);
  };

  const handleQuizModalClose = () => {
    setShowQuizModal(false);
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      quizType: 'FREE',
      durationMinutes: 30,
    });
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...quizForm,
        durationMinutes: Number.isFinite(Number(quizForm.durationMinutes)) ? Number(quizForm.durationMinutes) : null,
      };
      if (editingQuiz) {
        await updateTeacherQuiz(editingQuiz.id, payload);
      } else {
        await createTeacherQuiz(payload);
      }
      await loadData();
      handleQuizModalClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      setSubmitting(true);
      await deleteTeacherQuiz(quizId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignmentModalOpen = (assignment = null) => {
    const defaultQuizId = quizzes[0]?.id ? String(quizzes[0].id) : '';
    const defaultStudentId = studentOptions[0]?.id || '';

    if (assignment) {
      setEditingAssignment(assignment);
      setAssignmentForm({
        title: assignment.title || '',
        description: assignment.description || '',
        quizId: String(assignment.quizId || defaultQuizId),
        studentId: String(assignment.studentId || defaultStudentId),
        dueAt: assignment.dueAt ? new Date(assignment.dueAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingAssignment(null);
      setAssignmentForm({
        title: '',
        description: '',
        quizId: defaultQuizId,
        studentId: defaultStudentId,
        dueAt: '',
      });
    }
    setShowAssignmentModal(true);
  };

  const handleAssignmentModalClose = () => {
    setShowAssignmentModal(false);
    setEditingAssignment(null);
    setAssignmentForm({
      title: '',
      description: '',
      quizId: '',
      dueAt: '',
    });
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...assignmentForm,
        dueAt: assignmentForm.dueAt ? new Date(assignmentForm.dueAt).toISOString() : null,
        quizId: assignmentForm.quizId ? parseInt(assignmentForm.quizId) : null,
        studentId: assignmentForm.studentId ? parseInt(assignmentForm.studentId) : null,
      };
      if (editingAssignment) {
        await updateTeacherAssignment(editingAssignment.id, payload);
      } else {
        await createTeacherAssignment(payload);
      }
      await loadData();
      handleAssignmentModalClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      setSubmitting(true);
      await deleteTeacherAssignment(assignmentId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const completionRate = useMemo(() => {
    if (!performance.length) return 0;
    const totalAssignments = performance.reduce((acc, item) => acc + item.completedAssignments + item.pendingAssignments, 0);
    const completedAssignments = performance.reduce((acc, item) => acc + item.completedAssignments, 0);
    if (!totalAssignments) return 0;
    return Math.round((completedAssignments * 100) / totalAssignments);
  }, [performance]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Welcome back, {user?.username || 'Teacher'}!</h1>
          <p className="text-muted-foreground mt-1">
            Live overview of your lessons, quizzes, assignments, and student results.
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm font-semibold text-rose-700">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-8 text-slate-500 font-semibold flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading teacher data...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-cyan-50 border-cyan-100 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-800">Total Students</CardTitle>
                <div className="p-2 bg-cyan-200 rounded-xl">
                  <Users className="h-4 w-4 text-cyan-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{summary?.totalStudents || 0}</div>
                <p className="text-xs font-semibold text-cyan-700 mt-1">Students in active teacher data scope</p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-100 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-800">Average Score</CardTitle>
                <div className="p-2 bg-amber-200 rounded-xl">
                  <BarChart className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{summary?.averageScore || 0}%</div>
                <p className="text-xs font-semibold text-amber-700 mt-1">Across all tracked student attempts</p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-100 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">Assignment Completion</CardTitle>
                <div className="p-2 bg-emerald-200 rounded-xl">
                  <TrendingUp className="h-4 w-4 text-emerald-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{completionRate}%</div>
                <div className="h-2 w-full bg-emerald-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50 border-indigo-100 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-800">Pending Assignments</CardTitle>
                <div className="p-2 bg-indigo-200 rounded-xl">
                  <FileCheck className="h-4 w-4 text-indigo-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-indigo-700">{summary?.pendingAssignments || 0}</div>
                <p className="text-xs font-semibold text-indigo-600 mt-1">Awaiting completion/review</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="bg-slate-100/50 p-1 rounded-xl">
              <TabsTrigger value="performance" className="rounded-lg">Student Performance</TabsTrigger>
              <TabsTrigger value="submissions" className="rounded-lg">Submissions</TabsTrigger>
              <TabsTrigger value="content" className="rounded-lg">Content</TabsTrigger>
              <TabsTrigger value="quizzes" className="rounded-lg">Quizzes</TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-lg">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-6">
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Student Performance Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b-slate-100">
                        <TableHead>Student</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Assignments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performance.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-semibold text-slate-700">{student.studentName}</TableCell>
                          <TableCell>{student.attempts}</TableCell>
                          <TableCell>{student.averageScore}%</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-800 border-none mr-2">
                              Done: {student.completedAssignments}
                            </Badge>
                            <Badge className="bg-amber-100 text-amber-800 border-none">
                              Pending: {student.pendingAssignments}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Quiz Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quiz</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.attemptId}>
                          <TableCell className="font-medium">{submission.quizTitle}</TableCell>
                          <TableCell>{submission.studentName}</TableCell>
                          <TableCell>{submission.score}%</TableCell>
                          <TableCell>
                            <Badge className="bg-slate-100 text-slate-800 border-none">{submission.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="mt-6 space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="rounded-2xl shadow-sm border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Chapter Library</CardTitle>
                    <button
                      onClick={() => openChapterModal()}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" /> New Chapter
                    </button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Published</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chapters.map((chapter) => (
                          <TableRow key={chapter.id}>
                            <TableCell className="font-medium">{chapter.title}</TableCell>
                            <TableCell>{chapter.displayOrder ?? 0}</TableCell>
                            <TableCell>{chapter.published ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="flex gap-2">
                              <button
                                onClick={() => openChapterModal(chapter)}
                                className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                                disabled={submitting}
                              >
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => deleteChapter(chapter.id)}
                                className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                disabled={submitting}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Lesson Library</CardTitle>
                    <button
                      onClick={() => openLessonModal()}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" /> New Lesson
                    </button>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Minutes</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Published</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lessons.map((lesson) => (
                          <TableRow key={lesson.id}>
                            <TableCell className="font-medium max-w-[220px] truncate">{lesson.title}</TableCell>
                            <TableCell>{lesson.estimatedMinutes ?? '-'}</TableCell>
                            <TableCell>{lesson.displayOrder ?? 0}</TableCell>
                            <TableCell>{lesson.published ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="flex gap-2">
                              <button
                                onClick={() => openLessonModal(lesson)}
                                className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                                disabled={submitting}
                              >
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => deleteLesson(lesson.id)}
                                className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                disabled={submitting}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quizzes" className="mt-6">
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Created Quizzes</CardTitle>
                  <button
                    onClick={() => handleQuizModalOpen()}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" /> New Quiz
                  </button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell className="font-medium">{quiz.title}</TableCell>
                          <TableCell>{quiz.quizType}</TableCell>
                          <TableCell>{quiz.durationMinutes || '-'} min</TableCell>
                          <TableCell>{quiz.published ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="flex gap-2">
                            <button
                              onClick={() => handleQuizModalOpen(quiz)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                              disabled={submitting}
                              title="Edit quiz"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                              disabled={submitting}
                              title="Delete quiz"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-slate-200 mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Quiz Questions</CardTitle>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedQuizForQuestions}
                      onChange={(e) => setSelectedQuizForQuestions(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                    >
                      <option value="">Select Quiz</option>
                      {quizzes.map((quiz) => (
                        <option key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => openQuestionModal()}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      disabled={!selectedQuizForQuestions}
                    >
                      <Plus className="h-4 w-4" /> New Question
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Correct</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className="font-medium max-w-[360px] truncate">{question.prompt}</TableCell>
                          <TableCell>{question.correctOption}</TableCell>
                          <TableCell>{question.displayOrder ?? 0}</TableCell>
                          <TableCell className="flex gap-2">
                            <button
                              onClick={() => openQuestionModal(question)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                              disabled={submitting}
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteQuestion(question.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                              disabled={submitting}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="mt-6">
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Published Assignments</CardTitle>
                  <button
                    onClick={() => handleAssignmentModalOpen()}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" /> New Assignment
                  </button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell>
                            <Badge className="bg-indigo-100 text-indigo-800 border-none">{assignment.status}</Badge>
                          </TableCell>
                          <TableCell>{assignment.dueAt ? new Date(assignment.dueAt).toLocaleString() : '-'}</TableCell>
                          <TableCell className="flex gap-2">
                            <button
                              onClick={() => handleAssignmentModalOpen(assignment)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                              disabled={submitting}
                              title="Edit assignment"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                              disabled={submitting}
                              title="Delete assignment"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</CardTitle>
              <button
                onClick={handleQuizModalClose}
                className="p-1 hover:bg-slate-100 rounded"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quiz Type</label>
                  <select
                    value={quizForm.quizType}
                    onChange={(e) => setQuizForm({ ...quizForm, quizType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="FREE">Free Practice</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="TIMED">Timed Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={quizForm.durationMinutes}
                    onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    disabled={submitting}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleQuizModalClose}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Quiz'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</CardTitle>
              <button
                onClick={handleAssignmentModalClose}
                className="p-1 hover:bg-slate-100 rounded"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Assignment Title</label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Associated Quiz</label>
                  <select
                    value={assignmentForm.quizId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, quizId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Select a Quiz</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Student</label>
                  <select
                    value={assignmentForm.studentId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Select a Student</option>
                    {studentOptions.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.dueAt}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueAt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleAssignmentModalClose}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Assignment'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>{editingChapter ? 'Edit Chapter' : 'Create Chapter'}</CardTitle>
              <button
                onClick={() => setShowChapterModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={submitChapter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={chapterForm.description}
                    onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={chapterForm.displayOrder}
                      onChange={(e) => setChapterForm({ ...chapterForm, displayOrder: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-2">
                    <input
                      id="chapterPublished"
                      type="checkbox"
                      checked={chapterForm.published}
                      onChange={(e) => setChapterForm({ ...chapterForm, published: e.target.checked })}
                      disabled={submitting}
                    />
                    <label htmlFor="chapterPublished" className="text-sm font-medium">Published</label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowChapterModal(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Chapter'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</CardTitle>
              <button
                onClick={() => setShowLessonModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={submitLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Chapter</label>
                  <select
                    value={lessonForm.chapterId}
                    onChange={(e) => setLessonForm({ ...lessonForm, chapterId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    required
                  >
                    <option value="">Select a Chapter</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Minutes</label>
                    <input
                      type="number"
                      value={lessonForm.estimatedMinutes}
                      onChange={(e) => setLessonForm({ ...lessonForm, estimatedMinutes: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={lessonForm.displayOrder}
                      onChange={(e) => setLessonForm({ ...lessonForm, displayOrder: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-2">
                    <input
                      id="lessonPublished"
                      type="checkbox"
                      checked={lessonForm.published}
                      onChange={(e) => setLessonForm({ ...lessonForm, published: e.target.checked })}
                      disabled={submitting}
                    />
                    <label htmlFor="lessonPublished" className="text-sm font-medium">Published</label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLessonModal(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Lesson'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>{editingQuestion ? 'Edit Question' : 'Create Question'}</CardTitle>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={submitQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prompt</label>
                  <textarea
                    value={questionForm.prompt}
                    onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {['A', 'B', 'C', 'D'].map((label) => (
                    <div key={label}>
                      <label className="block text-sm font-medium mb-1">Option {label}</label>
                      <input
                        type="text"
                        value={questionForm[`option${label}`]}
                        onChange={(e) => setQuestionForm({ ...questionForm, [`option${label}`]: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={submitting}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Correct Option</label>
                    <select
                      value={questionForm.correctOption}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctOption: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    >
                      {['A', 'B', 'C', 'D'].map((label) => (
                        <option key={label} value={label}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={questionForm.displayOrder}
                      onChange={(e) => setQuestionForm({ ...questionForm, displayOrder: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                  <div />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Explanation</label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Question'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
