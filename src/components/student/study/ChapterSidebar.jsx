import React, { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const ChapterSidebar = ({ chapters = [], activeLessonId, onSelectLesson, isOpen = true, onClose }) => {
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    const nextExpandedChapters = {};

    chapters.forEach((chapter) => {
      nextExpandedChapters[chapter.id] = true;
    });

    setExpandedChapters(nextExpandedChapters);
  }, [chapters]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((current) => ({
      ...current,
      [chapterId]: !current[chapterId],
    }));
  };

  return (
    <aside className={`absolute inset-y-0 right-0 z-40 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-y-auto border-l border-slate-100 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10 flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-black">Khu vực học tập</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          title="Ẩn danh sách chương"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleChapter(chapter.id)}
              className="flex w-full items-center gap-2 rounded-2xl px-2 py-2 text-left text-[11px] font-black uppercase tracking-widest text-indigo-400 transition hover:bg-indigo-50/80 hover:text-indigo-600"
            >
              <span className="flex-1">{chapter.title}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expandedChapters[chapter.id] ? 'rotate-180' : ''}`} />
            </button>

            {expandedChapters[chapter.id] && (
              <ul className="space-y-1">
                {(chapter.lessons || []).map((lesson) => {
                  const isActive = activeLessonId === lesson.id;
                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 text-sm group
                          ${isActive
                            ? 'bg-indigo-500 text-white font-black shadow-md shadow-indigo-300/40 border-b-[3px] border-indigo-700'
                            : 'text-slate-600 font-semibold hover:bg-indigo-50 hover:text-indigo-700 hover:-translate-y-0.5 hover:shadow-sm border-b-[3px] border-transparent'
                          }
                        `}
                      >
                        <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                          {isActive ? '▶' : '•'}
                        </span>

                        <span className="truncate flex-1">{lesson.title}</span>

                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ChapterSidebar;
