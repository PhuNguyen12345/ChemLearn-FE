// src/mock/labTasksMock.js
export const LAB_TASKS_MOCK = {
  // Ví dụ bài: Kim loại kiềm tác dụng với nước
  'KIM_LOAI': [
    { id: 'task_1', action: 'DRAG_FLASK_TO_WORKSPACE', desc: 'Kéo bình phản ứng ra khu vực thí nghiệm', points: 10, isCompleted: false },
    { id: 'task_2', action: 'DRAG_H2O_TO_FLASK', desc: 'Kéo Nước (H2O) vào bình phản ứng', points: 10, isCompleted: false },
    { id: 'task_3', action: 'H2O_Na (Rắn)', desc: 'Kéo Natri (Na) vào bình phản ứng để xem hiện tượng', points: 30, isCompleted: false }
  ],
  // Ví dụ bài: Phản ứng tạo kết tủa
  'KET_TUA': [
    { id: 'task_1', action: 'DRAG_FLASK_TO_WORKSPACE', desc: 'Kéo bình phản ứng ra khu vực thí nghiệm', points: 10, isCompleted: false },
    { id: 'task_2', action: 'DRAG_BACL2_TO_FLASK', desc: 'Kéo dung dịch BaCl2 vào bình', points: 10, isCompleted: false },
    { id: 'task_3', action: 'BaCl2_Na2SO4', desc: 'Kéo dung dịch Na2SO4 vào bình', points: 30, isCompleted: false }
  ],
  // Ví dụ bài: Phản ứng Axit - Bazơ
  'AXIT_BAZO': [
    { id: 'task_1', action: 'DRAG_FLASK_TO_WORKSPACE', desc: 'Kéo bình phản ứng ra khu vực thí nghiệm', points: 10, isCompleted: false },
    { id: 'task_2', action: 'DRAG_NAOH_TO_FLASK', desc: 'Kéo dung dịch NaOH vào bình', points: 10, isCompleted: false },
    { id: 'task_3', action: 'HCl_NaOH', desc: 'Kéo dung dịch HCl vào bình để trung hòa', points: 30, isCompleted: false }
  ]
};