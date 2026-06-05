import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, ChevronLeft } from 'lucide-react';

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
    <aside
      className={`fixed right-0 top-16 bottom-0 z-50 flex max-w-[calc(100vw-0.75rem)] flex-col bg-slate-50 transition-all duration-300 ${
        isOpen
          ? 'w-[min(22rem,calc(100vw-0.75rem))] border-l border-slate-200 shadow-2xl shadow-slate-900/10'
          : 'w-0 border-l-0 shadow-none md:w-20 md:border-l md:border-slate-200 md:shadow-2xl md:shadow-slate-900/10'
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        className={`z-30 flex items-center justify-center border transition-all duration-200 ${
          isOpen
            ? 'absolute -left-3 top-5 h-8 w-8 rounded-lg border-slate-200 bg-slate-50 text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-800'
            : 'fixed right-4 top-20 h-12 w-12 rounded-full border-sky-400 bg-sky-500 text-white shadow-lg shadow-sky-900/20 hover:bg-sky-600 md:absolute md:-left-3 md:top-[5.75rem] md:h-8 md:w-8 md:rounded-lg md:border-slate-200 md:bg-slate-50 md:text-slate-500 md:shadow-sm md:hover:bg-slate-100 md:hover:text-slate-800'
        }`}
        title={isOpen ? 'Ẩn danh sách chương' : 'Hiển thị danh sách chương'}
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5 rotate-180 transition-transform" />
        ) : (
          <>
            <BookOpen className="h-5 w-5 md:hidden" />
            <ChevronLeft className="hidden h-5 w-5 transition-transform md:block" />
          </>
        )}
      </button>

      <div className={`${isOpen ? 'flex' : 'hidden md:flex'} h-16 items-center gap-2.5 border-b border-slate-200/70 px-4`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-md shadow-sky-300/50">
          <BookOpen className="h-5 w-5" />
        </div>

        {isOpen && (
          <h2 className="min-w-0 truncate text-lg font-black tracking-tight text-slate-800">
            Chương học
          </h2>
        )}
      </div>

      {!isOpen ? (
        <button
          type="button"
          onClick={onClose}
          className="hidden flex-1 flex-col items-center justify-start gap-3 px-2 py-5 text-slate-500 transition hover:bg-white hover:text-sky-600 md:flex"
          title="Hiển thị danh sách chương"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="[writing-mode:vertical-rl] text-xs font-black uppercase tracking-widest">
            Chương học
          </span>
        </button>
      ) : (
        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-[11px] font-black uppercase tracking-widest text-sky-500 transition hover:bg-white hover:text-sky-700 hover:shadow-sm"
              >
                <span className="min-w-0 flex-1 truncate">{chapter.title}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expandedChapters[chapter.id] ? 'rotate-180' : ''}`} />
              </button>

              {expandedChapters[chapter.id] && (
                <ul className="space-y-1">
                  {(chapter.lessons || []).map((lesson) => {
                    const isActive = activeLessonId === lesson.id;
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => onSelectLesson(lesson.id)}
                          className={`group flex w-full items-center gap-2.5 rounded-xl border-b-[3px] px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                            isActive
                              ? 'border-b-sky-700 bg-sky-500 font-black text-white shadow-md shadow-sky-300/40'
                              : 'border-transparent font-semibold text-slate-600 hover:-translate-y-0.5 hover:bg-white hover:text-sky-700 hover:shadow-sm'
                          }`}
                        >
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                            {isActive ? '▶' : '•'}
                          </span>

                          <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}

          {!chapters.length && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500">
              Chưa có chương học.
            </div>
          )}
        </nav>
      )}
    </aside>
  );
};

export default ChapterSidebar;
