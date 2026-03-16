import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function DraggableItem({ item, viewMode, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  const opacity = isDragging ? 0.3 : 1; 
  
  const metalClass = item.metalType === 'soft' ? 'soft-metal' : (item.metalType === 'hard' ? 'hard-metal' : '');

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
