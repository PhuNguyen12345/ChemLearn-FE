import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronLeft, ListTree } from 'lucide-react';

const ChapterSidebar = ({ chapters = [], activeLessonId, onSelectLesson, isOpen = true, onClose }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const activeLessonRef = useRef(null);
  const activeChapterId = useMemo(() => {
    const activeChapter = chapters.find((chapter) =>
      (chapter.lessons || []).some((lesson) => String(lesson.id) === String(activeLessonId))
    );

    return activeChapter?.id;
  }, [activeLessonId, chapters]);

  const lessonCount = useMemo(
    () => chapters.reduce((total, chapter) => total + (chapter.lessons || []).length, 0),
    [chapters]
  );

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

  useEffect(() => {
    if (!isOpen || !activeChapterId) return undefined;

    setExpandedChapters((current) => ({
      ...current,
      [activeChapterId]: true,
    }));

    const scrollTimer = window.setTimeout(() => {
      activeLessonRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }, 180);

    return () => window.clearTimeout(scrollTimer);
  }, [activeChapterId, isOpen]);

  return (
    <>
      {!isOpen && (
        <>
          <button
            type="button"
            onClick={onClose}
            className="fixed right-4 top-20 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-sky-400 bg-sky-500 text-white shadow-lg shadow-sky-900/20 transition-colors hover:bg-sky-600 md:hidden"
            title="Hiển thị danh sách chương"
          >
            <BookOpen className="h-5 w-5" />
          </button>

          <aside className="fixed bottom-0 right-0 top-16 z-50 hidden w-20 flex-col border-l border-slate-200 bg-slate-50 shadow-lg shadow-slate-900/5 md:flex">
            <button
              type="button"
              onClick={onClose}
              className="absolute -left-3 top-[5.75rem] z-30 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-800"
              title="Hiển thị danh sách chương"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 flex-col items-center justify-start gap-3 px-2 py-5 text-slate-500 transition-colors hover:bg-white hover:text-sky-600"
              title="Hiển thị danh sách chương"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="[writing-mode:vertical-rl] text-xs font-black uppercase tracking-widest">
                Chương học
              </span>
            </button>
          </aside>
        </>
      )}

      <aside
        className={`fixed bottom-0 right-0 top-16 z-50 flex w-[min(22rem,calc(100vw-0.75rem))] max-w-[calc(100vw-0.75rem)] transform-gpu flex-col border-l border-slate-200 bg-white shadow-xl shadow-slate-900/10 transition-transform duration-200 ease-out will-change-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -left-3 top-5 z-30 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-800"
          title="Ẩn danh sách chương"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </button>

        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black tracking-tight text-slate-800">
              Chương học
            </h2>
            <p className="mt-0.5 text-xs font-bold text-slate-400">
              {chapters.length} chương · {lessonCount} bài
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {chapters.map((chapter) => (
            <section key={chapter.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
                  activeChapterId === chapter.id
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ListTree className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-xs font-black uppercase tracking-wide">{chapter.title}</span>
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
                          ref={isActive ? activeLessonRef : null}
                          onClick={() => onSelectLesson(lesson.id)}
                          className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                            isActive
                              ? 'bg-sky-500 font-black text-white shadow-sm'
                              : 'font-semibold text-slate-600 hover:bg-slate-50 hover:text-sky-700'
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
            </section>
          ))}

          {!chapters.length && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500">
              Chưa có chương học.
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default ChapterSidebar;
