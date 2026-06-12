// src/features/lab/data/challengeSchema.js

/**
 * Challenge Schema (Mock Data)
 * Định nghĩa cấu trúc bài toán, phương trình và gợi ý giải cho các phản ứng.
 * Lưu ý: Số liệu Gam/mL không nằm ở đây vì học sinh sẽ tự thiết lập qua giao diện Slider.
 */
import { calculateMolesFromMass, calculateMolesFromSolution, evaluateReaction } from '../utils/chemMath';

export const CHALLENGE_SCHEMA = {
  'HCl_Zn (Rắn)': {
    reactionKey: "HCl_Zn (Rắn)",
    equation: "Zn + 2HCl -> ZnCl2 + H2↑",
    question: "Dựa vào thông số bạn vừa thiết lập, hãy tính thể tích khí H2 sinh ra (ở đkc 25 độ C, 1 bar) và khối lượng chất rắn còn dư (nếu có). Nhập 0 nếu không có chất rắn dư.",
    hints: [
      "Bước 1: Tính số mol của Zn (n = m / 65) và HCl (n = C_M * V_L).",
      "Bước 2: Lập tỉ lệ để tìm chất dư, chất hết.",
      "Bước 3: Tính số mol khí H2 theo chất hết và nhân với 24.79 để ra thể tích."
    ],
    requiredFields: [
      { id: 'h2_volume', label: 'Thể tích khí H2 sinh ra', unit: 'Lít', evalPath: { type: 'product', targetName: 'H2', property: 'volume' } },
      { id: 'excess_mass', label: 'Khối lượng chất rắn dư', unit: 'Gam', evalPath: { type: 'excess', property: 'remainingMass' } }
    ],
    calculateGroundTruth: (inputA, inputB) => {
      const zn = inputA.name.includes('Zn') ? inputA : inputB;
      const hcl = inputA.name.includes('HCl') ? inputA : inputB;
      
      const reactantA = { name: 'Zn', moles: calculateMolesFromMass(zn.amount, 65), M: 65, ratio: 1 };
      const reactantB = { name: 'HCl', moles: calculateMolesFromSolution(hcl.molarity, hcl.amount), M: 36.5, ratio: 2 };
      const products = [
        { name: 'ZnCl2', M: 136, ratio: 1 },
        { name: 'H2', M: 2, ratio: 1, isGas: true }
      ];
      return evaluateReaction(reactantA, reactantB, products);
    }
  },
  CuSO4_NaOH: {
    reactionKey: "CuSO4_NaOH",
    equation: "CuSO4 + 2NaOH -> Cu(OH)2↓ + Na2SO4",
    question: "Dựa vào lượng dung dịch bạn vừa đổ vào, hãy tính khối lượng kết tủa xanh tạo thành và SỐ MOL của chất còn dư sau phản ứng.",
    hints: [
      "Bước 1: Đổi thể tích mL sang Lít (chia cho 1000).",
      "Bước 2: Tính số mol của cả 2 dung dịch (n = C_M * V_L) trước khi so sánh."
    ],
    requiredFields: [
      { id: 'cuoh2_mass', label: 'Khối lượng kết tủa Cu(OH)2', unit: 'Gam', evalPath: { type: 'product', targetName: 'Cu(OH)2', property: 'mass' } },
      { id: 'excess_moles', label: 'Số mol chất dư', unit: 'Mol', evalPath: { type: 'excess', property: 'remainingMoles' } }
    ],
    calculateGroundTruth: (inputA, inputB) => {
      const cuso4 = inputA.name.includes('CuSO4') ? inputA : inputB;
      const naoh = inputA.name.includes('NaOH') ? inputA : inputB;
      
      const reactantA = { name: 'CuSO4', moles: calculateMolesFromSolution(cuso4.molarity, cuso4.amount), M: 160, ratio: 1 };
      const reactantB = { name: 'NaOH', moles: calculateMolesFromSolution(naoh.molarity, naoh.amount), M: 40, ratio: 2 };
      const products = [
        { name: 'Cu(OH)2', M: 98, ratio: 1, isPrecipitate: true },
        { name: 'Na2SO4', M: 142, ratio: 1 }
      ];
      return evaluateReaction(reactantA, reactantB, products);
    }
  }
};
