import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { formatChemicalText } from '../utils/textFormatting';

export default function DraggableItem({ item, viewMode, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: `sidebar-${item.id}`,
    data: { source: 'sidebar', templateId: item.id, itemData: item }
  });
  
  const opacity = isDragging ? 0.4 : 1; 

  if (viewMode === 'grid') {
    return (
      <div 
        ref={setNodeRef} 
        style={{ opacity }}
        className="flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-2xl cursor-grab hover:border-blue-200 hover:shadow-md transition-all active:cursor-grabbing"
        {...listeners} {...attributes} onClick={onClick}
      >
        <div className="text-slate-700 pointer-events-none mb-2">{item.icon}</div>
        <span className="text-sm text-center font-bold text-slate-600 pointer-events-none">{formatChemicalText(item.name)}</span>
      </div>
    );
  }
  
  return (
    <div 
      ref={setNodeRef} 
      style={{ opacity }}
      className="flex items-center p-3 bg-white border border-slate-200 rounded-xl cursor-grab hover:shadow-md transition-all mb-2 active:cursor-grabbing"
      {...listeners} {...attributes} onClick={onClick}
    >
      <div className="mr-4 text-slate-700 pointer-events-none p-2 bg-slate-50 rounded-lg">{item.icon}</div>
      <div className="pointer-events-none">
        <div className="font-bold text-sm text-slate-800">{formatChemicalText(item.name)}</div>
        <div className="text-sm text-slate-500 line-clamp-1">{formatChemicalText(item.desc)}</div>
      </div>
    </div>
  );
}
