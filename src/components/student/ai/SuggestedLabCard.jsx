import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Play, Tag } from 'lucide-react';

const SuggestedLabCard = ({ lab }) => {
  const navigate = useNavigate();
  const canOpen = Boolean(lab?.id);

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-white">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">{lab?.title || 'Lab gợi ý'}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
              {lab?.category && (
                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-1 text-cyan-700">
                  <Tag className="h-3 w-3" />
                  {lab.category}
                </span>
              )}
              {lab?.difficulty && (
                <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">
                  {lab.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-sm font-semibold leading-6 text-slate-600">
        {lab?.description || 'Mở lab để quan sát hiện tượng và luyện giải thích bằng ngôn ngữ khoa học.'}
      </p>

      <button
        type="button"
        disabled={!canOpen}
        onClick={() => navigate(`/lab-workspace/${lab.id}`)}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Play className="h-4 w-4" />
        Vào lab
      </button>
    </article>
  );
};

export default SuggestedLabCard;
