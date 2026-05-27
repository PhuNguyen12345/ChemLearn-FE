import React, { useEffect, useState } from 'react';
import {
  LoaderCircle,
  BookOpen,
} from 'lucide-react';
import {
  getStudyChapters,
  getStudyLesson,
} from '../../lib/api';

import ChapterSidebar from '../../components/student/study/ChapterSidebar';
import LessonContent from '../../components/student/study/LessonContent';

const StudyZone = () => {
  const [chapters, setChapters] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState('');
  const hasLessons = chapters.some((chapter) => (chapter.lessons || []).length > 0);

  useEffect(() => {
    const loadChapters = async () => {
      try {
        setError('');
        const data = await getStudyChapters();
        setChapters(data || []);

        const firstLesson = data?.flatMap((chapter) => chapter?.lessons || [])?.[0];
        if (firstLesson) {
          setActiveLessonId(firstLesson.id);
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
            <LoaderCircle className="w-4 h-4 animate-spin" /> Đang tải bài học...
          </div>
        )}

        {!loadingLesson && lessonDetail && (
          <LessonContent lessonDetail={lessonDetail} />
        )}

        {!loadingLesson && !lessonDetail && (
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
    </div>
  );
};

export default StudyZone;
