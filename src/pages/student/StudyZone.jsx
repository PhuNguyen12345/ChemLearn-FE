import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  Lock,
  Target,
  LoaderCircle,
} from 'lucide-react';
import {
  getStudyChapters,
  getStudyLesson,
  submitLessonMiniQuiz,
} from '../../lib/api';

const stripeStyle = {
  backgroundImage:
    'repeating-linear-gradient(-45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 6px, transparent 6px, transparent 12px)',
};

const StudyZone = () => {
  const [chapters, setChapters] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [miniQuizResult, setMiniQuizResult] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChapters = async () => {
      try {
        setLoadingChapters(true);
        setError('');
        const data = await getStudyChapters();
        setChapters(data);

        const firstLesson = data?.[0]?.lessons?.[0];
        if (firstLesson) {
          setActiveLessonId(firstLesson.id);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load study chapters.');
      } finally {
        setLoadingChapters(false);
      }
    };

    loadChapters();
  }, []);

  useEffect(() => {
    const loadLesson = async () => {
      if (!activeLessonId) return;
      try {
        setLoadingLesson(true);
        setError('');
        setMiniQuizResult(null);
        setSelectedOptions({});
        const data = await getStudyLesson(activeLessonId);
        setLessonDetail(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load lesson details.');
      } finally {
        setLoadingLesson(false);
      }
    };

    loadLesson();
  }, [activeLessonId]);

  const flatLessons = useMemo(
    () => chapters.flatMap((chapter) => chapter.lessons || []),
    [chapters]
  );

  const progressPct = flatLessons.length
    ? Math.round((completedLessons.size / flatLessons.length) * 100)
    : 0;

  const handleQuizSubmit = async () => {
    if (!lessonDetail?.miniQuizQuestions?.length) return;

    const answers = lessonDetail.miniQuizQuestions
      .filter((q) => selectedOptions[q.id])
      .map((q) => ({ questionId: q.id, selectedOption: selectedOptions[q.id] }));

    if (!answers.length) return;

    try {
      setSubmittingQuiz(true);
      const result = await submitLessonMiniQuiz(lessonDetail.id, { answers });
      setMiniQuizResult(result);

      if (result.passed) {
        setCompletedLessons((prev) => new Set(prev).add(lessonDetail.id));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit mini quiz.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 flex-col md:flex-row overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col h-full overflow-y-auto shrink-0">
        <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-500 rounded-xl shadow-md shadow-indigo-200">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            Course Map
          </h2>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black text-indigo-500 uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" /> Progress
              </span>
              <span>{progressPct}%</span>
            </div>

            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-500 relative overflow-hidden transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              >
                <div
                  className="absolute inset-0 rounded-full animate-[shimmer_1.5s_linear_infinite]"
                  style={stripeStyle}
                />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/25 rounded-full" />
              </div>
            </div>

            <p className="text-xs text-slate-400 font-bold">
              {completedLessons.size} / {flatLessons.length} lessons completed
            </p>
          </div>
        </div>

        <div className="p-4 space-y-5 flex-1">
          {loadingChapters && (
            <div className="text-sm text-slate-500 font-semibold flex items-center gap-2">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Loading chapters...
            </div>
          )}

          {!loadingChapters && chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-1">
              <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest px-2 mb-2 flex items-center gap-1.5">
                <span className="flex-1">{chapter.title}</span>
              </h3>

              <ul className="space-y-1">
                {(chapter.lessons || []).map((lesson) => {
                  const isActive = activeLessonId === lesson.id;
                  const isCompleted = completedLessons.has(lesson.id);

                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 text-sm group
                          ${isActive
                            ? 'bg-indigo-500 text-white font-black shadow-md shadow-indigo-300/40 border-b-[3px] border-indigo-700'
                            : 'text-slate-600 font-semibold hover:bg-indigo-50 hover:text-indigo-700 hover:-translate-y-0.5 hover:shadow-sm border-b-[3px] border-transparent'
                          }
                        `}
                      >
                        <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all
                          ${isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-100' : 'bg-slate-100'}
                        `}>
                          {isCompleted ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                          ) : isActive ? (
                            <PlayCircle className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate-300" />
                          )}
                        </span>

                        <span className="truncate flex-1">{lesson.title}</span>

                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white relative flex flex-col">
        {error && (
          <div className="mx-6 mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {loadingLesson && (
          <div className="p-8 text-slate-500 font-semibold flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin" /> Loading lesson...
          </div>
        )}

        {!loadingLesson && lessonDetail && (
          <>
            <div className="bg-white px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-3">
                <span>{lessonDetail.chapterTitle}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-indigo-500 font-black">{lessonDetail.title}</span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                {lessonDetail.title}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-black text-fuchsia-600 bg-fuchsia-100 border border-fuchsia-200 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" /> +20 XP mini-quiz
                </span>
                <span className="text-xs font-bold text-slate-400">
                  ~{lessonDetail.estimatedMinutes || 8} min read
                </span>
              </div>
            </div>

            <div className="p-8 max-w-3xl mx-auto w-full space-y-8 flex-1">
              <p className="text-slate-700 text-lg leading-relaxed">{lessonDetail.content}</p>

              {!!lessonDetail.miniQuizQuestions?.length && (
                <div className="mt-4 rounded-3xl overflow-hidden border-2 border-slate-800 border-b-[6px] shadow-xl shadow-slate-900/10">
                  <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-xl shadow-md">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base leading-none">Knowledge Check</h3>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">Submit to check your understanding</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 space-y-6">
                    {lessonDetail.miniQuizQuestions.map((question, qIndex) => (
                      <div key={question.id} className="space-y-3 border border-slate-100 rounded-2xl p-4">
                        <p className="text-lg font-black text-slate-800">
                          {qIndex + 1}. {question.prompt}
                        </p>
                        {['A', 'B', 'C', 'D'].map((label) => {
                          const text = question[`option${label}`];
                          const isSelected = selectedOptions[question.id] === label;
                          return (
                            <button
                              key={label}
                              onClick={() => setSelectedOptions((prev) => ({ ...prev, [question.id]: label }))}
                              className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-bold transition-all
                                ${isSelected
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                                }
                              `}
                            >
                              <span className="mr-2">{label}.</span>{text}
                            </button>
                          );
                        })}
                      </div>
                    ))}

                    {miniQuizResult && (
                      <div className={`p-4 rounded-2xl border-2 font-bold ${miniQuizResult.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                        Score {miniQuizResult.score}% ({miniQuizResult.correctAnswers}/{miniQuizResult.totalQuestions} correct) - {miniQuizResult.passed ? 'Passed' : 'Try again'}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleQuizSubmit}
                        disabled={submittingQuiz}
                        className="px-7 py-3 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-black rounded-2xl border-b-[4px] border-indigo-800 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-40 transition-all duration-150 shadow-md shadow-indigo-200"
                      >
                        {submittingQuiz ? 'Submitting...' : 'Submit Mini Quiz'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudyZone;
