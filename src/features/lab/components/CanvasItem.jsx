import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';
import { CONTAINER_UI_MAP } from '../data/ContainerRendererMap';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { formatChemicalText } from '../utils/textFormatting';
import { useLabStore } from '../stores/useLabStore';

export default function CanvasItem({ item, isSelected, onSelect, onDelete }) {
  const updateWorkspaceItem = useLabStore(state => state.updateWorkspaceItem);
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
    touchAction: 'none',
    userSelect: 'none',
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
      color: item.precipitateColor || LIQUID_COLORS[legacySolidContent] || 'rgba(255, 255, 255, 0.95)',
      thickness: item.solidThickness || (content.liquid ? 33.3 : 100)
    };
  }
  if (legacyGasContent || item.reactionState === 'violent' || item.reactionState === 'bubbling') {
    content.gas = {
      label: legacyGasContent,
      type: item.reactionState === 'violent' ? 'violent' : 'normal'
    };
  }

  // --- GAS RENDERER COMPONENT BỊ LOẠI BỎ Ở PHASE 4 ---
  // Phaser WebGL sẽ đảm nhiệm việc vẽ bọt khí và khói lửa.
  // Ta chỉ còn giữ lại phần render text label (nếu cần).
  const GasLabelRenderer = ({ gas, template }) => {
    if (!gas || !gas.label) return null;
    return (
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] z-20 pointer-events-none flex flex-col items-center w-full`}>
         <div className={`absolute bottom-6 w-[80%] h-10 z-10 block`}>
            <div
              className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-white bg-black/50 rounded px-1 py-0.5 select-none pointer-events-none whitespace-nowrap"
              style={{ animation: 'smoke-rise-up 2.5s ease-in infinite 0.2s' }}
            >
              {gas.label}↑
            </div>
         </div>
      </div>
    );
  };

  const renderSVG = () => {
    const layout = CONTAINER_UI_MAP[item.templateId];

    if (layout) {
       const isSolidOnly = !content.liquid && content.solid;
       
       const CHUNK_METALS = ['Zn (Rắn)', 'Na (Rắn)', 'Fe (Rắn)', 'K (Rắn)', 'Ag (Rắn)', 'Ba (Rắn)', 'Ca (Rắn)'];
       const isChunk = content.solid ? CHUNK_METALS.includes(content.solid.label) : false;

       // Toán học bảo vệ Overflow (95%)
       const liquidHeight = content.liquid?.volumeRatio || 0;
       
       // Wrapper lấy tỷ lệ lỏng (55%) hoặc rẽ nhánh nhỏ bé (18%) nếu chỉ chứa rắn
       const wrapperHeight = Math.min(isSolidOnly ? 18 : liquidHeight, 95); 
       const wrapperBgColor = (isSolidOnly && isChunk) ? 'transparent' : (isSolidOnly ? getLiquidBg(content.solid.label) : content.liquid?.color);

       return (
         <div className={`relative group ${item.reactionState === 'violent' ? 'shake-animation' : ''}`}>
           {/* LỚP CHẤT LỎNG & RẮN */}
           {(content.liquid || content.solid) && (
             <div
               className={`absolute transition-all ease-in-out overflow-hidden ${item.reactionState === 'exothermic' ? 'exothermic-glow' : ''} ${item.reactionState === 'endothermic' ? 'endothermic-glow' : ''}`}
               style={{
                 ...layout.liquidStyle,
                 height: `${wrapperHeight}%`,
                 backgroundColor: wrapperBgColor,
                 transitionDuration: item.indicator === 'PHENOLPHTHALEIN' ? '2s' : '1s',
                 zIndex: 0
               }}
             >
               {/* LỚP KẾT TỦA HOẶC BỘT RẮN (Precipitate/Powder) */}
               {content.solid && !isChunk && (
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

               {/* BUBBLES ĐÃ CHUYỂN SANG PHASER */}
             </div>
           )}

           {/* DROPPING SOLIDS & LITMUS PAPER (Outside overflow-hidden) */}
           {(content.liquid || content.solid || item.fallingSolid || item.indicatorPaperColor) && (
             <div
               className="absolute pointer-events-none"
               style={{
                 ...layout.liquidStyle,
                 height: `${wrapperHeight}%`,
                 zIndex: 10
               }}
             >
               {/* HIỆU ỨNG LỬA ĐÃ ĐƯỢC CHUYỂN SANG PHASER WEBGL */}

               {/* LITMUS PAPER (Với Wrapper để fix vị trí) */}
               {(item.indicatorPaperColor || item.fallingSolid?.isLitmus) && (
                 <div className="litmus-wrapper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12">
                   <div className="litmus-paper" style={{ '--target-color': item.indicatorPaperColor || 'transparent' }}></div>
                 </div>
               )}
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
           {(content.gas) && (
             <div className="absolute w-full z-20 pointer-events-none" style={{ bottom: layout.gasOrigin }}>
               <GasLabelRenderer gas={content.gas} template={item.templateId} />
             </div>
           )}
         </div>
       );
    } 

    // FALLBACKS CHO CÁC VẬT PHẨM CHƯA CÓ SVG
    if (item.type === 'CHEMICAL') {
       const isLiquid = item.state === 'LIQUID';
       const bgHex = item.iconFill || '#cccccc';

       // Local state variables for Slider/Input
       const amount = item.amount || (isLiquid ? 100 : 10);
       const molarity = item.molarity || 1.0;

       // Updater helpers
       const setAmount = (val) => updateWorkspaceItem(item.instanceId, { amount: val });
       const setMolarity = (val) => updateWorkspaceItem(item.instanceId, { molarity: val });

       const chemicalShape = isLiquid ? (
           <div className="w-10 h-10 rounded-full border border-black/10 shadow-sm drop-shadow-md hover:scale-105 transition-transform relative" style={{ backgroundColor: bgHex }}>
              <div className="w-3 h-3 bg-white rounded-full absolute top-1.5 right-2 opacity-60"></div>
           </div>
       ) : (
           <div className="w-10 h-10 rounded-xl border border-black/20 shadow-sm drop-shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: bgHex }} />
       );

       return (
          <Popover open={isSelected}>
            <PopoverTrigger asChild>
               <div className="cursor-pointer relative">
                 {chemicalShape}
                 {/* Thêm một icon bánh răng nhỏ khi được chọn để nhắc nhở UX */}
                 {isSelected && (
                   <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full shadow pointer-events-none z-10">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                   </div>
                 )}
               </div>
            </PopoverTrigger>
            <PopoverContent 
               className="w-72 p-5 z-50 pointer-events-auto shadow-2xl border-slate-200 rounded-xl" 
               // Prevent drag/drop interactions from firing when interacting with inputs
               onPointerDown={(e) => e.stopPropagation()} 
               onKeyDown={(e) => e.stopPropagation()}
            >
               <div className="space-y-5">
                  <h4 className="font-bold text-base text-slate-800 border-b pb-2">Thiết lập thông số</h4>
                  
                  {/* SLIDER MASS/VOLUME */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700">
                          {isLiquid ? 'Thể tích (mL)' : 'Khối lượng (Gam)'}
                        </label>
                        <Input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-20 h-8 text-sm font-medium px-2 py-1 text-center border-slate-300 focus-visible:ring-blue-500"
                        />
                     </div>
                     <Slider 
                        value={[amount]} 
                        max={isLiquid ? 500 : 50} 
                        step={isLiquid ? 5 : 0.1}
                        onValueChange={(vals) => setAmount(vals[0])}
                        className="cursor-grab active:cursor-grabbing py-2"
                     />
                  </div>

                  {/* SLIDER MOLARITY (Chỉ hiện nếu là chất lỏng) */}
                  {isLiquid && (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-sm font-semibold text-slate-700">Nồng độ (Mol)</label>
                           <Input 
                             type="number" 
                             value={molarity} 
                             onChange={(e) => setMolarity(Number(e.target.value))}
                             className="w-20 h-8 text-sm font-medium px-2 py-1 text-center border-slate-300 focus-visible:ring-blue-500"
                             step="0.1"
                           />
                        </div>
                        <Slider 
                           value={[molarity]} 
                           max={5} 
                           step={0.1}
                           onValueChange={(vals) => setMolarity(vals[0])}
                           className="cursor-grab active:cursor-grabbing py-2"
                        />
                     </div>
                  )}
               </div>
            </PopoverContent>
          </Popover>
       );
    }

    if (item.templateId === 'bunsen_burner') {
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
    }

    return <div className="p-2 bg-white rounded shadow text-xs font-bold border">{item.templateId}</div>;
  };

  return (
    <div ref={setNodeRef} style={style} data-canvas-item="true" {...listeners} {...attributes}>
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
          {(content.liquid?.label || content.solid?.label || content.gas?.label || item.type === 'CHEMICAL') && (
             <TooltipContent className="bg-slate-800 text-white font-medium p-3 text-base shadow-xl border-slate-700 pointer-events-none rounded-lg max-w-[200px] z-[9999]">
               {item.type === 'CHEMICAL' ? (
                 <div className="text-slate-100 font-bold text-center">
                    {item.name}
                 </div>
               ) : (
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
                       <span className="text-slate-300">{!content.liquid && content.solid ? 'Chất rắn:' : 'Kết tủa:'}</span> 
                       <span className="font-bold text-amber-100">{formatChemicalText(content.solid.label)}</span>
                     </div>
                   )}
                   {content.gas?.label && (
                     <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-slate-400 opacity-70"></span>
                       <span className="text-slate-300">Khí:</span> 
                       <span className="font-bold text-slate-100">{formatChemicalText(content.gas.label)}</span>
                     </div>
                   )}
                 </div>
               )}
             </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
