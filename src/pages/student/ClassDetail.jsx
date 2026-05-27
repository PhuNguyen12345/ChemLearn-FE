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
  Sparkles,
  Users
} from 'lucide-react';
import {
  getClassChapterLessons,
  getClassChapters,
  getClassQuizzes,
  getStudentClasses,
  getQuizAttemptHistory
} from '../../lib/api';

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

const DEADLINE_WARNING_HOURS = 48;

const getDeadlineStatus = (dueDate) => {
  if (!dueDate) return null;
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return null;

  const msLeft = parsed.getTime() - Date.now();
  const isPastDue = msLeft <= 0;
  const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const isNear = !isPastDue && msLeft <= DEADLINE_WARNING_HOURS * 60 * 60 * 1000;
  const remainingLabel = isPastDue
    ? 'Overdue'
    : hoursLeft < 24
      ? `Due in ${Math.max(hoursLeft, 1)}h`
      : `Due in ${Math.max(daysLeft, 1)}d`;
  const tone = isPastDue
    ? 'bg-rose-100 text-rose-700 border-rose-200'
    : isNear
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  return {
    dueAt: parsed,
    isPastDue,
    isNear,
    remainingLabel,
    tone,
  };
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
          <LoaderCircle className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-black uppercase tracking-widest text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Back button */}
      <button
        onClick={() => navigate('/student/classes')}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 hover:-translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        QUAY LẠI LỚP HỌC
      </button>

      {/* Class Header Card (Gamified) */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] border-b-4 border-purple-700">
        {/* Background blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Floating decorative icons */}
        <div className="absolute top-8 right-14 text-pink-200 animate-bounce" style={{ animationDuration: '3.1s', animationDelay: '0.5s' }}>
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase border border-white/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Khu vực lớp học
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm mb-2">
              {classInfo?.name || 'Class'}
            </h1>
            <p className="mt-1 text-purple-100 text-base font-semibold max-w-2xl opacity-90">
              {classInfo?.description || 'Explore your class materials and quizzes below.'}
            </p>
            
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl font-bold border border-white/20">
                Mã lớp: {classInfo?.classCode || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl font-bold border border-white/20">
                <BookOpen className="h-4 w-4" />
                {chapters.length} Chương{chapters.length !== 1 ? 's' : ''} · {totalLessons} Bài{totalLessons !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl font-bold border border-white/20">
                <ClipboardList className="h-4 w-4" />
                {quizzes.length} Bài kiểm tra{quizzes.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-[1.5rem] shadow-inner border border-white/30 shrink-0">
             <BookOpen className="w-12 h-12 text-white animate-[bounce_2.5s_ease-in-out_infinite]" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          {error}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex p-1.5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm max-w-sm">
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
      <div className="pt-2">
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
      </div>

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
const TabButton = ({ active, onClick, icon: Icon, label, count }) => {
  const IconComponent = Icon;

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${
        active
          ? 'bg-indigo-100 text-indigo-700 shadow-sm shadow-indigo-200/50 scale-[1.02]'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      <IconComponent className="h-4 w-4" />
      {label}
      <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] ${active ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
    </button>
  );
};

/* ─────────────────────────────────────────────
   Documents Tab
───────────────────────────────────────────── */
const DocumentsTab = ({ chapters, lessonsByChapter, expandedChapters, toggleChapter, classId, navigate }) => {
  if (chapters.length === 0) {
    return (
      <div className="p-10 bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-sm text-center">
         <div className="w-20 h-20 mx-auto bg-slate-100 rounded-[1.5rem] flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-slate-300" />
         </div>
         <h3 className="text-xl font-black text-slate-700 mb-2">No documents yet</h3>
         <p className="text-slate-500 font-semibold max-w-sm mx-auto">Your teacher hasn't published any chapters or lessons to this class yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => {
        const lessons = lessonsByChapter[chapter.id] || [];
        const isExpanded = expandedChapters[chapter.id];

        return (
          <div key={chapter.id} className="rounded-[1.5rem] bg-white border-2 border-slate-200 border-b-[4px] border-b-slate-300 shadow-sm overflow-hidden transition-all duration-200">
            {/* Chapter header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50"
            >
              {/* Chapter number badge */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-lg font-black shadow-md shadow-indigo-300/50">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-800 truncate">{chapter.title}</h3>
                {chapter.description && (
                  <p className="mt-0.5 text-sm font-semibold text-slate-500 truncate">{chapter.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                  {lessons.length} Lesson{lessons.length !== 1 ? 's' : ''}
                </span>
                <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                </div>
              </div>
            </button>

            {/* Lessons list */}
            {isExpanded && (
              <div className="border-t-2 border-slate-100 bg-slate-50/50 p-2">
                {lessons.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm font-bold text-slate-400">
                    Chương này chưa có bài học.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => navigate(`/student/class/${classId}/material/${lesson.id}`)}
                        className="group flex w-full items-center gap-4 px-4 py-3 rounded-xl bg-white border border-slate-200 text-left transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50 hover:-translate-y-0.5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-black text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          {lessonIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-base font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {lesson.estimatedMinutes > 0 && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              {lesson.estimatedMinutes} MIN
                            </span>
                          )}
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                            <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Quizzes Tab
───────────────────────────────────────────── */
const QuizzesTab = ({ quizzes, totalCount, quizSort, setQuizSort, quizSearch, setQuizSearch, navigate, onViewHistory }) => {
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={quizSearch}
            onChange={(e) => setQuizSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
          />
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={quizSort}
            onChange={(e) => setQuizSort(e.target.value)}
            className="appearance-none pl-11 pr-10 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Quiz list */}
      {totalCount === 0 ? (
        <div className="p-10 bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-sm text-center">
           <div className="w-20 h-20 mx-auto bg-slate-100 rounded-[1.5rem] flex items-center justify-center mb-4">
              <ClipboardList className="w-10 h-10 text-slate-300" />
           </div>
           <h3 className="text-xl font-black text-slate-700 mb-2">Chưa có bài kiểm tra</h3>
           <p className="text-slate-500 font-semibold max-w-sm mx-auto">Giáo viên chưa xuất bản bài kiểm tra cho lớp này. Hãy kiểm tra lại sau!</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="p-8 bg-white rounded-[1.5rem] border-2 border-slate-200 text-center">
          <p className="text-sm font-bold text-slate-500">Chưa có bài kiểm tra nào khớp với tìm kiếm của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
  const deadline = getDeadlineStatus(quiz.dueDate);
  const deadlineLabel = deadline
    ? `Due ${deadline.dueAt.toLocaleString()}${deadline.isPastDue || deadline.isNear ? ` - ${deadline.remainingLabel}` : ''}`
    : null;

  return (
    <div 
      onClick={onClick}
      className="group flex flex-col p-6 rounded-[1.5rem] bg-white border-2 border-indigo-200 border-b-[6px] border-b-indigo-400 hover:border-b-indigo-500 active:border-b-2 active:translate-y-1 transition-all duration-150 shadow-sm cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
      
      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 truncate group-hover:text-indigo-900">{quiz.title}</h3>
          {quiz.description && (
            <p className="text-xs font-bold text-slate-400 line-clamp-2">{quiz.description}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${typeStyle.color}`}
        >
          {typeStyle.label}
        </span>
      </div>

      <div className="relative z-10 mt-auto pt-4 border-t-2 border-slate-100">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 mb-4">
          <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {quiz.durationMinutes || '—'} phút
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
            <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
            {quiz.questionCount || 0} câu hỏi
          </span>
          {deadlineLabel && (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${deadline.tone}`}>
              <Calendar className="h-3.5 w-3.5" />
              {deadlineLabel}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClick}
            className="flex-1 py-2.5 px-4 rounded-xl font-black text-white bg-gradient-to-b from-indigo-500 to-indigo-600 border-b-[4px] border-indigo-800 hover:from-indigo-600 hover:to-indigo-700 shadow-sm shadow-indigo-300/50 text-sm"
          >
            BẮT ĐẦU
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onHistory(); }}
            title="Attempt History"
            className="w-12 flex items-center justify-center rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
          >
            <History className="h-5 w-5" />
          </button>
        </div>
      </div>
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
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-4 border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-6 border-b-2 border-slate-100 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase mb-3">
                <History className="w-3.5 h-3.5" />
                Attempt History
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{quiz.title}</h2>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 shrink-0">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <LoaderCircle className="h-10 w-10 animate-spin text-indigo-500" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Fetching records...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-700 mb-1">No Attempts Yet</h3>
                <p className="text-slate-500 font-bold text-sm">You haven't taken this quiz yet. Ready to start?</p>
              </div>
            ) : (
              history.map((attempt, idx) => {
                const isCompleted = attempt.status === 'COMPLETED';
                const isPending = attempt.status === 'NEEDS_GRADING';
                const score = attempt.score !== null ? attempt.score : 0;
                
                return (
                  <div key={attempt.id} className="group relative flex items-center gap-5 p-5 rounded-[1.5rem] border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-white border-2 border-slate-100 text-slate-400 font-black text-lg shadow-sm group-hover:text-indigo-600 group-hover:border-indigo-300 transition-colors">
                      #{history.length - idx}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-2 ${
                          isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                          isPending ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                          'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {attempt.status?.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Trophy className={`h-5 w-5 ${isCompleted ? 'text-amber-500' : 'text-slate-300'}`} />
                          <span className="text-xl font-black text-slate-800">
                            {isCompleted ? `${Math.round(score)}%` : isPending ? 'Pending' : 'In Progress'}
                          </span>
                        </div>
                        {isCompleted && (
                          <div className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            {attempt.correctAnswers} / {attempt.totalQuestions} Correct
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-6 border-t-2 border-slate-100 bg-slate-50 rounded-b-[2.5rem] shrink-0">
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl font-black text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              CLOSE
            </button>
            <button 
              onClick={() => onRetake(quiz.id)}
              className="flex-[2] py-4 px-6 rounded-2xl font-black text-white bg-gradient-to-b from-indigo-500 to-indigo-600 border-b-[5px] border-indigo-800 hover:from-indigo-600 hover:to-indigo-700 active:border-b-0 active:translate-y-1 shadow-sm shadow-indigo-300/50 transition-all text-center"
            >
              START NEW ATTEMPT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClassDetail;
