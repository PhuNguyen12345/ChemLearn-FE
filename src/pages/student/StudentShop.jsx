import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../stores/useStudentStore';
import { Coins, ArrowLeft, Shield, Zap, Sparkles } from 'lucide-react';
import shopBg from '../../assets/shop-bg.png';

import bottle1 from '../../assets/bottle1.png';
import sword1 from '../../assets/sword1.png';
import staff1 from '../../assets/staff1.png';

const SHOP_ITEMS = [
  { id: 'bottle1', type: 'consumable', name: 'Bình Khôi Phục', price: 50, icon: <img src={bottle1} alt="Bottle" className="w-full h-full object-contain drop-shadow-2xl" draggable="false" />, desc: 'Hồi phục sinh lực' },
  { id: 'sword1', type: 'equipment', name: 'Kiếm Tân Binh', price: 1000, icon: <img src={sword1} alt="Sword" className="w-full h-full object-contain drop-shadow-2xl" draggable="false" />, desc: 'Vũ khí cho người mới' },
  { id: 'staff1', type: 'equipment', name: 'Trượng Pháp Thuật', price: 1500, icon: <img src={staff1} alt="Staff" className="w-full h-full object-contain drop-shadow-2xl" draggable="false" />, desc: 'Tăng sát thương chí mạng' },
];

// Create total 16 slots for the 4x4 grid
const TOTAL_SLOTS = 16;

const StudentShop = ({ onBack }) => {
  const { coins, inventory, buyItem } = useStudentStore();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div className="flex w-full flex-1 min-h-[calc(100vh-8rem)] rounded-2xl shadow-xl bg-[#1a1c29] items-center justify-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">

      {/* Background Container forcing aspect ratio */}
      <div className="relative w-full h-full bg-slate-900 overflow-hidden">

        {/* The background stretching to cover the full width/height perfectly matching percentages */}
        <div
          className="absolute inset-0 bg-[length:100%_100%] bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${shopBg})` }}
        />

        {/* Back Button */}
        <button
          onClick={() => navigate('/student/home')}
          className="absolute top-4 left-4 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all shadow-lg border border-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Coin display */}
        <div
          className="absolute z-10 flex items-center gap-2 bg-black/60 px-5 py-2.5 rounded-full border border-yellow-500/30 backdrop-blur-sm shadow-lg pointer-events-none"
          style={{ top: '35%', left: '35%' }}
        >
          <Coins className="w-6 h-6 text-yellow-400" />
          <span className="font-black text-xl text-yellow-400 drop-shadow-md">{coins} Vàng</span>
        </div>

        {/* Selected Item Info Box (bottom left area) */}
        {hoveredItem && (
          <div className="absolute bottom-6 left-1/4 -translate-x-1/2 w-64 bg-black/80 backdrop-blur-md border-2 border-amber-600/50 rounded-xl p-4 text-white z-20 pointer-events-none transform transition-all shadow-2xl">
            <h3 className="font-bold text-amber-400 mb-1">{hoveredItem.name}</h3>
            <p className="text-sm text-slate-300 mb-2">{hoveredItem.desc}</p>
            <div className="flex items-center gap-1 font-bold text-yellow-400">
              <Coins className="w-4 h-4" />
              {hoveredItem.price} Vàng
            </div>
            {hoveredItem.type !== 'consumable' && inventory.some(i => i.id === hoveredItem.id) && (
              <div className="mt-2 text-xs font-bold text-green-400 bg-green-400/20 px-2 py-1 rounded inline-block">
                ĐÃ SỞ HỮU
              </div>
            )}
            {hoveredItem.type === 'consumable' && (
              <div className="mt-2 text-xs font-bold text-sky-400 bg-sky-400/20 px-2 py-1 rounded inline-block">
                SỞ HỮU: {inventory.filter(i => i.id === hoveredItem.id).length}
              </div>
            )}
          </div>
        )}

        {/* Grid Container matching the visual display cases 
            Coordinates estimated from the image:
            Left edge starts around 51.5%
            Top edge starts around 21%
            Width is about 47%
            Height is about 76%
        */}
        <div
          className="absolute z-10 grid grid-cols-4 grid-rows-4"
          style={{
            top: '21%',
            left: '51%',
            width: '36.5%',
            height: '76%',
            gap: '1% 1%'
          }}
        >
          {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
            const item = SHOP_ITEMS[index]; // Map items to first available slots
            const isOwned = item && item.type !== 'consumable' && inventory.some(i => i.id === item.id);
            const canAfford = item && coins >= item.price;

            return (
              <div
                key={item ? item.id : `empty-${index}`}
                className="relative w-full h-full flex items-center justify-center p-2 group cursor-pointer"
                onMouseEnter={() => item && setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => {
                  if (item && !isOwned && canAfford) {
                    buyItem(item);
                  }
                }}
              >
                {/* Visual hover effect for empty slot matching the glass case */}
                <div className={`absolute inset-0 rounded-lg transition-colors
                  ${item && !isOwned && canAfford ? 'group-hover:bg-amber-400/20' : ''}
                  ${item && (!canAfford || isOwned) ? 'group-hover:bg-red-400/10 cursor-not-allowed' : ''}
                `} />

                {item && (
                  <div className={`relative flex flex-col items-center justify-center z-10 w-[85%] h-[85%] transition-transform duration-300
                    ${isOwned ? 'opacity-50 grayscale' : 'group-hover:scale-110'}
                  `}>
                    <div className="relative w-full h-full flex items-center justify-center">
                      {item.icon}
                      {/* Price tag */}
                      {!isOwned && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-0.5 rounded-md text-xs font-bold text-yellow-400 whitespace-nowrap flex items-center gap-1 border border-yellow-500/50 shadow-lg">
                          {item.price}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentShop;

