import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LoaderCircle,
  BookOpen,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import {
  getStudyChapters,
  getStudyLesson,
} from '../../lib/api';

import ChapterSidebar from '../../components/student/study/ChapterSidebar';
import LessonContent from '../../components/student/study/LessonContent';

const isLockedChapter = (chapter) => Boolean(chapter?.needPurchase && chapter?.hasAccess === false);

const getOrderValue = (item, fallbackIndex) => {
  const value = item?.orderIndex ?? item?.displayOrder ?? fallbackIndex;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallbackIndex;
};

const sortByAvailabilityAndOrder = (left, right) => {
  if (left.locked !== right.locked) return left.locked ? 1 : -1;
  if (left.order !== right.order) return left.order - right.order;
  return left.index - right.index;
};

const sortStudyChapters = (chapters) => (chapters || [])
  .map((chapter, chapterIndex) => {
    const locked = isLockedChapter(chapter);
    const lessons = (chapter.lessons || [])
      .map((lesson, lessonIndex) => ({
        lesson,
        locked,
        order: getOrderValue(lesson, lessonIndex),
        index: lessonIndex,
      }))
      .sort(sortByAvailabilityAndOrder)
      .map(({ lesson }) => lesson);

    return {
      chapter: {
        ...chapter,
        lessons,
      },
      locked,
      order: getOrderValue(chapter, chapterIndex),
      index: chapterIndex,
    };
  })
  .sort(sortByAvailabilityAndOrder)
  .map(({ chapter }) => chapter);

const StudyZone = () => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sortedChapters = useMemo(() => sortStudyChapters(chapters), [chapters]);
  const hasLessons = sortedChapters.some((chapter) => (chapter.lessons || []).length > 0);
  const orderedLessons = useMemo(
    () => sortedChapters.flatMap((chapter) => isLockedChapter(chapter) ? [] : (chapter?.lessons || [])),
    [sortedChapters]
  );
  const lockedChapter = useMemo(
    () => (!activeLessonId ? sortedChapters.find((chapter) => isLockedChapter(chapter)) : null),
    [activeLessonId, sortedChapters]
  );
  const activeLessonIndex = orderedLessons.findIndex(
    (lesson) => String(lesson.id) === String(activeLessonId)
  );
  const previousLesson = activeLessonIndex > 0 ? orderedLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < orderedLessons.length - 1
    ? orderedLessons[activeLessonIndex + 1]
    : null;

  useEffect(() => {
    const loadChapters = async () => {
      try {
        setError('');
        const data = await getStudyChapters();
        setChapters(data || []);
        const nextChapters = sortStudyChapters(data);

        const accessibleLessons = nextChapters.flatMap((chapter) =>
          isLockedChapter(chapter) ? [] : (chapter?.lessons || [])
        );
        const firstLesson = accessibleLessons[0];
        if (firstLesson) {
          setActiveLessonId(firstLesson.id);
        } else {
          setActiveLessonId(null);
          setLessonDetail(null);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load study chapters.');
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

  const handleSelectLesson = (lessonId) => {
    const ownerChapter = chapters.find((chapter) =>
      (chapter.lessons || []).some((lesson) => String(lesson.id) === String(lessonId))
    );
    if (isLockedChapter(ownerChapter)) {
      setActiveLessonId(null);
      setLessonDetail(null);
      return;
    }

    setActiveLessonId(lessonId);

    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Thu gọn danh sách chương"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-950/25"
        />
      )}

      <ChapterSidebar
        chapters={sortedChapters}
        activeLessonId={activeLessonId}
        onSelectLesson={handleSelectLesson}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen((current) => !current)}
      />

      <div className="relative flex min-h-[calc(100vh-9rem)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:mr-16 md:w-[calc(100%-4rem)] lg:mr-20 lg:w-[calc(100%-5rem)]">
        {error && (
          <div className="mx-6 mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {loadingLesson && (
          <div className="p-8 text-slate-500 font-semibold flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin" /> Đang tải bài học...
          </div>
        )}

        {!loadingLesson && lockedChapter && (
          <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Lock className="h-8 w-8" />
              </div>
              <div className="mt-5 inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-700">
                Package purchase needed
              </div>
              <h3 className="mt-4 text-2xl font-black text-slate-900">
                {lockedChapter.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Chương học này cần gói {lockedChapter.requiredPackageCode || `GRADE_${lockedChapter.gradeLevel}`} để mở khóa Study Zone lớp {lockedChapter.gradeLevel}.
              </p>
              <button
                type="button"
                onClick={() => navigate('/student/subscriptions')}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <ShoppingBag className="h-4 w-4" />
                Xem gói học
              </button>
            </div>
          </div>
        )}

        {!loadingLesson && lessonDetail && (
          <LessonContent
            lessonDetail={lessonDetail}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            onNavigateLesson={handleSelectLesson}
          />
        )}

        {!loadingLesson && !lessonDetail && !lockedChapter && (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {hasLessons ? 'Choose a lesson to start reading' : 'No study lessons available yet'}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {hasLessons
                  ? 'Pick a lesson from the chapter list on the left. The lesson detail panel will load here.'
                  : 'This class does not have any published lessons yet. Check back later or ask your teacher to publish content.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudyZone;
