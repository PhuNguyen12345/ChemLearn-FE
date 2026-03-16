import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function CentralWorkspace({ deskItem, beakerContent, isReacting, bubbles }) {
  const dropZoneId = deskItem === null ? 'empty-desk' : 'active-beaker';
  const { isOver, setNodeRef } = useDroppable({ id: dropZoneId });

  if (deskItem === null) {
    return (
      <div ref={setNodeRef} style={{ width: '300px', height: '150px', border: isOver ? '3px dashed #3498db' : '3px dashed #bdc3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7f8c8d', fontWeight: 'bold', backgroundColor: isOver ? '#ebf5fb' : 'transparent', transition: 'all 0.2s ease' }}>
        {isOver ? 'Thả Dụng Cụ Vào Đây!' : 'Kéo Cốc Thủy Tinh ra bàn'}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '180px', height: '220px', border: isOver ? '4px dashed #2ecc71' : '4px solid rgba(255,255,255,0.8)', backgroundColor: 'rgba(236, 240, 241, 0.4)', borderRadius: '5px 5px 30px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
        
        {beakerContent && (
          <div className={`water-layer ${isReacting ? 'water-reacting' : ''}`} style={{ height: '100px', backgroundColor: beakerContent === 'H2O' ? 'rgba(52,152,219,0.7)' : 'rgba(155,89,182,0.7)', transition: 'all 0.5s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', position: 'relative' }}>
            {beakerContent}

            {isReacting && (
              <>
                <div className="fire-animation">🔥</div>
                
                <div className="smoke-animation">💨</div>
                <div className="smoke-animation" style={{ left: '25%', animationDelay: '0.5s', fontSize: '30px' }}>💨</div>

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
