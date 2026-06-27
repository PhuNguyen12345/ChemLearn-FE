import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronLeft, ListTree, Lock } from 'lucide-react';

const isLockedChapter = (chapter) => Boolean(chapter?.needPurchase && chapter?.hasAccess === false);

const getOrderValue = (item, fallbackIndex) => {
  const value = item?.orderIndex ?? item?.displayOrder ?? fallbackIndex;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallbackIndex;
};

const sortByAvailabilityAndOrder = (left, right) => {
  if (left.locked !== right.locked) return left.locked ? 1 : -1;
  if (left.order !== right.order) return left.order - right.order;
  return left.index - right.index;
};

const ChapterSidebar = ({ chapters = [], activeLessonId, onSelectLesson, isOpen = true, onClose }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const activeLessonRef = useRef(null);
  const sortedChapters = useMemo(
    () => chapters
      .map((chapter, chapterIndex) => {
        const locked = isLockedChapter(chapter);
        const lessons = (chapter.lessons || [])
          .map((lesson, lessonIndex) => ({
            lesson,
            locked,
            order: getOrderValue(lesson, lessonIndex),
            index: lessonIndex,
          }))
          .sort(sortByAvailabilityAndOrder)
          .map(({ lesson }) => lesson);

        return {
          chapter: {
            ...chapter,
            lessons,
          },
          locked,
          order: getOrderValue(chapter, chapterIndex),
          index: chapterIndex,
        };
      })
      .sort(sortByAvailabilityAndOrder)
      .map(({ chapter }) => chapter),
    [chapters]
  );

  const activeChapterId = useMemo(() => {
    const activeChapter = sortedChapters.find((chapter) =>
      (chapter.lessons || []).some((lesson) => String(lesson.id) === String(activeLessonId))
    );

    return activeChapter?.id;
  }, [activeLessonId, sortedChapters]);

  const lessonCount = useMemo(
    () => sortedChapters.reduce((total, chapter) => total + (chapter.lessons || []).length, 0),
    [sortedChapters]
  );

  useEffect(() => {
    const nextExpandedChapters = {};

    sortedChapters.forEach((chapter) => {
      nextExpandedChapters[chapter.id] = true;
    });

    setExpandedChapters(nextExpandedChapters);
  }, [sortedChapters]);

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
            className="fixed right-4 top-20 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95 md:hidden"
            title="Hiển thị danh sách chương"
          >
            <BookOpen className="h-5 w-5" />
          </button>

          <aside className="fixed bottom-0 right-0 top-16 z-50 hidden w-16 flex-col border-l border-indigo-500/20 bg-gradient-to-b from-sky-500 to-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.15)] md:flex">
            <button
              type="button"
              onClick={onClose}
              className="absolute -left-3.5 top-20 z-30 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-md ring-2 ring-white/50 transition-all hover:scale-110 hover:shadow-lg"
              title="Hiển thị danh sách chương"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="group flex flex-1 flex-col items-center justify-start gap-5 px-2 py-6 text-white transition-all hover:bg-white/10"
              title="Hiển thị danh sách chương"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="[writing-mode:vertical-rl] text-sm font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-sm transition-colors group-hover:text-white">
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
          className={`${
            isOpen ? 'absolute -left-3 top-5 z-30' : ''
          } flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-800`}
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
              {sortedChapters.length} chương · {lessonCount} bài
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {sortedChapters.map((chapter) => {
            const locked = isLockedChapter(chapter);

            return (
              <section key={chapter.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => !locked && toggleChapter(chapter.id)}
                  disabled={locked}
                  title={locked ? 'Cần mua gói học để mở khóa chương này' : undefined}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
                    locked
                      ? 'cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400 opacity-80'
                      : activeChapterId === chapter.id
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {locked ? <Lock className="h-4 w-4 shrink-0" /> : <ListTree className="h-4 w-4 shrink-0" />}
                  <span className="min-w-0 flex-1 truncate text-xs font-black uppercase tracking-wide">{chapter.title}</span>
                  {locked ? (
                    <span className="shrink-0 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
                      Khóa
                    </span>
                  ) : (
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expandedChapters[chapter.id] ? 'rotate-180' : ''}`} />
                  )}
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
                            onClick={() => !locked && onSelectLesson(lesson.id)}
                            disabled={locked}
                            title={locked ? 'Cần mua gói học để mở khóa bài học này' : undefined}
                            className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                              locked
                                ? 'cursor-not-allowed border border-slate-100 bg-slate-50/80 font-semibold text-slate-400 opacity-80'
                                : isActive
                                ? 'bg-sky-500 font-black text-white shadow-sm'
                                : 'font-semibold text-slate-600 hover:bg-slate-50 hover:text-sky-700'
                            }`}
                          >
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all ${
                              locked ? 'bg-slate-200 text-slate-500' : isActive ? 'bg-white/20' : 'bg-slate-100'
                            }`}>
                              {locked ? <Lock className="h-3.5 w-3.5" /> : isActive ? '▶' : '•'}
                            </span>

                            <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}

          {!sortedChapters.length && (
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
