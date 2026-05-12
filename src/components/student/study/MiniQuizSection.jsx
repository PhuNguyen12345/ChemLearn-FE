import React from 'react';

const MiniQuizSection = ({ lessonId, questions = [], isStub = true }) => {
  if (!questions.length) return null;

  return (
    <div className="mt-4 rounded-3xl overflow-hidden border-2 border-slate-800 border-b-[6px] shadow-xl shadow-slate-900/10">
      <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-indigo-500 rounded-xl shadow-md">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5z"></path></svg>
        </div>
        <div>
          <h3 className="font-black text-white text-base leading-none">Knowledge Check</h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">Mini-quiz (preview) — feature coming soon</p>
        </div>
      </div>

      <div className="bg-white p-6 space-y-6">
        <p className="text-sm text-slate-600 italic">Mini-quiz is currently disabled in this preview. It will be enabled in a future release.</p>
      </div>
    </div>
  );
};

export default MiniQuizSection;
