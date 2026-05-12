import React from 'react';

const ChapterSidebar = ({ chapters = [], activeLessonId, onSelectLesson, expandedChapterId, onToggleChapter }) => {
  return (
    <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col h-full overflow-y-auto shrink-0">
      <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-black">Study Zone</h2>
      </div>

      <div className="p-4 space-y-5">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-1">
            <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest px-2 mb-2 flex items-center gap-1.5">
              <span className="flex-1">{chapter.title}</span>
            </h3>

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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterSidebar;
