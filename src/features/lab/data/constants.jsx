import React from 'react';
import { Beaker, TestTube, Flame, Droplet, Square, CircleDot } from 'lucide-react';

export const INITIAL_INVENTORY = [
  { id: 'beaker', name: 'Cốc Thủy Tinh', type: 'apparatus', icon: <Beaker className="w-8 h-8" strokeWidth={1.5} />, desc: 'Dụng cụ thí nghiệm chứa dung môi và thực hiện phản ứng.' },
  { id: 'test_tube', name: 'Ống Nghiệm', type: 'apparatus', icon: <TestTube className="w-8 h-8" strokeWidth={1.5} />, desc: 'Dụng cụ nhỏ dùng chứa dung dịch.' },
  { id: 'bunsen_burner', name: 'Đèn Cồn', type: 'apparatus', icon: <Flame className="w-8 h-8" strokeWidth={1.5} />, desc: 'Thiết bị cung cấp nhiệt hằng định.' },
  { id: 'water', name: 'Nước (H2O)', type: 'solvent', icon: <Droplet className="w-8 h-8 text-blue-500 drop-shadow-sm" fill="#3b82f6" stroke="none" />, desc: 'Dung môi phổ biến.' },
  { id: 'sodium', name: 'Natri (Na)', type: 'chemical', icon: <Square className="w-8 h-8 text-slate-300 drop-shadow-sm" fill="#cbd5e1" stroke="none" />, desc: 'Kim loại kiềm mềm. Phản ứng cực mạnh với nước.', metalType: 'soft' },
  { id: 'copper', name: 'Đồng (Cu)', type: 'chemical', icon: <Square className="w-8 h-8 text-amber-700 drop-shadow-sm" fill="#b45309" stroke="none" />, desc: 'Kim loại cứng màu đỏ nâu, dẫn nhiệt tốt.', metalType: 'hard' },
  { id: 'kmno4', name: 'Thuốc Tím (KMnO4)', type: 'chemical', icon: <CircleDot className="w-8 h-8 text-purple-600 drop-shadow-sm" fill="#9333ea" stroke="none" />, desc: 'Chất oxy hóa mạnh, màu tím đậm đặc trưng.' },
  { id: 'agno3', name: 'AgNO3', type: 'chemical', icon: <Droplet className="w-8 h-8 text-blue-200 drop-shadow-sm" fill="#e2e8f0" stroke="none" />, desc: 'Bạc Nitrat - Dung dịch trong suốt.' },
  { id: 'nacl', name: 'NaCl', type: 'chemical', icon: <Square className="w-8 h-8 text-white drop-shadow-sm" fill="#ffffff" stroke="#cbd5e1" />, desc: 'Natri Clorua - Muối ăn.' },
  { id: 'bacl2', name: 'BaCl2', type: 'chemical', icon: <Droplet className="w-8 h-8 text-blue-100 drop-shadow-sm" fill="#f1f5f9" stroke="none" />, desc: 'Bari Clorua.' },
  { id: 'na2so4', name: 'Na2SO4', type: 'chemical', icon: <Droplet className="w-8 h-8 text-blue-500/20 drop-shadow-sm" fill="#dbeafe" stroke="none" />, desc: 'Natri Sulfat.' },
  { id: 'fe_powder', name: 'Sắt (Fe)', type: 'chemical', icon: <Square className="w-8 h-8 text-slate-600 drop-shadow-sm" fill="#475569" stroke="none" />, desc: 'Bột sắt màu xám đen.' },
  { id: 'cuso4', name: 'CuSO4', type: 'chemical', icon: <Droplet className="w-8 h-8 text-blue-600 drop-shadow-sm" fill="#2563eb" stroke="none" />, desc: 'Đồng(II) Sulfat - Dung dịch màu xanh dương.' },
  { id: 'h2c2o4', name: 'H2C2O4', type: 'chemical', icon: <Droplet className="w-8 h-8 text-slate-400 drop-shadow-sm" fill="#f8fafc" stroke="none" />, desc: 'Axit Oxalic.' },
  { id: 'na2co3', name: 'Na2CO3', type: 'chemical', icon: <Square className="w-8 h-8 text-slate-100 drop-shadow-sm" fill="#f1f5f9" stroke="#e2e8f0" />, desc: 'Natri Cacbonat.' },
  { id: 'hcl', name: 'HCl', type: 'chemical', icon: <Droplet className="w-8 h-8 text-yellow-100 drop-shadow-sm" fill="#fef9c3" stroke="none" />, desc: 'Axit Clohydric.' },
  { id: 'zn_grain', name: 'Kẽm (Zn)', type: 'chemical', icon: <Square className="w-8 h-8 text-slate-400 drop-shadow-sm" fill="#94a3b8" stroke="none" />, desc: 'Hạt kẽm màu xám.' },
  { id: 'cao', name: 'CaO', type: 'chemical', icon: <Square className="w-8 h-8 text-white drop-shadow-sm" fill="#ffffff" stroke="#e2e8f0" />, desc: 'Canxi Oxit - Vôi sống.' },
  { id: 'naoh_sol', name: 'NaOH', type: 'chemical', icon: <Droplet className="w-8 h-8 text-pink-200 drop-shadow-sm" fill="#fdf2f8" stroke="none" />, desc: 'Natri Hydroxit - Dung dịch kiềm.' }
];
