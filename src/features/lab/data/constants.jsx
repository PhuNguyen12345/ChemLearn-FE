import React from 'react';
import { Beaker, TestTube, Flame, Droplet, Square, CircleDot } from 'lucide-react';

export const INITIAL_INVENTORY = [
  { id: 'beaker', name: 'Cốc Thủy Tinh', type: 'apparatus', icon: <Beaker className="w-8 h-8" strokeWidth={1.5} />, desc: 'Dụng cụ thí nghiệm chứa dung môi và thực hiện phản ứng.' },
  { id: 'test_tube', name: 'Ống Nghiệm', type: 'apparatus', icon: <TestTube className="w-8 h-8" strokeWidth={1.5} />, desc: 'Dụng cụ nhỏ dùng chứa dung dịch.' },
  { id: 'bunsen_burner', name: 'Đèn Cồn', type: 'apparatus', icon: <Flame className="w-8 h-8" strokeWidth={1.5} />, desc: 'Thiết bị cung cấp nhiệt hằng định.' },
  { id: 'water', name: 'Nước (H2O)', type: 'solvent', icon: <Droplet className="w-8 h-8 text-blue-500 drop-shadow-sm" fill="#3b82f6" stroke="none" />, desc: 'Dung môi phổ biến.' },
  { id: 'sodium', name: 'Natri (Na)', type: 'chemical', icon: <Square className="w-8 h-8 text-slate-300 drop-shadow-sm" fill="#cbd5e1" stroke="none" />, desc: 'Kim loại kiềm mềm. Phản ứng cực mạnh với nước.', metalType: 'soft' },
  { id: 'copper', name: 'Đồng (Cu)', type: 'chemical', icon: <Square className="w-8 h-8 text-amber-700 drop-shadow-sm" fill="#b45309" stroke="none" />, desc: 'Kim loại cứng màu đỏ nâu, dẫn nhiệt tốt.', metalType: 'hard' },
  { id: 'kmno4', name: 'Thuốc Tím (KMnO4)', type: 'chemical', icon: <CircleDot className="w-8 h-8 text-purple-600 drop-shadow-sm" fill="#9333ea" stroke="none" />, desc: 'Chất oxy hóa mạnh, màu tím đậm đặc trưng.' }
];
