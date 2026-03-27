import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';

export default function CanvasItem({ item, isSelected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.instanceId,
    data: { source: 'canvas', instanceId: item.instanceId, templateId: item.templateId }
  });

  const style = {
    position: 'absolute',
    left: `${item.x}px`,
    top: `${item.y}px`,
    opacity: isDragging ? 0.2 : 1,
    zIndex: isDragging ? 50 : 10,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  // ── Multi-layer helpers ─────────────────────────────────────────────────────
  // Support both old schema (content) and new schema (liquidContent/solidContent/gasContent)
  const liquidContent   = item.liquidContent ?? (item.solidContent ? null : item.content) ?? null;
  const solidContent    = item.solidContent  ?? null;
  const gasContent      = item.gasContent    ?? null;
  // A container is "active" if either layer has data
  const hasAnyContent   = !!(liquidContent || solidContent);
  // Solid-only: no liquid layer, just the bottom solid layer
  const isSolidOnly     = !liquidContent && !!solidContent;

  // Determine the liquid layer background color
  const getLiquidBg = (fallbackContent) => {
    if (item.liquidColor) return isSolidOnly ? 'transparent' : item.liquidColor;
    if (fallbackContent === 'H2O')          return 'rgba(96, 165, 250, 0.6)';
    if (fallbackContent === 'KMnO4')        return 'rgba(147, 51, 234, 0.8)';
    if (fallbackContent === 'NaOH')         return 'rgba(200, 230, 255, 0.6)';
    if (fallbackContent === 'KMnO4 (Rắn)') return 'rgba(88, 28, 135, 0.9)';
    if (fallbackContent === 'Na (Rắn)')     return 'rgba(148, 163, 184, 0.9)';
    // Bổ sung màu cho TẤT CẢ chất rắn ở đây:
    if (fallbackContent === 'KMnO4 (Rắn)') return 'rgba(88, 28, 135, 0.9)'; // Tím đậm
    if (fallbackContent === 'Na (Rắn)')     return 'rgba(148, 163, 184, 0.9)'; // Xám nhạt
    if (fallbackContent === 'Zn (Rắn)')     return 'rgba(156, 163, 175, 0.9)'; // Xám kẽm
    if (fallbackContent === 'Fe (Rắn)')     return 'rgba(71, 85, 105, 0.9)';   // Xám đen sắt
    if (fallbackContent === 'CaO (Rắn)')    return 'rgba(241, 245, 249, 0.9)'; // Trắng đục vôi
    return 'transparent';
  };

  // Determine whether text inside the liquid layer should be white
  const isDarkLiquid = (lc) =>
    (lc || '').includes('KMnO4') || (lc || '').includes('Na (Rắn)');

  const renderSVG = () => {
    switch (item.templateId) {
      case 'beaker':
        return (
          <div className={`relative group ${item.reactionState === 'violent' ? 'animate-pulse' : ''}`}>

            {/* ── LIQUID LAYER ─────────────────────────────────────────────── */}
            {hasAnyContent && (
              <div
                className={`absolute bottom-[6px] left-[15px] right-[15px] rounded-br-[5px] rounded-bl-[5px] transition-all duration-1000 ease-in-out ${item.reactionState === 'exothermic' ? 'exothermic-glow' : ''} ${item.reactionState === 'endothermic' ? 'endothermic-glow' : ''}`}
                style={{
                  height: isSolidOnly ? '18%' : '55%',
                  backgroundColor: getLiquidBg(liquidContent ?? solidContent),
                  zIndex: 0,
                }}
              >
                {/* Liquid label — hidden when solid-only */}
                {liquidContent && (
                  <div
                    className="flex items-center justify-center w-full h-full text-[11px] font-extrabold select-none pointer-events-none uppercase px-2 text-center drop-shadow-sm transition-opacity duration-300"
                    style={{
                      opacity: 0.9,
                      color: isDarkLiquid(liquidContent) ? '#ffffff' : '#1e293b',
                    }}
                  >
                    {liquidContent}
                  </div>
                )}

                {/* ── SOLID / PRECIPITATE LAYER ──────────────────────────── */}
                {(solidContent || item.precipitateColor || item.reactionState === 'precipitation') && (
                  // <div
                  //   className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-[4px] border-t border-white/20 shadow-inner flex items-center justify-center"
                  //   style={{ backgroundColor: item.precipitateColor || 'rgba(255, 255, 255, 0.95)', zIndex: 1 }}
                  // >
                  //   {solidContent && (
                  //     <span className="text-[9px] font-bold select-none pointer-events-none uppercase text-center leading-tight px-1"
                  //       style={{ color: item.precipitateColor === 'rgba(180, 83, 9, 0.8)' ? '#fff7ed' : '#1e293b' }}>
                  //       {solidContent}
                  //     </span>
                  //   )}
                  // </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 ${isSolidOnly ? 'h-full rounded-b-[5px]' : 'h-1/3 rounded-b-[4px] border-t border-white/20'} shadow-inner flex items-center justify-center`}
                    style={{ 
                      // Bỏ màu trắng mặc định nếu chỉ là chất rắn đứng 1 mình
                      backgroundColor: isSolidOnly ? 'transparent' : (item.precipitateColor || 'rgba(255, 255, 255, 0.95)'), 
                      zIndex: 1 
                    }}
                  >
                    {solidContent && (
                      <span className={`${isSolidOnly ? 'text-[11px]' : 'text-[9px]'} font-bold select-none pointer-events-none uppercase text-center leading-tight px-1`}
                        style={{ color: item.precipitateColor === 'rgba(180, 83, 9, 0.8)' ? '#fff7ed' : (isSolidOnly && isDarkLiquid(solidContent) ? '#ffffff' : '#1e293b') }}>
                        {solidContent}
                      </span>
                    )}
                  </div>
                )}

                {/* Bubbles if heated or violent */}
                {(item.isHeated || item.reactionState === 'violent') && (
                  <>
                    <div className="bubble-animation w-1.5 h-1.5 bottom-1 left-2"   style={{ animationDelay: '0ms' }}></div>
                    <div className="bubble-animation w-2 h-2 bottom-2 left-6"        style={{ animationDelay: '300ms' }}></div>
                    <div className="bubble-animation w-1.5 h-1.5 bottom-0 right-3"  style={{ animationDelay: '600ms' }}></div>
                    <div className="bubble-animation w-2.5 h-2.5 bottom-2 right-6"  style={{ animationDelay: '100ms' }}></div>
                  </>
                )}
              </div>
            )}

            <svg width="100" height="125" viewBox="0 0 100 125" className="drop-shadow-md relative z-10 w-full h-full">
              <g transform="scale(1.25)">
                <path d="M 10 10 L 10 90 Q 10 95 15 95 L 65 95 Q 70 95 70 90 L 70 10 M 5 10 L 15 10 M 65 10 L 75 10" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="4" />
                <path d="M 10 10 L 10 90 Q 10 95 15 95 L 65 95 Q 70 95 70 90 L 70 10 M 5 10 L 15 10 M 65 10 L 75 10" fill="none" stroke="#94a3b8" strokeWidth="2" />
              </g>
            </svg>

            {/* ── GAS LAYER (violent reactions) ────────────────────────────── */}
            {item.reactionState === 'violent' && (
              <div className="absolute bottom-[55%] left-1/2 -translate-x-1/2 translate-y-[30%] z-20 pointer-events-none flex flex-col items-center w-full">
                <div className="absolute bottom-6 w-[80%] h-10 z-10">
                  <div className="smoke-particle text-3xl absolute bottom-0 left-0"            style={{ animation: 'smoke-float-left 2s ease-in infinite', opacity: 0 }}>💨</div>
                  <div className="smoke-particle text-xl absolute bottom-0 left-[20%]"         style={{ animation: 'smoke-rise-up 2.5s ease-in infinite 0.4s', opacity: 0 }}>💨</div>
                  <div className="smoke-particle text-4xl absolute bottom-0 left-1/2 -translate-x-1/2" style={{ animation: 'smoke-spiral 3s ease-in infinite 0.2s', opacity: 0 }}>💨</div>
                  <div className="smoke-particle text-2xl absolute bottom-0 right-[20%]"       style={{ animation: 'smoke-rise-up 2.2s ease-in infinite 0.7s', opacity: 0 }}>💨</div>
                  <div className="smoke-particle text-3xl absolute bottom-0 right-0"           style={{ animation: 'smoke-float-right 2.8s ease-in infinite 1.1s', opacity: 0 }}>💨</div>
                  {/* Gas formula tag — floats above centre smoke */}
                  {gasContent && (
                    <div
                      className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-white bg-black/50 rounded px-1 py-0.5 select-none pointer-events-none whitespace-nowrap"
                      style={{ animation: 'smoke-rise-up 2.5s ease-in infinite 0.2s' }}
                    >
                      {gasContent}↑
                    </div>
                  )}
                </div>
                <div className="violent-fire text-3xl relative z-20 mt-2">🔥</div>
              </div>
            )}
          </div>
        );
      case 'test_tube':
        return (
          <div className="relative group">

            {/* ── LIQUID LAYER ─────────────────────────────────────────────── */}
            {hasAnyContent && (
              <div
                className={`absolute bottom-[12px] left-[14px] right-[14px] rounded-b-full transition-all duration-1000 ease-in-out ${item.reactionState === 'exothermic' ? 'exothermic-glow' : ''} ${item.reactionState === 'endothermic' ? 'endothermic-glow' : ''}`}
                style={{
                  height: isSolidOnly ? '18%' : '45%',
                  backgroundColor: getLiquidBg(liquidContent ?? solidContent),
                  zIndex: 0,
                }}
              >
                {/* Liquid label */}
                {liquidContent && (
                  <div
                    className="flex items-center justify-center w-full h-full text-[10px] font-extrabold select-none pointer-events-none uppercase px-1 text-center drop-shadow-sm"
                    style={{
                      opacity: 0.9,
                      color: isDarkLiquid(liquidContent) ? '#ffffff' : '#1e293b',
                    }}
                  >
                    {liquidContent}
                  </div>
                )}

                {/* ── SOLID / PRECIPITATE LAYER ──────────────────────────── */}
                {(solidContent || item.precipitateColor || item.reactionState === 'precipitation') && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-full px-1 border-t border-white/20 shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: item.precipitateColor || 'rgba(255, 255, 255, 0.95)', zIndex: 1 }}
                  >
                    {solidContent && (
                      <span className="text-[8px] font-bold select-none pointer-events-none uppercase text-center leading-tight"
                        style={{ color: item.precipitateColor === 'rgba(180, 83, 9, 0.8)' ? '#fff7ed' : '#1e293b' }}>
                        {solidContent}
                      </span>
                    )}
                  </div>
                )}

                {/* Bubbles if heated or violent */}
                {(item.isHeated || item.reactionState === 'violent') && (
                  <>
                    <div className="bubble-animation w-1 h-1 bottom-1 left-2.5"   style={{ animationDelay: '0ms' }}></div>
                    <div className="bubble-animation w-1.5 h-1.5 bottom-2 right-2.5" style={{ animationDelay: '400ms' }}></div>
                  </>
                )}
              </div>
            )}

            <svg width="50" height="150" viewBox="0 0 50 150" className="drop-shadow-md relative z-10 w-full h-full">
              <g transform="scale(1.25)">
                <path d="M 10 10 L 10 110 A 10 10 0 0 0 30 110 L 30 10 M 5 10 L 15 10 M 25 10 L 35 10" fill="none" stroke="#94a3b8" strokeWidth="2" />
              </g>
            </svg>

            {/* ── GAS LAYER (violent reactions) ────────────────────────────── */}
            {item.reactionState === 'violent' && (
              <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 translate-y-[20%] z-20 pointer-events-none flex flex-col items-center w-full">
                <div className="absolute bottom-4 w-[90%] h-10 z-10">
                  <div className="smoke-particle text-xl absolute bottom-0 left-0"            style={{ animation: 'smoke-float-left 2.2s ease-in infinite 0.2s', opacity: 0 }}>💨</div>
                  <div className="smoke-particle text-3xl absolute bottom-0 left-1/2 -translate-x-1/2" style={{ animation: 'smoke-rise-up 2.5s ease-in infinite', opacity: 0 }}>💨</div>
                  <div className="smoke-particle text-xl absolute bottom-0 right-0"           style={{ animation: 'smoke-float-right 2s ease-in infinite 0.5s', opacity: 0 }}>💨</div>
                  {/* Gas formula tag */}
                  {gasContent && (
                    <div
                      className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-white bg-black/50 rounded px-1 py-0.5 select-none pointer-events-none whitespace-nowrap"
                      style={{ animation: 'smoke-rise-up 2.5s ease-in infinite' }}
                    >
                      {gasContent}↑
                    </div>
                  )}
                </div>
                <div className="violent-fire text-2xl relative z-20 mt-1">🔥</div>
              </div>
            )}
          </div>
        );
      case 'bunsen_burner':
        return (
          <div className="relative">
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-12 origin-bottom animate-pulse pointer-events-none z-20">
                <svg viewBox="0 0 30 60" className="w-full h-full drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                  <path d="M 15 0 Q 5 20 5 40 A 10 10 0 0 0 25 40 Q 25 20 15 0 Z" fill="#ef4444" />
                  <path d="M 15 20 Q 10 35 10 45 A 5 5 0 0 0 20 45 Q 20 35 15 20 Z" fill="#facc15" />
                </svg>
             </div>
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
      <div 
        onPointerDown={() => onSelect()}
        className={`relative rounded-xl transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-50' : ''}`}
      >
        {isSelected && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute -top-4 -right-4 p-1.5 bg-red-100 text-red-600 rounded-full shadow-md hover:bg-red-200 z-50 pointer-events-auto cursor-pointer"
            title="Delete Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {renderSVG()}
      </div>
    </div>
  );
}
