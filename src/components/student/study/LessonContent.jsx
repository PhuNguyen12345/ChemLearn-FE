import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MiniQuizSection from './MiniQuizSection';
import { formatChemistryHtml } from '../../../utils/chemistryFormatting';

const LessonContent = ({ lessonDetail, previousLesson, nextLesson, onNavigateLesson }) => {
  const contentRef = useRef(null);
  const formattedContent = useMemo(
    () => formatChemistryHtml(lessonDetail?.content || ''),
    [lessonDetail?.content]
  );

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonDetail?.id]);

  if (!lessonDetail) return null;

  return (
    <div ref={contentRef} className="flex-1 min-w-0 overflow-y-auto bg-white relative flex flex-col">
      <div className="bg-white px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-5 sm:pb-6 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 mb-3">
          <span>{lessonDetail.chapterTitle}</span>
          <span className="text-indigo-500 font-black">/</span>
          <span className="text-indigo-500 font-black">{lessonDetail.title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">{lessonDetail.title}</h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-bold text-slate-400">~{lessonDetail.estimatedMinutes || 8} min read</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-8 flex-1">
        <div className="tiptap-content prose max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: formattedContent }} />

        <MiniQuizSection lessonId={lessonDetail.id} questions={lessonDetail.miniQuizQuestions || []} />

        <div className="grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => previousLesson && onNavigateLesson?.(previousLesson.id)}
            disabled={!previousLesson}
            className={`flex min-h-20 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
              previousLesson
                ? 'border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 hover:shadow-sm'
                : 'cursor-not-allowed border-slate-100 bg-slate-50/70 text-slate-300'
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-black uppercase tracking-widest">Bài trước</span>
              <span className="mt-1 block truncate text-sm font-black">
                {previousLesson?.title || 'Không còn bài trước'}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => nextLesson && onNavigateLesson?.(nextLesson.id)}
            disabled={!nextLesson}
            className={`flex min-h-20 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all sm:text-right ${
              nextLesson
                ? 'border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 hover:shadow-sm'
                : 'cursor-not-allowed border-slate-100 bg-slate-50/70 text-slate-300'
            }`}
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-black uppercase tracking-widest">Bài tiếp theo</span>
              <span className="mt-1 block truncate text-sm font-black">
                {nextLesson?.title || 'Không còn bài tiếp theo'}
              </span>
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <ArrowRight className="h-5 w-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonContent;
