import React from 'react';

export default function DragPreview({ item }) {
  if (!item) return null;
  return (
    <div className="p-4 bg-white/90 backdrop-blur-sm border-2 border-blue-400 rounded-2xl flex flex-col items-center shadow-2xl opacity-90 scale-105 rotate-2 pointer-events-none">
      <div className="text-slate-700">{item.icon}</div>
      <span className="font-bold mt-2 text-sm max-w-[100px] text-center text-slate-800">{item.name}</span>
    </div>
  );
}
