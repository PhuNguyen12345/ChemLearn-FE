import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import '/Lab.css'; // BẮT BUỘC IMPORT FILE CSS ANIMATION

// ==========================================
// 1. SIDEBAR ITEM (Có hiệu ứng nhún lún cho kim loại)
// ==========================================
function SidebarItem({ id, name, type, color, metalType }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  // Xác định class nếu là kim loại mềm (Na) hay cứng (Cu)
  const metalClass = metalType === 'soft' ? 'soft-metal' : (metalType === 'hard' ? 'hard-metal' : '');

  return (
    <div
      ref={setNodeRef}
      className={metalClass}
      style={{
        ...style,
        padding: '10px 15px',
        margin: '10px 0',
        backgroundColor: color || '#34495e',
        color: metalType === 'soft' ? '#333' : 'white', // Chữ đen cho Na, trắng cho đồ khác
        borderRadius: type === 'apparatus' ? '4px' : (metalType === 'soft' ? '10px' : '50px'),
        cursor: 'grab',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        userSelect: 'none'
      }}
      {...listeners}
      {...attributes}
    >
      {name}
    </div>
  );
}

// ==========================================
// 2. BỤC THÍ NGHIỆM TRUNG TÂM (Chứa Animation Phản Ứng)
// ==========================================
function CentralSlot({ deskItem, beakerContent, isReacting }) {
  const dropZoneId = deskItem === null ? 'empty-desk' : 'active-beaker';
  const { isOver, setNodeRef } = useDroppable({ id: dropZoneId });

  if (deskItem === null) {
    return (
      <div 
        ref={setNodeRef} 
        style={{
          width: '300px', height: '150px',
          border: isOver ? '3px dashed #3498db' : '3px dashed #bdc3c7',
          backgroundColor: isOver ? '#ebf5fb' : 'transparent',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#7f8c8d', fontWeight: 'bold', fontSize: '18px',
          transition: 'all 0.2s ease'
        }}
      >
        {isOver ? 'Thả Cốc Vào Đây!' : 'Kéo Cốc Thủy Tinh ra bục này'}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
          width: '180px', height: '220px',
          border: isOver ? '4px dashed #2ecc71' : '4px solid rgba(255,255,255,0.8)',
          backgroundColor: 'rgba(236, 240, 241, 0.4)',
          borderRadius: '5px 5px 30px 30px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          position: 'relative', overflow: 'visible' // visible để khói bay lên không bị cắt
      }}>
        
        {/* LỚP NƯỚC BÊN TRONG (Kích hoạt class .water-reacting khi sủi bọt) */}
        {beakerContent && (
          <div 
            className={isReacting ? 'water-reacting' : ''}
            style={{
              height: '100px',
              backgroundColor: beakerContent === 'H2O' ? 'rgba(52, 152, 219, 0.8)' : 'rgba(155, 89, 182, 0.8)', // Đổi sang tím khi thành NaOH
              borderRadius: '0 0 25px 25px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', transition: 'all 0.5s ease',
              position: 'relative'
          }}>
            {beakerContent}

            {/* HIỆU ỨNG CHÁY NỔ (Chỉ hiện khi isReacting = true) */}
            {isReacting && (
              <>
                <div className="fire-animation">🔥</div> 
                <div className="smoke-animation">💨</div>
                <div className="smoke-animation" style={{ animationDelay: '0.5s', left: '10%' }}>💨</div>
                <div style={{
                  position: 'absolute', top: '-15px', backgroundColor: '#fff',
                  width: '20px', height: '20px', borderRadius: '50%',
                  animation: 'fireFlicker 0.1s infinite alternate'
                }}></div>
              </>
            )}
          </div>
        )}
      </div>
      <div style={{ marginTop: '15px', padding: '10px 40px', backgroundColor: '#7f8c8d', borderRadius: '5px', color: 'white', fontWeight: 'bold' }}>
        Bục Thí Nghiệm
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN APP
// ==========================================
export default function ChemLearnLab() {
  const [deskItem, setDeskItem] = useState(null); 
  const [beakerContent, setBeakerContent] = useState(null); 
  const [isReacting, setIsReacting] = useState(false); // Quản lý thời gian chạy Animation
  const [message, setMessage] = useState('Bước 1: Kéo Cốc Thủy Tinh ra bục trung tâm.');

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return; 

    const droppedItemId = active.id;
    const targetZoneId = over.id;

    if (targetZoneId === 'empty-desk' && droppedItemId === 'beaker') {
      setDeskItem('beaker');
      setMessage('Bước 2: Kéo Nước (H2O) rót vào cốc.');
    }
    else if (targetZoneId === 'active-beaker' && droppedItemId === 'water') {
      if (beakerContent !== null) return;
      setBeakerContent('H2O');
      setMessage('Bước 3: Kéo Natri (Na) thả vào nước.');
    }
    else if (targetZoneId === 'active-beaker' && droppedItemId === 'sodium') {
      if (beakerContent === 'H2O') {
        // BẬT ANIMATION
        setIsReacting(true);
        setMessage('⚠️ CẢNH BÁO: Phản ứng tỏa nhiệt mạnh! Đang sinh ra khí Hydro...');
        
        // TẮT ANIMATION VÀ CẬP NHẬT KẾT QUẢ SAU 3 GIÂY
        setTimeout(() => {
          setIsReacting(false);
          setBeakerContent('NaOH');
          setMessage('✅ Hoàn tất! Dung dịch thu được là Natri Hydroxit (NaOH).');
        }, 3000);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#2c3e50' }}>
      
      <DndContext onDragEnd={handleDragEnd}>
        {/* WORKSPACE */}
        <div style={{ flex: 3, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#ecf0f1' }}>🧪 ChemLearn Virtual Lab (Snap-to-Slot)</h2>
          <div style={{ backgroundColor: '#34495e', padding: '15px 30px', borderRadius: '8px', color: '#f1c40f', fontWeight: 'bold', marginBottom: '50px', minWidth: '500px', textAlign: 'center' }}>
            {message}
          </div>

          <CentralSlot deskItem={deskItem} beakerContent={beakerContent} isReacting={isReacting} />

          <button onClick={() => { setDeskItem(null); setBeakerContent(null); setIsReacting(false); setMessage('Đã dọn dẹp. Hãy bắt đầu lại!'); }} style={{ marginTop: '50px', padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔄 Dọn Bàn Lại Từ Đầu
          </button>
        </div>

        {/* SIDEBAR */}
        <div style={{ flex: 1, backgroundColor: '#ecf0f1', padding: '20px', borderLeft: '4px solid #bdc3c7' }}>
          <h3 style={{ borderBottom: '2px solid #bdc3c7', paddingBottom: '10px' }}>Kho Vật Phẩm</h3>
          
          <h4 style={{ color: '#7f8c8d' }}>Dụng Cụ</h4>
          <SidebarItem id="beaker" name="🥛 Cốc Thủy Tinh" type="apparatus" color="#95a5a6" />
          
          <h4 style={{ color: '#7f8c8d', marginTop: '30px' }}>Dung Môi</h4>
          <SidebarItem id="water" name="💧 Nước Cất (H2O)" type="chemical" color="#3498db" />
          
          <h4 style={{ color: '#7f8c8d', marginTop: '30px' }}>Hóa Chất</h4>
          <SidebarItem id="sodium" name="Na (Natri)" type="chemical" color="#bdc3c7" metalType="soft" />
          <SidebarItem id="copper" name="Cu (Đồng)" type="chemical" color="#d35400" metalType="hard" />
        </div>
      </DndContext>
    </div>
  );
}