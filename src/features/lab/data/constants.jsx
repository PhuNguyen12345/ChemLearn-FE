import React from 'react';
import { Beaker, TestTube, Flame, Droplet, Square, CircleDot } from 'lucide-react';

// Các loại dụng cụ / item trong inventory 
export const ITEM_TYPE = {
  CONTAINER: 'CONTAINER', // Dành cho các loại bình như ống nghiệm, cốc thủy tinh...
  EQUIPMENT: 'EQUIPMENT', // Dành cho dụng cụ hỗ trợ như đèn cồn, kẹp...
  CHEMICAL: 'CHEMICAL',   // Dành cho các hóa chất 
};

// Các trạng thái vật lý / state 
export const PHYSICAL_STATE = {
  SOLID: 'SOLID',   // CHẤT RẮN 
  LIQUID: 'LIQUID', // CHẤT LỎNG 
  GAS: 'GAS'        // CHẤT KHÍ 
};

export const INITIAL_INVENTORY = [
  // ==========================================
  // 1. DỤNG CỤ LAB (EQUIPMENT & CONTAINERS)
  // ==========================================
  { id: 'beaker', name: 'Cốc Thủy Tinh', type: ITEM_TYPE.CONTAINER, icon: <Beaker className="w-8 h-8" strokeWidth={1.5} />, desc: 'Dụng cụ thí nghiệm chứa dung môi và thực hiện phản ứng.' },
  { id: 'test_tube', name: 'Ống Nghiệm', type: ITEM_TYPE.CONTAINER, icon: <TestTube className="w-8 h-8" strokeWidth={1.5} />, desc: 'Dụng cụ nhỏ dùng chứa dung dịch.' },
  { id: 'bunsen_burner', name: 'Đèn Cồn', type: ITEM_TYPE.EQUIPMENT, icon: <Flame className="w-8 h-8" strokeWidth={1.5} />, desc: 'Thiết bị cung cấp nhiệt hằng định.' },

  // ==========================================
  // 2. CHẤT HOÁ HỌC - DẠNG RẮN (SOLID)
  // ==========================================
  { id: 'sodium', name: 'Natri (Na)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.SOLID, icon: <Square className="w-8 h-8 text-slate-300 drop-shadow-sm" fill="#cbd5e1" stroke="none" />, desc: 'Kim loại kiềm mềm. Phản ứng cực mạnh với nước.', metalType: 'soft' },
  { id: 'copper', name: 'Đồng (Cu)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.SOLID, icon: <Square className="w-8 h-8 text-amber-700 drop-shadow-sm" fill="#b45309" stroke="none" />, desc: 'Kim loại cứng màu đỏ nâu, dẫn nhiệt tốt.', metalType: 'hard' },
  { id: 'kmno4', name: 'Thuốc Tím (KMnO_{4})', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.SOLID, icon: <CircleDot className="w-8 h-8 text-purple-600 drop-shadow-sm" fill="#9333ea" stroke="none" />, desc: 'Chất oxy hóa mạnh, màu tím đậm đặc trưng.' },
  { id: 'nacl', name: 'Sodium Chloride (NaCl)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.SOLID, icon: <Square className="w-8 h-8 text-white drop-shadow-sm" fill="#ffffff" stroke="#cbd5e1" />, desc: 'Natri Clorua - Muối ăn.' },
  { id: 'fe_powder', name: 'Sắt (Fe)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.SOLID, icon: <Square className="w-8 h-8 text-slate-600 drop-shadow-sm" fill="#475569" stroke="none" />, desc: 'Bột sắt màu xám đen.' },
  { id: 'na2co3', name: 'Sodium Carbonate (Na_{2}CO_{3})', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.SOLID, icon: <Square className="w-8 h-8 text-slate-100 drop-shadow-sm" fill="#f1f5f9" stroke="#e2e8f0" />, desc: 'Natri Cacbonat.' },
  { id: 'zn_grain', name: 'Kẽm (Zn)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.SOLID, icon: <Square className="w-8 h-8 text-slate-400 drop-shadow-sm" fill="#94a3b8" stroke="none" />, desc: 'Hạt kẽm màu xám.' },
  { id: 'cao', name: 'Canxi Oxit (CaO)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.SOLID, icon: <Square className="w-8 h-8 text-white drop-shadow-sm" fill="#ffffff" stroke="#e2e8f0" />, desc: 'Canxi Oxit - Vôi sống.' },

  // ==========================================
  // 3. CHẤT HOÁ HỌC - DẠNG LỎNG & DUNG MÔI (LIQUID)
  // ==========================================
  { id: 'water', name: 'Nước (H_{2}O)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.LIQUID, icon: <Droplet className="w-8 h-8 text-blue-500 drop-shadow-sm" fill="#3b82f6" stroke="none" />, desc: 'Dung môi phổ biến.' },
  { id: 'agno3', name: 'Bạc Nitrate (AgNO_{3})', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.LIQUID, icon: <Droplet className="w-8 h-8 text-blue-200 drop-shadow-sm" fill="#e2e8f0" stroke="none" />, desc: 'Bạc Nitrat - Dung dịch trong suốt.' },
  { id: 'bacl2', name: 'Bari Chloride (BaCl_{2})', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.LIQUID, icon: <Droplet className="w-8 h-8 text-blue-100 drop-shadow-sm" fill="#f1f5f9" stroke="none" />, desc: 'Bari Clorua.' },
  { id: 'na2so4', name: 'Sodium Sulfate (Na_{2}SO_{4})', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.LIQUID, icon: <Droplet className="w-8 h-8 text-blue-500/20 drop-shadow-sm" fill="#dbeafe" stroke="none" />, desc: 'Natri Sulfat.' },
  { id: 'cuso4', name: 'Đồng (II) Sulfate (CuSO_{4})', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.LIQUID, icon: <Droplet className="w-8 h-8 text-blue-600 drop-shadow-sm" fill="#2563eb" stroke="none" />, desc: 'Đồng(II) Sulfat - Dung dịch màu xanh dương.' },
  { id: 'h2c2o4', name: 'Oxalic Acid (H_{2}C_{2}O_{4})', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.LIQUID, icon: <Droplet className="w-8 h-8 text-slate-400 drop-shadow-sm" fill="#f8fafc" stroke="none" />, desc: 'Axit Oxalic.' },
  { id: 'hcl', name: 'Hydrochloric Acid (HCl)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.LIQUID, icon: <Droplet className="w-8 h-8 text-yellow-100 drop-shadow-sm" fill="#fef9c3" stroke="none" />, desc: 'Axit Clohydric.' },
  { id: 'naoh_sol', name: 'Natri Hydroxit (NaOH)', type: ITEM_TYPE.CHEMICAL, state: PHYSICAL_STATE.LIQUID, icon: <Droplet className="w-8 h-8 text-pink-200 drop-shadow-sm" fill="#fdf2f8" stroke="none" />, desc: 'Natri Hydroxit - Dung dịch kiềm.' }
];
