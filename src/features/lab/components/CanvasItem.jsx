import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';
import { CONTAINER_UI_MAP } from '../data/ContainerRendererMap';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatChemicalText } from '../utils/textFormatting';

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

  // ── Multi-layer helpers (Adapter for Legacy Data structure) ──
  const legacyLiquidContent = item.liquidContent ?? (item.solidContent ? null : item.content) ?? null;
  const legacySolidContent  = item.solidContent  ?? null;
  const legacyGasContent    = item.gasContent    ?? null;

  const isSolidOnly = !legacyLiquidContent && !!legacySolidContent;

  const LIQUID_COLORS = {
    'H2O': 'rgba(96, 165, 250, 0.6)',
    'KMnO4': 'rgba(147, 51, 234, 0.8)',
    'NaOH': 'rgba(200, 230, 255, 0.6)',
    'KMnO4 (Rắn)': 'rgba(88, 28, 135, 0.9)',
    'Na (Rắn)': 'rgba(148, 163, 184, 0.9)',
    'Zn (Rắn)': 'rgba(156, 163, 175, 0.9)',
    'Fe (Rắn)': 'rgba(71, 85, 105, 0.9)',
    'CaO (Rắn)': 'rgba(241, 245, 249, 0.9)',
    'NaCl': 'rgba(255, 255, 255, 0.95)',
    'Na2CO3': 'rgba(241, 245, 249, 0.95)'
  };

  const getLiquidBg = (fallbackContent) => {
    if (item.liquidColor) return isSolidOnly ? 'transparent' : item.liquidColor;
    
    // Chỉ 1 dòng duy nhất thay cho sớ "if"
    const matchedColor = LIQUID_COLORS[fallbackContent];
    if (matchedColor) return matchedColor;
    
    // Fallback mặc định
    return isSolidOnly ? 'rgba(255, 255, 255, 0.9)' : 'transparent';
  };

  const isDarkLiquid = (lc) => (lc || '').includes('KMnO4') || (lc || '').includes('Na (Rắn)');

  // 1. Phân tách JSON state payload từ Data cũ
  const content = {};
  if (legacyLiquidContent) {
    content.liquid = {
      label: legacyLiquidContent,
      color: getLiquidBg(legacyLiquidContent),
      volumeRatio: item.liquidVolume || (item.templateId === 'test_tube' ? 45 : 55)
    };
  }
  if (legacySolidContent || item.precipitateColor || item.reactionState === 'precipitation') {
    content.solid = {
      label: legacySolidContent,
      color: item.precipitateColor || 'rgba(255, 255, 255, 0.95)',
      thickness: item.solidThickness || (content.liquid ? 33.3 : 100)
    };
  }
  if (legacyGasContent || item.reactionState === 'violent') {
    content.gas = {
      label: legacyGasContent,
      type: item.reactionState === 'violent' ? 'violent' : 'normal'
    };
  }

  // --- GAS RENDERER COMPONENT ---
  const GasRenderer = ({ gas, template }) => {
    if (!gas) return null;
    const isTestTube = template === 'test_tube';
    return (
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] z-20 pointer-events-none flex flex-col items-center w-full`}>
         <div className={`absolute bottom-6 w-[80%] h-10 z-10 block`}>
            {/* Simple static generic smoke particles */}
            <div className={`smoke-particle ${isTestTube ? 'text-xl' : 'text-3xl'} absolute bottom-0 left-0`} style={{ animation: 'smoke-float-left 2s ease-in infinite', opacity: 0 }}>💨</div>
            <div className={`smoke-particle ${isTestTube ? 'text-3xl' : 'text-4xl'} absolute bottom-0 left-1/2 -translate-x-1/2`} style={{ animation: 'smoke-rise-up 2.5s ease-in infinite 0.2s', opacity: 0 }}>💨</div>
            <div className={`smoke-particle ${isTestTube ? 'text-xl' : 'text-3xl'} absolute bottom-0 right-0`} style={{ animation: 'smoke-float-right 2.8s ease-in infinite 1.1s', opacity: 0 }}>💨</div>
            
            {gas.label && (
              <div
                className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-white bg-black/50 rounded px-1 py-0.5 select-none pointer-events-none whitespace-nowrap"
                style={{ animation: 'smoke-rise-up 2.5s ease-in infinite 0.2s' }}
              >
                {gas.label}↑
              </div>
            )}
         </div>
         {gas.type === 'violent' && <div className="violent-fire text-3xl relative z-20 mt-2">🔥</div>}
      </div>
    );
  };

  const renderSVG = () => {
    const layout = CONTAINER_UI_MAP[item.templateId];

    if (layout) {
       const isSolidOnly = !content.liquid && content.solid;
       
       // Toán học bảo vệ Overflow (95%)
       const liquidHeight = content.liquid?.volumeRatio || 0;
       
       // Wrapper lấy tỷ lệ lỏng (55%) hoặc rẽ nhánh nhỏ bé (18%) nếu chỉ chứa rắn
       const wrapperHeight = Math.min(isSolidOnly ? 18 : liquidHeight, 95); 
       const wrapperBgColor = isSolidOnly ? getLiquidBg(content.solid.label) : content.liquid?.color;

       return (
         <div className={`relative group ${item.reactionState === 'violent' ? 'animate-pulse' : ''}`}>
           {/* LỚP CHẤT LỎNG & RẮN */}
           {(content.liquid || content.solid) && (
             <div
               className={`absolute transition-all duration-1000 ease-in-out overflow-hidden ${item.reactionState === 'exothermic' ? 'exothermic-glow' : ''} ${item.reactionState === 'endothermic' ? 'endothermic-glow' : ''}`}
               style={{
                 ...layout.liquidStyle,
                 height: `${wrapperHeight}%`,
                 backgroundColor: wrapperBgColor,
                 zIndex: 0
               }}
             >
               {content.solid && (
                 <div
                   className={`absolute bottom-0 left-0 right-0 flex items-center justify-center shadow-inner ${isSolidOnly ? 'rounded-b-[5px]' : 'border-t border-white/20'}`}
                   style={{
                     height: isSolidOnly ? '100%' : `${content.solid.thickness || 33.33}%`,
                     backgroundColor: isSolidOnly ? 'transparent' : content.solid.color,
                     ...layout.liquidStyle, bottom: 0, left: 0, right: 0
                   }}
                 >
                 </div>
               )}

               {/* BUBBLES */}
               {(item.isHeated || item.reactionState === 'violent') && layout.bubbles?.map((b, idx) => (
                  <div key={idx} className={`bubble-animation absolute ${b.className}`} style={{ animationDelay: b.animationDelay }}></div>
               ))}
             </div>
           )}

           {/* VỎ HÌNH SVG */}
           <svg viewBox={layout.svgViewBox} className="drop-shadow-md relative z-10 w-full h-full" width={layout.svgViewBox.split(' ')[2]} height={layout.svgViewBox.split(' ')[3]}>
             <g transform="scale(1.25)">
               {layout.svgPaths.map((p, idx) => (
                 <path key={idx} d={p.d} fill="none" stroke={p.stroke} strokeWidth={p.strokeWidth} />
               ))}
             </g>
           </svg>

           {/* LỚP KHÍ Z-20 */}
           {content.gas && (
             <div className="absolute w-full z-20 pointer-events-none" style={{ bottom: layout.gasOrigin }}>
               <GasRenderer gas={content.gas} template={item.templateId} />
             </div>
           )}
         </div>
       );
    } 

    // FALLBACKS KIỂU CŨ
    switch (item.templateId) {
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
        );
      case 'sodium': return <div className="w-10 h-10 bg-slate-200 rounded-md border-2 border-slate-300 shadow-sm flex items-center justify-center font-bold text-xs text-slate-500 hover:scale-105 transition-transform">Na</div>;
      case 'copper': return <div className="w-10 h-10 bg-amber-700 rounded-md border-2 border-amber-800 shadow-sm flex items-center justify-center font-bold text-xs text-amber-100 hover:scale-105 transition-transform">Cu</div>;
      case 'kmno4':  return <div className="w-10 h-10 bg-purple-600 rounded-full border-2 border-purple-800 shadow-sm flex items-center justify-center font-bold text-xs text-white hover:scale-105 transition-transform">K+</div>;
      case 'water':  return <div className="w-10 h-10 rounded-full bg-blue-400 opacity-90 border-2 border-blue-500 shadow-sm drop-shadow-md flex items-center justify-center hover:scale-105 transition-transform"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-2 opacity-60"></div></div>;
      default:       return <div className="p-2 bg-white rounded shadow text-xs font-bold border">{item.templateId}</div>;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild onClick={(e) => e.preventDefault()}>
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
          </TooltipTrigger>
          {(content.liquid?.label || content.solid?.label || content.gas?.label) && (
             <TooltipContent className="bg-slate-800 text-white font-medium p-3 text-base shadow-xl border-slate-700 pointer-events-none rounded-lg max-w-[200px]">
               <div className="flex flex-col gap-1.5">
                 {content.liquid?.label && (
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                     <span className="text-slate-300">Dung dịch:</span> 
                     <span className="font-bold text-blue-100">{formatChemicalText(content.liquid.label)}</span>
                   </div>
                 )}
                 {content.solid?.label && (
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-[2px] bg-amber-500"></span>
                     <span className="text-slate-300">{isSolidOnly ? 'Chất rắn:' : 'Kết tủa:'}</span> 
                     <span className="font-bold text-amber-100">{formatChemicalText(content.solid.label)}</span>
                   </div>
                 )}
                 {content.gas?.label && (
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full border border-slate-300 border-dashed"></span>
                     <span className="text-slate-300">Khí:</span> 
                     <span className="font-bold text-slate-100">{formatChemicalText(content.gas.label)}</span>
                   </div>
                 )}
               </div>
             </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

