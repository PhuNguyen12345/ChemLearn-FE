import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function CanvasItem({ item, simulationActive }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.instanceId,
    data: { source: 'canvas', instanceId: item.instanceId, templateId: item.templateId }
  });

  const style = {
    position: 'absolute',
    left: `${item.x}px`,
    top: `${item.y}px`,
    // transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.2 : 1, 
    zIndex: isDragging ? 50 : 10,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const renderSVG = () => {
    switch (item.templateId) {
      case 'beaker':
        return (
          <div className="relative group">
            <svg width="80" height="100" viewBox="0 0 80 100" className="drop-shadow-md">
              {item.content && (
                <path 
                  d="M 15 90 L 65 90 L 70 40 L 10 40 Z" 
                  fill={item.content === 'H2O' ? '#3b82f6' : (item.content === 'KMnO4' ? '#9333ea' : '#10b981')} 
                  opacity="0.8" 
                />
              )}
               <path d="M 10 10 L 10 90 Q 10 95 15 95 L 65 95 Q 70 95 70 90 L 70 10 M 5 10 L 15 10 M 65 10 L 75 10" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="4" />
               <path d="M 10 10 L 10 90 Q 10 95 15 95 L 65 95 Q 70 95 70 90 L 70 10 M 5 10 L 15 10 M 65 10 L 75 10" fill="none" stroke="#94a3b8" strokeWidth="2" />
            </svg>
            {item.isHeated && item.content && simulationActive && (
              <div className="absolute inset-0 top-1/2 flex justify-center opacity-70">
                <div className="w-2 h-2 bg-white rounded-full animate-ping delay-75"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-ping ml-2"></div>
              </div>
            )}
          </div>
        );
      case 'test_tube':
        return (
          <div className="relative group">
            <svg width="40" height="120" viewBox="0 0 40 120" className="drop-shadow-md">
               {item.content && (
                <path 
                  d="M 10 110 A 10 10 0 0 0 30 110 L 30 50 L 10 50 Z" 
                  fill={item.content === 'H2O' ? '#3b82f6' : (item.content === 'KMnO4' ? '#9333ea' : '#10b981')} 
                  opacity="0.8" 
                />
              )}
              <path d="M 10 10 L 10 110 A 10 10 0 0 0 30 110 L 30 10 M 5 10 L 15 10 M 25 10 L 35 10" fill="none" stroke="#94a3b8" strokeWidth="2" />
            </svg>
            {item.isHeated && item.content && simulationActive && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-70">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
              </div>
            )}
          </div>
        )
      case 'bunsen_burner':
        return (
          <div className="relative">
            {item.isHeated && simulationActive && (
               <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-8 h-16 origin-bottom animate-pulse pointer-events-none">
                  <svg viewBox="0 0 30 60" className="w-full h-full drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                    <path d="M 15 0 Q 5 20 5 40 A 10 10 0 0 0 25 40 Q 25 20 15 0 Z" fill="#ef4444" />
                    <path d="M 15 20 Q 10 35 10 45 A 5 5 0 0 0 20 45 Q 20 35 15 20 Z" fill="#facc15" />
                  </svg>
               </div>
            )}
            <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-lg relative z-10">
               <rect x="22" y="30" width="16" height="40" fill="#94a3b8" />
               <rect x="10" y="70" width="40" height="10" fill="#334155" rx="2" />
               <rect x="18" y="65" width="24" height="5" fill="#64748b" />
            </svg>
          </div>
        )
      case 'sodium':
        return <div className="w-10 h-10 bg-slate-200 rounded-md border-2 border-slate-300 shadow-sm flex items-center justify-center font-bold text-xs text-slate-500 hover:scale-105 transition-transform">Na</div>;
      case 'copper':
        return <div className="w-10 h-10 bg-amber-700 rounded-md border-2 border-amber-800 shadow-sm flex items-center justify-center font-bold text-xs text-amber-100 hover:scale-105 transition-transform">Cu</div>;
      case 'kmno4':
        return <div className="w-10 h-10 bg-purple-600 rounded-full border-2 border-purple-800 shadow-sm flex items-center justify-center font-bold text-xs text-white hover:scale-105 transition-transform">K+</div>;
      case 'water':
        return <div className="w-10 h-10 rounded-full bg-blue-400 opacity-90 border-2 border-blue-500 shadow-sm drop-shadow-md flex items-center justify-center hover:scale-105 transition-transform"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-2 opacity-60"></div></div>;
      default:
        return <div className="p-2 bg-white rounded shadow text-xs font-bold border">{item.templateId}</div>;
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {renderSVG()}
    </div>
  );
}
