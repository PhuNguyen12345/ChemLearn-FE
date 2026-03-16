import React, { useState, useMemo } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import '/Lab2.css'; // Bắt buộc phải có file Lab.css ở cùng thư mục

// ==========================================
// KHO ĐỒ BAN ĐẦU (Đã thêm metalType)
// ==========================================
const INITIAL_INVENTORY = [
  { id: 'beaker', name: 'Cốc Thủy Tinh', type: 'apparatus', icon: '🥛', desc: 'Dụng cụ thí nghiệm cơ bản dùng để chứa dung môi và thực hiện phản ứng hóa học.' },
  { id: 'water', name: 'Nước (H2O)', type: 'solvent', icon: '💧', desc: 'Dung môi phổ biến nhất, là một hợp chất vô cơ trong suốt, không vị, không mùi.' },
  { id: 'sodium', name: 'Natri (Na)', type: 'chemical', icon: '⬜', desc: 'Kim loại kiềm, rất mềm, dễ cắt bằng dao. Phản ứng cực kỳ mãnh liệt với nước lạnh.', metalType: 'soft' },
  { id: 'copper', name: 'Đồng (Cu)', type: 'chemical', icon: '🟫', desc: 'Kim loại cứng màu đỏ nâu, dẫn điện tốt.', metalType: 'hard' },
];

// ==========================================
// COMPONENT: ITEM CÓ THỂ KÉO (Tích hợp hiệu ứng lún kim loại)
// ==========================================
function DraggableItem({ item, viewMode, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  const opacity = isDragging ? 0.3 : 1; // Làm mờ item gốc khi đang kéo bóng ma
  
  // Kích hoạt class CSS nhún/lún tùy theo độ cứng kim loại
  const metalClass = item.metalType === 'soft' ? 'soft-metal' : (item.metalType === 'hard' ? 'hard-metal' : '');

  // Render dạng Grid (3 cột)
  if (viewMode === 'grid') {
    return (
      <div 
        ref={setNodeRef} 
        className={metalClass} 
        style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab', backgroundColor: '#fff', opacity }} 
        {...listeners} {...attributes} onClick={onClick}
      >
        <span style={{ fontSize: '30px' }}>{item.icon}</span>
        <span style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px', fontWeight: 'bold' }}>{item.name}</span>
      </div>
    );
  }
  
  // Render dạng List (Danh sách dọc)
  return (
    <div 
      ref={setNodeRef} 
      className={metalClass} 
      style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'grab', backgroundColor: '#fff', marginBottom: '10px', opacity }} 
      {...listeners} {...attributes} onClick={onClick}
    >
      <span style={{ fontSize: '24px', marginRight: '15px' }}>{item.icon}</span>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{item.desc.substring(0, 35)}...</div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT: BÓNG MA (HIỂN THỊ LÚC ĐANG KÉO, NỔI TRÊN CÙNG)
// ==========================================
function DragPreview({ item }) {
  if (!item) return null;
  return (
    <div style={{ padding: '15px', backgroundColor: '#fff', border: '2px solid #3498db', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', opacity: 0.9, cursor: 'grabbing' }}>
      <span style={{ fontSize: '40px' }}>{item.icon}</span>
      <span style={{ fontWeight: 'bold', marginTop: '5px' }}>{item.name}</span>
    </div>
  );
}

// ==========================================
// COMPONENT: KHU VỰC LÀM THÍ NGHIỆM TRUNG TÂM (CHỨA KHÓI LỬA)
// ==========================================
function CentralWorkspace({ deskItem, beakerContent, isReacting, bubbles }) {
  const dropZoneId = deskItem === null ? 'empty-desk' : 'active-beaker';
  const { isOver, setNodeRef } = useDroppable({ id: dropZoneId });

  // 1. Trạng thái Bàn Trống
  if (deskItem === null) {
    return (
      <div ref={setNodeRef} style={{ width: '300px', height: '150px', border: isOver ? '3px dashed #3498db' : '3px dashed #bdc3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7f8c8d', fontWeight: 'bold', backgroundColor: isOver ? '#ebf5fb' : 'transparent', transition: 'all 0.2s ease' }}>
        {isOver ? 'Thả Dụng Cụ Vào Đây!' : 'Kéo Cốc Thủy Tinh ra bàn'}
      </div>
    );
  }

  // 2. Trạng thái Đã có Cốc
  return (
    <div ref={setNodeRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '180px', height: '220px', border: isOver ? '4px dashed #2ecc71' : '4px solid rgba(255,255,255,0.8)', backgroundColor: 'rgba(236, 240, 241, 0.4)', borderRadius: '5px 5px 30px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
        
        {/* Lớp nước / dung dịch (Có class water-layer để bo góc và water-reacting để nháy sáng) */}
        {beakerContent && (
          <div className={`water-layer ${isReacting ? 'water-reacting' : ''}`} style={{ height: '100px', backgroundColor: beakerContent === 'H2O' ? 'rgba(52,152,219,0.7)' : 'rgba(155,89,182,0.7)', transition: 'all 0.5s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', position: 'relative' }}>
            {beakerContent}

            {/* HIỆU ỨNG KHI ĐANG PHẢN ỨNG */}
            {isReacting && (
              <>
                {/* Lửa cháy trên mặt nước */}
                <div className="fire-animation">🔥</div>
                
                {/* Khói bay lên (2 làn khói lệch nhịp nhau) */}
                <div className="smoke-animation">💨</div>
                <div className="smoke-animation" style={{ left: '25%', animationDelay: '0.5s', fontSize: '30px' }}>💨</div>

                {/* Bọt khí chìm bên dưới nước sôi */}
                {bubbles.map(b => (
                  <div key={b.id} className="particle-bubble-violent" style={{ width: b.size, height: b.size, left: b.left, animationDelay: b.delay, '--rnd': Math.random() }} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
      <div style={{ width: '250px', height: '20px', backgroundColor: '#7f8c8d', borderRadius: '10px', marginTop: '10px' }}></div>
    </div>
  );
}

// ==========================================
// COMPONENT: MAIN APP (QUẢN LÝ TOÀN BỘ LOGIC)
// ==========================================
export default function AdvancedVirtualLab() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarView, setSidebarView] = useState('grid');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Trạng thái mở/đóng 2 thanh bên
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  // Trạng thái Drag & Drop Overlay
  const [activeDragId, setActiveDragId] = useState(null);
  const activeDragItem = useMemo(() => inventory.find(i => i.id === activeDragId), [activeDragId, inventory]);

  // Trạng thái bài Lab
  const [deskItem, setDeskItem] = useState(null);
  const [beakerContent, setBeakerContent] = useState(null);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionInfo, setReactionInfo] = useState({ equation: 'Chưa có', condition: 'N/A', description: 'Kéo dụng cụ và hóa chất từ kho đồ bên phải ra bàn để bắt đầu.' });

  // Fix cảnh báo Math.random() bằng useMemo
  const bubbleConfig = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i, size: `${Math.random() * 8 + 5}px`, left: `${Math.random() * 80 + 10}%`, delay: `${Math.random() * 0.5}s`
    }));
  }, []);

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id); // Bật bóng ma
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null); // Tắt bóng ma
    const { active, over } = event;
    if (!over) return; 

    const dropId = over.id;
    const dragId = active.id;

    // Kịch bản 1: Đặt cốc lên bàn
    if (dropId === 'empty-desk' && dragId === 'beaker') {
      setDeskItem('beaker');
      setReactionInfo({ equation: 'Chuẩn bị cốc thí nghiệm', condition: 'N/A', description: 'Cốc đã sẵn sàng. Hãy rót dung môi (Nước) vào cốc.' });
    }
    // Kịch bản 2: Rót nước vào cốc
    else if (dropId === 'active-beaker' && dragId === 'water') {
      if (beakerContent !== null) return;
      setBeakerContent('H2O');
      setReactionInfo({ equation: 'Cốc chứa H₂O', condition: 'N/A', description: 'Dung môi đã sẵn sàng. Hãy thả hóa chất (Na) vào để xem hiện tượng.' });
    }
    // Kịch bản 3: Thả Natri vào Nước
    else if (dropId === 'active-beaker' && dragId === 'sodium' && beakerContent === 'H2O') {
      setIsReacting(true); // BẬT HIỆU ỨNG
      setReactionInfo({ equation: '2Na + 2H₂O → 2NaOH + H₂↑', condition: 'Nhiệt độ phòng', description: 'Natri tác dụng mãnh liệt với nước, nóng chảy thành giọt tròn chạy trên mặt nước, tỏa nhiều nhiệt và sinh ra khí Hydro. Dung dịch chuyển sang tính bazơ.' });

      // TẮT HIỆU ỨNG SAU 3 GIÂY VÀ SINH CHẤT MỚI
      setTimeout(() => {
        setIsReacting(false);
        setBeakerContent('NaOH');
        // Cơ chế Crafting: Thêm dung dịch mới vào kho đồ
        setInventory(prev => prev.find(i => i.id === 'naoh') ? prev : [...prev, { id: 'naoh', name: 'Natri Hydroxit (NaOH)', type: 'solvent', icon: '🧪', desc: 'Dung dịch bazơ kiềm mạnh, làm quỳ tím hóa xanh.' }]);
      }, 3000);
    }
    // Bắt lỗi: Thả Đồng vào Nước
    else if (dropId === 'active-beaker' && dragId === 'copper' && beakerContent === 'H2O') {
      setReactionInfo({ equation: 'Cu + H₂O → Không phản ứng', condition: 'N/A', description: 'Đồng (Cu) là kim loại hoạt động yếu, không tác dụng với nước ở nhiệt độ thường.' });
    }
  };

  // Logic Search & Phân loại Sidebar
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#ecf0f1', overflow: 'hidden', position: 'relative' }}>
      
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        
        {/* ================= CỘT TRÁI (THÔNG TIN KHOA HỌC) ================= */}
        <div style={{ width: isLeftOpen ? '320px' : '0', transition: 'width 0.3s ease', backgroundColor: '#fff', borderRight: '2px solid #bdc3c7', position: 'relative', flexShrink: 0 }}>
          
          <div style={{ display: isLeftOpen ? 'block' : 'none', width: '320px', height: '100%', padding: '20px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>📊 Phân tích</h3>
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#7f8c8d', margin: '0 0 5px 0' }}>Phản ứng:</h4>
              <div className="info-box" style={{ padding: '15px', backgroundColor: '#f9f9f9', fontWeight: 'bold', color: '#e74c3c', borderRadius: '5px' }}>{reactionInfo.equation}</div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#7f8c8d', margin: '0 0 5px 0' }}>Điều kiện:</h4>
              <div className="info-box" style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>{reactionInfo.condition}</div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#7f8c8d', margin: '0 0 5px 0' }}>Mô tả:</h4>
              <div className="info-box" style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', lineHeight: '1.5', color: '#333' }}>{reactionInfo.description}</div>
            </div>
          </div>

          <button onClick={() => setIsLeftOpen(!isLeftOpen)} style={{ position: 'absolute', right: '-30px', top: '20px', width: '30px', height: '40px', backgroundColor: '#fff', border: '1px solid #bdc3c7', borderLeft: 'none', borderRadius: '0 5px 5px 0', cursor: 'pointer', zIndex: 10 }}>
            {isLeftOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* ================= CỘT GIỮA (WORKSPACE) ================= */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
          <CentralWorkspace deskItem={deskItem} beakerContent={beakerContent} isReacting={isReacting} bubbles={bubbleConfig} />
          
          <button onClick={() => { setDeskItem(null); setBeakerContent(null); setIsReacting(false); }} style={{ marginTop: '40px', padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔄 Dọn Bàn Lại Từ Đầu
          </button>
        </div>

        {/* ================= CỘT PHẢI (KHO COMPONENT) ================= */}
        <div style={{ width: isRightOpen ? '340px' : '0', transition: 'width 0.3s ease', backgroundColor: '#fdfdfd', borderLeft: '2px solid #bdc3c7', position: 'relative', flexShrink: 0 }}>
          
          <button onClick={() => setIsRightOpen(!isRightOpen)} style={{ position: 'absolute', left: '-30px', top: '20px', width: '30px', height: '40px', backgroundColor: '#fff', border: '1px solid #bdc3c7', borderRight: 'none', borderRadius: '5px 0 0 5px', cursor: 'pointer', zIndex: 10 }}>
            {isRightOpen ? '▶' : '◀'}
          </button>

          <div style={{ display: isRightOpen ? 'flex' : 'none', flexDirection: 'column', height: '100%', width: '340px', boxSizing: 'border-box' }}>
            
            <div style={{ padding: '15px', display: 'flex', gap: '10px', borderBottom: '1px solid #eee' }}>
              <input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <button onClick={() => setSidebarView(sidebarView === 'grid' ? 'list' : 'grid')} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#ecf0f1', border: '1px solid #bdc3c7', borderRadius: '4px' }}>
                {sidebarView === 'grid' ? '☰' : '▦'}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', boxSizing: 'border-box' }}>
              {selectedItem ? (
                <div style={{ animation: 'fadeIn 0.2s ease' }}>
                  <button onClick={() => setSelectedItem(null)} style={{ color: '#3498db', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold', fontSize: '14px' }}>
                    ◀ Quay lại kho
                  </button>
                  <div style={{ textAlign: 'center', padding: '30px 20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '80px', marginBottom: '10px' }}>{selectedItem.icon}</div>
                    <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>{selectedItem.name}</h3>
                    <div style={{ textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                      <h4 style={{ color: '#7f8c8d', margin: '0 0 10px 0' }}>Mô tả chi tiết</h4>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#555', margin: 0 }}>{selectedItem.desc}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ paddingBottom: '20px' }}>
                  <h4 style={{ color: '#7f8c8d', margin: '0 0 10px 0' }}>Dụng Cụ</h4>
                  <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {filtered.filter(i => i.type === 'apparatus').map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} onClick={() => setSelectedItem(item)} />)}
                  </div>

                  <h4 style={{ color: '#7f8c8d', margin: '0 0 10px 0' }}>Dung Môi</h4>
                  <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {filtered.filter(i => i.type === 'solvent').map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} onClick={() => setSelectedItem(item)} />)}
                  </div>

                  <h4 style={{ color: '#7f8c8d', margin: '0 0 10px 0' }}>Hóa Chất</h4>
                  <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {filtered.filter(i => i.type === 'chemical').map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} onClick={() => setSelectedItem(item)} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* BÓNG MA (DRAG OVERLAY) NỔI TRÊN CÙNG MỌI Z-INDEX */}
        <DragOverlay>
          <DragPreview item={activeDragItem} />
        </DragOverlay>

      </DndContext>
    </div>
  );
}