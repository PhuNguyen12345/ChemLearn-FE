import React from 'react';
import MiniQuizSection from './MiniQuizSection';

const LessonContent = ({ lessonDetail }) => {
  if (!lessonDetail) return null;

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-white relative flex flex-col">
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
        <div className="tiptap-content prose max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: lessonDetail.content }} />

        <MiniQuizSection lessonId={lessonDetail.id} questions={lessonDetail.miniQuizQuestions || []} />
      </div>
    </div>
  );
};

export default LessonContent;
