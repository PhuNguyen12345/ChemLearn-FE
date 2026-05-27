
import React, { useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import CanvasItem from './CanvasItem';

export default function CentralWorkspace({ placedItems, scale, setScale, selectedItemId, setSelectedItemId, onDeleteItem  }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas' });
  const containerRef = useRef(null);
  
  // MỚI: Tọa độ dịch chuyển (Pan) của Canvas và trạng thái Panning
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef(pan);
  const panStartRef = useRef({ x: 0, y: 0 });

  const updatePan = (nextPan) => {
    panRef.current = nextPan;
    setPan(nextPan);
  };

  const setRefs = (element) => {
    containerRef.current = element;
    setNodeRef(element);
  };

  // THUẬT TOÁN MIRO/FIGMA CAMERA - ZOOM
  const handleWheel = (e) => {
    e.preventDefault(); // Chặn cuộn trang web
    if (!containerRef.current) return;

    // 1. Tính toán Scale mượt mà
    const zoomSensitivity = 0.05;
    const delta = e.deltaY < 0 ? (1 + zoomSensitivity) : (1 - zoomSensitivity);
    let newScale = scale * delta;

    // 2. Chặn kịch kim (Tránh zoom quá to/nhỏ gây lỗi)
    newScale = Math.min(Math.max(0.5, newScale), 3.0);
    if (newScale === scale) return;

    // 3. Lấy tọa độ chuột DỰA TRÊN KHUNG CỐ ĐỊNH BÊN NGOÀI
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 4. Công thức toán học: Tính toán độ dịch chuyển (Pan) để giữ cố định điểm dưới chuột
    const newPanX = mouseX - ((mouseX - panRef.current.x) * (newScale / scale));
    const newPanY = mouseY - ((mouseY - panRef.current.y) * (newScale / scale));

    setScale(newScale);
    updatePan({ x: newPanX, y: newPanY });
  };

  // Nút bấm thủ công cũng phải dùng toán học tương tự (zoom vào giữa màn hình)
  const handleManualZoom = (type) => {
    if (type === 'reset') {
      setScale(1);
      updatePan({ x: 0, y: 0 });
      return;
    }

    const rect = containerRef.current.parentElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newScale = type === 'in' ? Math.min(scale * 1.2, 3.0) : Math.max(scale * 0.8, 0.5);
    const newPanX = centerX - ((centerX - panRef.current.x) * (newScale / scale));
    const newPanY = centerY - ((centerY - panRef.current.y) * (newScale / scale));

    setScale(newScale);
    updatePan({ x: newPanX, y: newPanY });
  };

  // ---------------- PANNING LOGIC ----------------
  const handlePointerDown = (e) => {
    const clickedItem = e.target.closest('[data-canvas-item="true"]');
    const clickedControl = e.target.closest('button, input, textarea, select, [data-canvas-control="true"]');
    if (clickedControl) return;

    // Check if clicked on canvas background (empty space)
    if (!clickedItem) {
      setSelectedItemId(null);
    }

    // Only pan if Middle Click OR Left Click on the exact canvas background 
    // (ignores clicks on draggable items so @dnd-kit still works)
    if (e.button === 1 || (e.button === 0 && !clickedItem)) {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setIsPanning(true);
      const nextPanStart = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y
      };
      panStartRef.current = nextPanStart;
    }
  };

  const handlePointerMove = (e) => {
    if (!isPanning) return;
    e.preventDefault(); // Prevent text selection while dragging
    updatePan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    });
  };

  const handlePointerUp = (e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsPanning(false);
  };
  // -----------------------------------------------

  return (
    // {/* KHUNG OUTER: Nằm im cố định, dùng để hứng sự kiện lăn chuột và di chuột */}
    <div 
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={() => setIsPanning(false)}
      onPointerLeave={handlePointerUp}
      id="experiment-canvas"
      ref={setRefs}
      data-pan-x={pan.x}
      data-pan-y={pan.y}
      className={`relative w-full flex-1 touch-none select-none border-4 rounded-[2rem] overflow-hidden shadow-inner border-slate-200 bg-slate-50 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      
      {/* Nút bấm điều khiển (Zoom Controls) */}
      <div data-canvas-control="true" className="absolute top-6 right-6 flex flex-col gap-2 z-50">
        <button onClick={() => handleManualZoom('in')} className="p-2 bg-white rounded-full shadow-md text-slate-600 hover:text-blue-600 hover:bg-slate-50">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={() => handleManualZoom('reset')} className="p-2 bg-white rounded-full shadow-md text-slate-600 hover:text-blue-600 hover:bg-slate-50">
          <Maximize className="w-5 h-5" />
        </button>
        <button onClick={() => handleManualZoom('out')} className="p-2 bg-white rounded-full shadow-md text-slate-600 hover:text-blue-600 hover:bg-slate-50">
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-6 left-6 font-bold text-slate-300/80 pointer-events-none text-2xl uppercase tracking-widest select-none z-10">
         Không gian thực hành
      </div>

      {/* KHUNG INNER: Cái này sẽ bay lượn và phóng to thu nhỏ */}
      <div 
        className={`absolute inset-0 h-full w-full ${isOver ? 'bg-blue-50/40' : ''} ${!isPanning && 'cursor-grab'}`}
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)',
          backgroundSize: '30px 30px',
          // ĐÂY LÀ CHÌA KHÓA: Dịch chuyển (Translate) + Tỷ lệ (Scale), Cố định tâm 0 0
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {placedItems.map(item => (
          <CanvasItem 
            key={item.instanceId} 
            item={item} 
            isSelected={selectedItemId === item.instanceId}
            onSelect={() => setSelectedItemId(item.instanceId)}
            onDelete={() => onDeleteItem(item.instanceId)}
          />
        ))}
      </div>
    </div>
  );
}
