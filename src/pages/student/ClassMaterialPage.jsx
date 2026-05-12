import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, LoaderCircle } from 'lucide-react';
import { getClassLessonDetail } from '../../lib/api';
import LessonContent from '../../components/student/study/LessonContent';

const ClassMaterialPage = () => {
  const navigate = useNavigate();
  const { classId, lessonId } = useParams();
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const detail = await getClassLessonDetail(classId, lessonId);
        setLessonDetail(detail || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load material.');
      } finally {
        setLoading(false);
      }
    };

    if (classId && lessonId) {
      load();
    }
  }, [classId, lessonId]);

  const mappedLesson = lessonDetail
    ? {
        id: lessonDetail.id,
        chapterTitle: lessonDetail.chapterTitle,
        title: lessonDetail.title,
        content: lessonDetail.content || lessonDetail.textContent || '',
        estimatedMinutes: lessonDetail.estimatedMinutes,
        miniQuizQuestions: lessonDetail.miniQuizQuestions || lessonDetail.miniQuestions || [],
      }
    : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(`/student/class/${classId}`)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to class
      </button>

      {/* Header strip (shown while loading or when lesson loaded) */}
      {!error && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-5 text-white shadow-md">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            {loading ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-100">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Loading material...
              </div>
            ) : mappedLesson ? (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-sky-200 mb-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {mappedLesson.chapterTitle || 'Class Document'}
                </div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">{mappedLesson.title}</h1>
                {mappedLesson.estimatedMinutes > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-bold border border-white/20">
                    <Clock className="h-3 w-3" />
                    ~{mappedLesson.estimatedMinutes} min read
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm font-semibold text-sky-100">Material not found.</p>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Lesson content */}
      {!loading && mappedLesson && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <LessonContent lessonDetail={mappedLesson} />
        </div>
      )}

      {!loading && !mappedLesson && !error && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-700">Material not found</h3>
          <p className="mt-2 text-sm text-slate-500">
            This lesson may have been removed or isn't available yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassMaterialPage;
