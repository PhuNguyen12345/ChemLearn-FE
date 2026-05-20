import React from 'react';

/**
 * LabAnalysisPanel – Left sidebar
 * Displays task checklist and reaction analysis info.
 * Props:
 *   tasks        – array of task objects { id, desc, isCompleted }
 *   reactionInfo – { equation, condition, description }
 *   isOpen       – whether the panel is expanded
 *   onToggle     – callback to toggle open/closed
 */
const LabAnalysisPanel = ({ tasks = [], reactionInfo = {}, isOpen, onToggle, labType = 'PREMADE' }) => {
  return (
    <div style={{ width: isOpen ? '320px' : '0', transition: 'width 0.3s ease', backgroundColor: '#fff', borderRight: '2px solid #e2e8f0', position: 'relative', flexShrink: 0, zIndex: 50 }}>
      <div style={{ display: isOpen ? 'block' : 'none', width: '320px', height: '100%', padding: '24px', boxSizing: 'border-box', overflowY: 'auto' }}>
        <h3 className="text-xl font-bold text-slate-800 border-b-2 border-blue-400 pb-3">📊 Phân tích Lab</h3>

        <div className="mt-6 space-y-4">
          {/* Nhiệm vụ / Tasks */}
          {labType !== 'SANDBOX' && tasks && tasks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nhiệm vụ cần làm:</h4>
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li key={task.id} className="flex items-start gap-2 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                    {labType === 'PREMADE' ? (
                      <>
                        <span className="shrink-0 mt-0.5 text-base">
                          {task.isCompleted ? (
                            <span className="text-emerald-500 font-bold">☑</span>
                          ) : (
                            <span className="text-slate-300 font-bold">☐</span>
                          )}
                        </span>
                        <span className={`text-slate-700 leading-snug ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
                          {task.desc}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-700 leading-snug font-medium">
                        • {task.desc}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trạng thái/Phản ứng:</h4>
            <div className="p-4 bg-slate-50 border border-slate-100 font-mono text-sm text-red-500 rounded-xl shadow-inner">{reactionInfo.equation}</div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Điều kiện môi trường:</h4>
            <div className="p-3 bg-slate-50 border border-slate-100 text-sm text-slate-700 rounded-xl">{reactionInfo.condition}</div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mô tả chi tiết:</h4>
            <div className="p-4 bg-blue-50/50 border border-blue-100 text-sm leading-relaxed text-slate-700 rounded-xl">{reactionInfo.description}</div>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-8 top-6 w-8 h-12 bg-white border border-slate-200 border-l-0 rounded-r-lg flex items-center justify-center cursor-pointer shadow-sm text-slate-500 hover:text-blue-500 z-50"
      >
        {isOpen ? '◀' : '▶'}
      </button>
    </div>
  );
};

export default LabAnalysisPanel;
