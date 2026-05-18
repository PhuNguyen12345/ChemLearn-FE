import React from 'react';
import RichTextEditor from './RichTextEditor';
import { CheckCircle2, Clock3, FileText, Hash, Radio, RadioTower } from 'lucide-react';

const LessonWritingBlock = ({
  title,
  content,
  durationMinutes,
  orderIndex,
  published,
  onTitleChange,
  onContentChange,
  onDurationChange,
  onOrderChange,
  onPublishedChange,
  titlePlaceholder = 'Lesson title',
  durationLabel = 'Duration (minutes)',
  orderLabel = 'Order index',
  publishedLabel = 'Published',
  contentPlaceholder = 'Write lesson content...'
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Lesson draft</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">Write the lesson details and body content.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
      <div>
        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Title</label>
        <input
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder={titlePlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
            <Clock3 className="h-4 w-4" />
            {durationLabel}
          </label>
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => onDurationChange?.(Number(e.target.value) || 1)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
            <Hash className="h-4 w-4" />
            {orderLabel}
          </label>
          <input
            type="number"
            min={0}
            value={orderIndex}
            onChange={(e) => onOrderChange?.(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm font-black transition ${
          published ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span className="flex items-center gap-2">
            {published ? <CheckCircle2 className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
            {publishedLabel}
          </span>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => onPublishedChange?.(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
          <RadioTower className="h-4 w-4" />
          Content
        </div>
        <RichTextEditor value={content} onChange={onContentChange} placeholder={contentPlaceholder} />
      </div>
      </div>
    </div>
  );
};

export default LessonWritingBlock;
