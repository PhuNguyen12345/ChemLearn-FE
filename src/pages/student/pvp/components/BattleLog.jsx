import React, { useEffect, useRef } from 'react';

/**
 * BattleLog — Scrollable event log showing recent battle actions.
 * Auto-scrolls to bottom when new entries arrive.
 *
 * Props:
 *  - logs: string[]  — ordered list of log messages (newest last)
 */

const LOG_ICONS = {
  CORRECT: '✅',
  WRONG: '❌',
  TIMEOUT: '⏰',
  BATTLE_START: '⚔️',
  NEW_TURN: '🎯',
  DISCONNECT: '🔌',
  HP_ZERO: '💀',
};

export default function BattleLog({ logs = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full min-h-[120px] max-h-48">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2 shrink-0">
        <span className="text-xs font-black text-white/60 uppercase tracking-widest">📜 Nhật ký trận đấu</span>
      </div>

      {/* Scrollable log entries */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {logs.length === 0 ? (
          <p className="text-white/30 text-xs italic">Đang chờ trận đấu bắt đầu...</p>
        ) : (
          logs.map((log, i) => {
            const icon = Object.entries(LOG_ICONS).find(([key]) => log.includes(key))?.[1] ?? '▸';
            return (
              <div
                key={i}
                className={`
                  text-xs text-white/80 font-semibold py-0.5
                  ${i === logs.length - 1 ? 'text-white animate-in fade-in duration-300' : 'text-white/60'}
                `}
              >
                <span className="mr-1">{icon}</span>
                {log}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
