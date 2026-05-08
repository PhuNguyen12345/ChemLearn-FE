import React from 'react';

const AdminChapterList = ({ chapters = [], onSelect }) => {
  return (
    <div className="space-y-3">
      {chapters.map((c) => (
        <div key={c.id} className="rounded-lg border p-3 bg-white cursor-pointer" onClick={() => onSelect?.(c)}>
          <div className="font-black">{c.title}</div>
          <div className="text-xs text-slate-500 mt-1">{c.description}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminChapterList;
