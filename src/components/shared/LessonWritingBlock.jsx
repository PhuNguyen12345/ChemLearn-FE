import React from 'react';
import RichTextEditor from './RichTextEditor';

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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <input
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder={titlePlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{durationLabel}</label>
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => onDurationChange?.(Number(e.target.value) || 1)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{orderLabel}</label>
          <input
            type="number"
            min={0}
            value={orderIndex}
            onChange={(e) => onOrderChange?.(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => onPublishedChange?.(e.target.checked)}
          />
          {publishedLabel}
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <RichTextEditor value={content} onChange={onContentChange} placeholder={contentPlaceholder} />
      </div>
    </div>
  );
};

export default LessonWritingBlock;
