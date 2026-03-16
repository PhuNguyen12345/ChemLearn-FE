import React, { useState, useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import '/Lab2.css'; 

import { INITIAL_INVENTORY } from './data/constants';
import DraggableItem from './components/DraggableItem';
import DragPreview from './components/DragPreview';
import CentralWorkspace from './components/CentralWorkspace';

export default function VirtualLabPage() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarView, setSidebarView] = useState('grid');
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  const [activeDragId, setActiveDragId] = useState(null);
  const activeDragItem = useMemo(() => inventory.find(i => i.id === activeDragId), [activeDragId, inventory]);

  const [deskItem, setDeskItem] = useState(null);
  const [beakerContent, setBeakerContent] = useState(null);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionInfo, setReactionInfo] = useState({ equation: 'Chưa có', condition: 'N/A', description: 'Kéo dụng cụ và hóa chất từ kho đồ bên phải ra bàn để bắt đầu.' });

  const bubbleConfig = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i, size: `${Math.random() * 8 + 5}px`, left: `${Math.random() * 80 + 10}%`, delay: `${Math.random() * 0.5}s`
    }));
  }, []);

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id); 
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null); 
    const { active, over } = event;
    if (!over) return; 

    const dropId = over.id;
    const dragId = active.id;

    if (dropId === 'empty-desk' && dragId === 'beaker') {
      setDeskItem('beaker');
      setReactionInfo({ equation: 'Chuẩn bị cốc thí nghiệm', condition: 'N/A', description: 'Cốc đã sẵn sàng. Hãy rót dung môi (Nước) vào cốc.' });
    }
    else if (dropId === 'active-beaker' && dragId === 'water') {
      if (beakerContent !== null) return;
      setBeakerContent('H2O');
      setReactionInfo({ equation: 'Cốc chứa H₂O', condition: 'N/A', description: 'Dung môi đã sẵn sàng. Hãy thả hóa chất (Na) vào để xem hiện tượng.' });
    }
    else if (dropId === 'active-beaker' && dragId === 'sodium' && beakerContent === 'H2O') {
      setIsReacting(true); 
      setReactionInfo({ equation: '2Na + 2H₂O → 2NaOH + H₂↑', condition: 'Nhiệt độ phòng', description: 'Natri tác dụng mãnh liệt với nước, nóng chảy thành giọt tròn chạy trên mặt nước, tỏa nhiều nhiệt và sinh ra khí Hydro. Dung dịch chuyển sang tính bazơ.' });

      setTimeout(() => {
        setIsReacting(false);
        setBeakerContent('NaOH');
        setInventory(prev => prev.find(i => i.id === 'naoh') ? prev : [...prev, { id: 'naoh', name: 'Natri Hydroxit (NaOH)', type: 'solvent', icon: '🧪', desc: 'Dung dịch bazơ kiềm mạnh, làm quỳ tím hóa xanh.' }]);
      }, 3000);
    }
    else if (dropId === 'active-beaker' && dragId === 'copper' && beakerContent === 'H2O') {
      setReactionInfo({ equation: 'Cu + H₂O → Không phản ứng', condition: 'N/A', description: 'Đồng (Cu) là kim loại hoạt động yếu, không tác dụng với nước ở nhiệt độ thường.' });
    }
  };

  const filtered = inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#ecf0f1', overflow: 'hidden', position: 'relative' }}>
      
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        
        {/* ================= CỘT TRÁI ================= */}
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

        {/* ================= CỘT GIỮA ================= */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
          <CentralWorkspace deskItem={deskItem} beakerContent={beakerContent} isReacting={isReacting} bubbles={bubbleConfig} />
          
          <button onClick={() => { setDeskItem(null); setBeakerContent(null); setIsReacting(false); }} style={{ marginTop: '40px', padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔄 Dọn Bàn Lại Từ Đầu
          </button>
        </div>

        {/* ================= CỘT PHẢI ================= */}
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
        
        <DragOverlay>
          {activeDragItem ? <DragPreview item={activeDragItem} /> : null}
        </DragOverlay>

      </DndContext>
    </div>
  );
}
