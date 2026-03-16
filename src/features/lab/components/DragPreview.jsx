import React from 'react';

export default function DragPreview({ item }) {
  if (!item) return null;
  return (
    <div style={{ padding: '15px', backgroundColor: '#fff', border: '2px solid #3498db', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', opacity: 0.9, cursor: 'grabbing' }}>
      <span style={{ fontSize: '40px' }}>{item.icon}</span>
      <span style={{ fontWeight: 'bold', marginTop: '5px' }}>{item.name}</span>
    </div>
  );
}
