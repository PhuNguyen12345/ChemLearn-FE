import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Clock,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  FileText,
  ArrowUpDown,
  Search,
  History,
  Trophy,
  Calendar,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  getClassChapterLessons,
  getClassChapters,
  getClassQuizzes,
  getStudentClasses,
  getQuizAttemptHistory
} from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

/* ─────────────────────────────────────────────
   Quiz type styling
───────────────────────────────────────────── */
const quizTypeConfig = {
  FREE: { label: 'Practice', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ASSIGNMENT: { label: 'Assignment', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  MINI_QUIZ: { label: 'Mini Quiz', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  EXAM: { label: 'Exam', color: 'bg-violet-100 text-violet-700 border-violet-200' },
};

const getQuizTypeStyle = (quizType) => {
  const key = String(quizType || '').toUpperCase();
  return quizTypeConfig[key] || { label: 'Quiz', color: 'bg-slate-100 text-slate-700 border-slate-200' };
};

/* ─────────────────────────────────────────────
   Sort options
───────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title (A → Z)' },
  { value: 'title-desc', label: 'Title (Z → A)' },
  { value: 'type', label: 'Type' },
  { value: 'duration-asc', label: 'Duration (Short → Long)' },
  { value: 'duration-desc', label: 'Duration (Long → Short)' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

const sortQuizzes = (quizzes, sortBy) => {
  const sorted = [...quizzes];
  switch (sortBy) {
    case 'title-asc':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'title-desc':
      return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    case 'type':
      return sorted.sort((a, b) => (a.quizType || '').localeCompare(b.quizType || ''));
    case 'duration-asc':
      return sorted.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    case 'duration-desc':
      return sorted.sort((a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    default:
      return sorted;
  }
};

/* ═════════════════════════════════════════════
   Main Component
═════════════════════════════════════════════ */
const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [lessonsByChapter, setLessonsByChapter] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('documents');
  const [expandedChapters, setExpandedChapters] = useState({});
  const [quizSort, setQuizSort] = useState('title-asc');
  const [quizSearch, setQuizSearch] = useState('');
  const [selectedQuizForHistory, setSelectedQuizForHistory] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError('');

        const [classList, chapterData, quizData] = await Promise.all([
          getStudentClasses(),
          getClassChapters(classId),
          getClassQuizzes(classId),
        ]);

        const chapterList = chapterData || [];
        const lessonEntries = await Promise.all(
          chapterList
            .filter((chapter) => chapter?.id)
            .map(async (chapter) => {
              try {
                const lessons = await getClassChapterLessons(classId, chapter.id);
                return [chapter.id, lessons || []];
              } catch {
                return [chapter.id, []];
              }
            }),
        );

        const foundClass = (classList || []).find((item) => item.id === classId) || null;

        setClassInfo(foundClass);
        setChapters(chapterList);
        setLessonsByChapter(Object.fromEntries(lessonEntries));
        setQuizzes(quizData || []);

        // Auto-expand all chapters
        const expanded = {};
        chapterList.forEach((ch) => {
          expanded[ch.id] = true;
        });
        setExpandedChapters(expanded);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load class details.');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      loadDetail();
    }
  }, [classId]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };
  
  const handleViewHistory = async (quiz) => {
    setSelectedQuizForHistory(quiz);
    setLoadingHistory(true);
    try {
      const history = await getQuizAttemptHistory(quiz.id);
      setAttemptHistory(history);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filtered & sorted quizzes
  const processedQuizzes = useMemo(() => {
    let filtered = quizzes;
    if (quizSearch.trim()) {
      const q = quizSearch.toLowerCase();
      filtered = quizzes.filter(
        (quiz) =>
          (quiz.title || '').toLowerCase().includes(q) ||
          (quiz.description || '').toLowerCase().includes(q),
      );
    }
    return sortQuizzes(filtered, quizSort);
  }, [quizzes, quizSort, quizSearch]);

  // Total lesson count
  const totalLessons = useMemo(
    () => Object.values(lessonsByChapter).reduce((sum, lessons) => sum + lessons.length, 0),
    [lessonsByChapter],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold text-slate-500">Loading class content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/student/classes')}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to classes
      </button>

      {/* Class Header Card (simplified) */}
      <div className="relative overflow-hidden rounded-lg bg-indigo-600 p-5 text-white">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium uppercase bg-white/10 rounded mb-2">
            Class workspace
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            {classInfo?.name || 'Class'}
          </h1>
          <p className="mt-1 text-indigo-100 text-sm font-medium max-w-2xl">
            {classInfo?.description || 'Explore your class materials and quizzes below.'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium bg-white/10 rounded">
              Code: {classInfo?.classCode || 'N/A'}
            </span>
            <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium bg-white/10 rounded">
              <BookOpen className="h-3.5 w-3.5" />
              {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium bg-white/10 rounded">
              <ClipboardList className="h-3.5 w-3.5" />
              {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        <TabButton
          active={activeTab === 'documents'}
          onClick={() => setActiveTab('documents')}
          icon={FileText}
          label="Documents"
          count={chapters.length}
        />
        <TabButton
          active={activeTab === 'quizzes'}
          onClick={() => setActiveTab('quizzes')}
          icon={ClipboardList}
          label="Quizzes"
          count={quizzes.length}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'documents' && (
        <DocumentsTab
          chapters={chapters}
          lessonsByChapter={lessonsByChapter}
          expandedChapters={expandedChapters}
          toggleChapter={toggleChapter}
          classId={classId}
          navigate={navigate}
        />
      )}

      {activeTab === 'quizzes' && (
        <QuizzesTab
          quizzes={processedQuizzes}
          totalCount={quizzes.length}
          quizSort={quizSort}
          setQuizSort={setQuizSort}
          quizSearch={quizSearch}
          setQuizSearch={setQuizSearch}
          navigate={navigate}
          onViewHistory={handleViewHistory}
        />
      )}

      {/* Attempt History Modal */}
      {selectedQuizForHistory && (
        <AttemptHistoryModal
          quiz={selectedQuizForHistory}
          history={attemptHistory}
          loading={loadingHistory}
          onClose={() => setSelectedQuizForHistory(null)}
          onRetake={(quizId) => navigate(`/student/quiz/${quizId}`)}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Tab Button
───────────────────────────────────────────── */
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition ${
      active ? 'text-slate-900 border-b-2 border-indigo-500' : 'text-slate-500'
    }`}
  >
    <Icon className="h-4 w-4" />
    {label}
    <span className="ml-1 text-xs text-slate-400">{count}</span>
  </button>
);

/* ─────────────────────────────────────────────
   Documents Tab
───────────────────────────────────────────── */
const DocumentsTab = ({ chapters, lessonsByChapter, expandedChapters, toggleChapter, classId, navigate }) => {
  if (chapters.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-700">No documents yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Your teacher hasn't published any chapters or lessons to this class yet. Check back later!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => {
        const lessons = lessonsByChapter[chapter.id] || [];
        const isExpanded = expandedChapters[chapter.id];

        return (
          <Card key={chapter.id} className="border-slate-200 shadow-sm overflow-hidden">
            {/* Chapter header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
            >
              {/* Chapter number badge */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-sm font-black shadow-md shadow-indigo-200/50">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-slate-800 truncate">{chapter.title}</h3>
                {chapter.description && (
                  <p className="mt-0.5 text-xs text-slate-500 truncate">{chapter.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                    isExpanded ? '' : '-rotate-90'
                  }`}
                />
              </div>
            </button>

            {/* Lessons list */}
            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50/50">
                {lessons.length === 0 ? (
                  <div className="px-5 py-4 text-sm font-semibold text-slate-400">
                    No lessons in this chapter yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => navigate(`/student/class/${classId}/material/${lesson.id}`)}
                        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-indigo-50/60 group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-500 group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors">
                          {lessonIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.estimatedMinutes > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                              <Clock className="h-3 w-3" />
                              {lesson.estimatedMinutes} min
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Attempt History Modal
───────────────────────────────────────────── */
const AttemptHistoryModal = ({ quiz, history, loading, onClose, onRetake }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 md:p-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{quiz.title}</h2>
              <p className="text-slate-500 font-bold text-sm mt-1">Attempt History & Results</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <X className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <LoaderCircle className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <History className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">No attempts yet. Ready to start?</p>
              </div>
            ) : (
              history.map((attempt, idx) => {
                const isCompleted = attempt.status === 'COMPLETED';
                const isPending = attempt.status === 'NEEDS_GRADING';
                const score = attempt.score !== null ? attempt.score : 0;
                
                return (
                  <div key={attempt.id} className="group relative flex items-center gap-4 p-5 rounded-3xl border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 font-black shadow-sm group-hover:text-indigo-500 group-hover:border-indigo-200 transition-colors">
                      #{history.length - idx}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          isPending ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {attempt.status?.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Trophy className={`h-4 w-4 ${isCompleted ? 'text-amber-500' : 'text-slate-300'}`} />
                          <span className="text-lg font-black text-slate-700">
                            {isCompleted ? `${Math.round(score)}%` : isPending ? 'Pending' : 'In Progress'}
                          </span>
                        </div>
                        {isCompleted && (
                          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {attempt.correctAnswers} / {attempt.totalQuestions} Correct
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Removed per-item retake button to reduce visual clutter */}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-11 rounded-md font-medium text-slate-600 hover:bg-slate-50 border-slate-200"
            >
              Close
            </Button>
            <Button 
              onClick={() => onRetake(quiz.id)}
              className="flex-1 h-11 rounded-md font-medium bg-slate-900 hover:bg-slate-950 text-white"
            >
              Start New Attempt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Quizzes Tab
───────────────────────────────────────────── */
const QuizzesTab = ({ quizzes, totalCount, quizSort, setQuizSort, quizSearch, setQuizSearch, navigate, onViewHistory }) => {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={quizSearch}
            onChange={(e) => setQuizSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={quizSort}
            onChange={(e) => setQuizSort(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz list */}
      {totalCount === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <ClipboardList className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-700">No quizzes yet</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                Your teacher hasn't published any quizzes to this class yet. Check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : quizzes.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-8">
            <p className="text-center text-sm font-semibold text-slate-500">
              No quizzes match your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              onClick={() => navigate(`/student/quiz/${quiz.id}`)}
              onHistory={() => onViewHistory(quiz)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Quiz Card
───────────────────────────────────────────── */
const QuizCard = ({ quiz, onClick, onHistory }) => {
  const typeStyle = getQuizTypeStyle(quiz.quizType);

  return (
    <Card 
      onClick={onClick}
      className="border-slate-200 hover:border-indigo-100 transition-all duration-200 overflow-hidden group cursor-pointer"
    >
      {/* Color accent bar */}
      <div className="h-1 bg-indigo-500" />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-black text-slate-800 truncate">
              {quiz.title}
            </CardTitle>
            {quiz.description && (
              <CardDescription className="mt-1 text-xs text-slate-500 line-clamp-2">
                {quiz.description}
              </CardDescription>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${typeStyle.color}`}
          >
            {typeStyle.label}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {quiz.durationMinutes || '—'} min
          </span>
          <span className="inline-flex items-center gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            {quiz.questionCount || 0} question{(quiz.questionCount || 0) !== 1 ? 's' : ''}
          </span>
          {quiz.startTime && (
            <span className="text-slate-400">
              Opens {new Date(quiz.startTime).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button 
            onClick={onClick}
            className="flex-1 rounded-md h-9 font-semibold bg-indigo-600 hover:bg-indigo-700"
          >
            Take Quiz
          </Button>
          <button
            onClick={(e) => { e.stopPropagation(); onHistory(); }}
            title="Attempt History"
            className="flex items-center justify-center h-9 w-9 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <History className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassDetail;
