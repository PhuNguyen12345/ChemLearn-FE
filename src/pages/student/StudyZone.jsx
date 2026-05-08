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
  Users,
  Link as LinkIcon,
} from 'lucide-react';
import {
  getStudyChapters,
  getStudyLesson,
  submitLessonMiniQuiz,
} from '../../lib/api';

import ChapterSidebar from '../../components/student/study/ChapterSidebar';
import LessonContent from '../../components/student/study/LessonContent';
import MiniQuizSection from '../../components/student/study/MiniQuizSection';

const stripeStyle = {
  backgroundImage:
    'repeating-linear-gradient(-45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 6px, transparent 6px, transparent 12px)',
};

const StudyZone = () => {
  const [chapters, setChapters] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
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
        setChapters(data || []);

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
  }, []);

  useEffect(() => {
    const loadLesson = async () => {
      if (!activeLessonId) return;
      try {
        setLoadingLesson(true);
        setError('');
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

  const flatLessons = useMemo(() => chapters.flatMap((chapter) => chapter.lessons || []), [chapters]);
  const progressPct = flatLessons.length ? Math.round((0 / flatLessons.length) * 100) : 0;

  const handleQuizSubmit = async () => {
    // Mini-quiz is stubbed; will be enabled later
  };

  // join class removed from Study Zone - handled in Classes tab

  return (
    <div className="flex h-full w-full bg-slate-50 flex-col md:flex-row overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <ChapterSidebar chapters={chapters} activeLessonId={activeLessonId} onSelectLesson={setActiveLessonId} />

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
          <LessonContent lessonDetail={lessonDetail} />
        )}
      </div>
    </div>
  );
};

export default StudyZone;
