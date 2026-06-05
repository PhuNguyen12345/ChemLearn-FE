import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { formatChemicalText } from '../utils/textFormatting';
import DynamicIcon from './DynamicIcon';

export default function DraggableItem({ item, viewMode, onClick, compact = false, disableDrag = false }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ 
    id: `sidebar-${item.id}`,
    data: { source: 'sidebar', templateId: item.id, itemData: item },
    disabled: disableDrag,
  });
  
  const sharedStyle = {
    opacity: isDragging ? 0.4 : 1,
    touchAction: disableDrag || compact ? 'pan-y' : 'none',
    userSelect: 'none',
  }; 
  const rootDragProps = compact || disableDrag ? {} : { ...listeners, ...attributes };
  const dragHandle = compact && !disableDrag ? (
    <div
      ref={setActivatorNodeRef}
      {...listeners}
      {...attributes}
      className="absolute right-1.5 top-1.5 flex h-7 w-7 touch-none items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 active:cursor-grabbing"
      title="Kéo để đặt vào bàn"
      aria-label="Kéo để đặt vào bàn"
    >
      <GripVertical className="h-4 w-4" />
    </div>
  ) : null;

  const renderIcon = () => {
    if (item.icon) return item.icon; // Fallback for hardcoded constants if any left
    return <DynamicIcon iconName={item.iconName} iconColor={item.iconColor} iconFill={item.iconFill} className="w-8 h-8" />;
  };

  if (viewMode === 'grid') {
    return (
      <div 
        ref={setNodeRef} 
        style={sharedStyle}
        className={`relative flex flex-col items-center justify-center bg-white border-2 border-slate-100 hover:border-blue-200 transition-all ${
          compact ? 'min-w-0 p-2 rounded-xl' : 'cursor-grab p-4 rounded-2xl active:cursor-grabbing'
        }`}
        {...rootDragProps} onClick={onClick}
      >
        {dragHandle}
        <div className={`text-slate-700 pointer-events-none ${compact && !disableDrag ? 'mb-1 scale-90 pr-5' : compact ? 'mb-1 scale-90' : 'mb-2'}`}>{renderIcon()}</div>
        <span className={`${compact ? 'text-[11px] leading-tight' : 'text-sm'} text-center font-bold text-slate-600 pointer-events-none`}>{formatChemicalText(item.name)}</span>
      </div>
    );
  }
  
  return (
    <div 
      ref={setNodeRef} 
      style={sharedStyle}
      className={`relative flex items-center bg-white border border-slate-200 rounded-xl transition-all ${
        compact ? `${disableDrag ? 'min-w-0 p-2' : 'min-w-0 p-2 pr-10'}` : 'cursor-grab p-3 mb-2 active:cursor-grabbing'
      }`}
      {...rootDragProps} onClick={onClick}
    >
      {dragHandle}
      <div className={`${compact ? 'mr-2 p-1.5' : 'mr-4 p-2'} text-slate-700 pointer-events-none bg-slate-50 rounded-lg`}>{renderIcon()}</div>
      <div className="pointer-events-none">
        <div className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-slate-800`}>{formatChemicalText(item.name)}</div>
        <div className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500 line-clamp-1`}>{formatChemicalText(item.description || item.desc || '')}</div>
      </div>
    </div>
  );
}
