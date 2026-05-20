import React from 'react';
import { Target, MessageSquare } from 'lucide-react';

export const Timeline = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400">
        Chưa có hoạt động nào gần đây.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 md:ml-4 space-y-8">
      {items.map((item, index) => (
        <div key={index} className="relative pl-8 md:pl-10">
          {/* Icon marker */}
          <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${
            item.type === 'quest' ? 'bg-purple-500' : 'bg-blue-500'
          }`}>
            {item.type === 'quest' ? (
              <Target className="w-3.5 h-3.5 text-white" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            )}
          </div>

          {/* Content */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                {item.title}
              </h4>
              <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 self-start">
                {item.date}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {item.description}
            </p>

            {/* Gamification progress bar */}
            {item.type === 'quest' && item.progress !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                  <span>Tiến độ</span>
                  <span>{item.progress.current} / {item.progress.total}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (item.progress.current / item.progress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
