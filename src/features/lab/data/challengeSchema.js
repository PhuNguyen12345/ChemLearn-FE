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
      "Bước 1: Tính số mol của Zn (n = m / 65) và HCl (n = CM * V(L)).",
      "Bước 2: Lập tỉ lệ để tìm chất dư, chất hết.",
      "Bước 3: Tính số mol khí H2 theo chất hết và nhân với 24.79 để ra thể tích."
    ],
    requiredFields: [
      { id: 'h2_volume', label: 'Thể tích khí H2 sinh ra', unit: 'Lít', evalPath: { type: 'product', targetName: 'H2', property: 'volume' } },
      { id: 'excess_mass', label: 'Khối lượng chất rắn dư', unit: 'Gam', evalPath: { type: 'excess', targetName: 'Zn', property: 'remainingMass' } }
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
      "Bước 2: Tính số mol của cả 2 dung dịch (n = CM * V(L)) trước khi so sánh."
    ],
    requiredFields: [
      { id: 'cuoh2_mass', label: 'Khối lượng kết tủa Cu(OH)2', unit: 'Gam', evalPath: { type: 'product', targetName: 'Cu(OH)2', property: 'mass' } },
      { id: 'excess_moles', label: 'Số mol chất dư', unit: 'Mol', evalPath: { type: 'excess', property: 'remainingMoles' } } // Ở đây lấy bừa chất dư nào cũng được (NaOH hoặc CuSO4)
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
  },
  'H2O_Na (Rắn)': {
    reactionKey: "H2O_Na (Rắn)",
    equation: "2Na + 2H2O -> 2NaOH + H2↑",
    question: "Dựa vào thông số bạn vừa thiết lập, hãy tính thể tích khí H2 sinh ra (ở đkc 25 độ C, 1 bar) và khối lượng Natri dư (nếu có). Biết khối lượng riêng của nước là 1g/mL.",
    hints: [
      "Bước 1: Tính số mol của Na (n = m / 23) và H2O (n = V(mL) * 1g/mL / 18).",
      "Bước 2: Lập tỉ lệ mol chia cho hệ số phương trình (2) để tìm chất dư, chất hết.",
      "Bước 3: Tính số mol khí H2 theo chất hết và nhân với 24.79 để ra thể tích."
    ],
    requiredFields: [
      { id: 'h2_volume', label: 'Thể tích khí H2 sinh ra', unit: 'Lít', evalPath: { type: 'product', targetName: 'H2', property: 'volume' } },
      { id: 'excess_mass', label: 'Khối lượng chất rắn dư', unit: 'Gam', evalPath: { type: 'excess', targetName: 'Na', property: 'remainingMass' } }
    ],
    calculateGroundTruth: (inputA, inputB) => {
      const na = inputA.name.includes('Na') ? inputA : inputB;
      const h2o = inputA.name.includes('H2O') || inputA.name.includes('Nước') || inputA.name.includes('Water') ? inputA : inputB;
      
      const reactantA = { name: 'Na', moles: calculateMolesFromMass(na.amount, 23), M: 23, ratio: 2 };
      const reactantB = { name: 'H2O', moles: calculateMolesFromMass(h2o.amount, 18), M: 18, ratio: 2 };
      const products = [
        { name: 'NaOH', M: 40, ratio: 2 },
        { name: 'H2', M: 2, ratio: 1, isGas: true }
      ];
      return evaluateReaction(reactantA, reactantB, products);
    }
  },
  AgNO3_NaCl: {
    reactionKey: "AgNO3_NaCl",
    equation: "AgNO3 + NaCl -> AgCl↓ + NaNO3",
    question: "Dựa vào lượng AgNO3 và NaCl đã dùng, hãy tính khối lượng kết tủa AgCl tạo thành và số mol chất còn dư sau phản ứng. Nhập 0 nếu phản ứng vừa đủ.",
    hints: [
      "Bước 1: Tính n(AgNO3) = CM * V(L) và n(NaCl) = m / 58.5 nếu NaCl là chất rắn.",
      "Bước 2: Phản ứng theo tỉ lệ 1:1, chất có số mol nhỏ hơn là chất hết.",
      "Bước 3: n(AgCl) bằng số mol chất hết, sau đó tính m(AgCl) = n * 143.5."
    ],
    requiredFields: [
      { id: 'agcl_mass', label: 'Khối lượng kết tủa AgCl', unit: 'Gam', evalPath: { type: 'product', targetName: 'AgCl', property: 'mass' } },
      { id: 'excess_moles', label: 'Số mol chất dư', unit: 'Mol', evalPath: { type: 'excess', property: 'remainingMoles' } }
    ],
    calculateGroundTruth: (inputA, inputB) => {
      const agno3 = inputA.name.includes('AgNO3') ? inputA : inputB;
      const nacl = inputA.name.includes('NaCl') ? inputA : inputB;

      const reactantA = { name: 'AgNO3', moles: calculateMolesFromSolution(agno3.molarity, agno3.amount), M: 170, ratio: 1 };
      const reactantB = { name: 'NaCl', moles: nacl.molarity ? calculateMolesFromSolution(nacl.molarity, nacl.amount) : calculateMolesFromMass(nacl.amount, 58.5), M: 58.5, ratio: 1 };
      const products = [
        { name: 'AgCl', M: 143.5, ratio: 1, isPrecipitate: true },
        { name: 'NaNO3', M: 85, ratio: 1 }
      ];
      return evaluateReaction(reactantA, reactantB, products);
    }
  },
  AgNO3_HCl: {
    reactionKey: "AgNO3_HCl",
    equation: "AgNO3 + HCl -> AgCl↓ + HNO3",
    question: "Dựa vào hai dung dịch đã trộn, hãy tính khối lượng kết tủa AgCl và số mol chất còn dư sau phản ứng. Nhập 0 nếu không có chất dư.",
    hints: [
      "Bước 1: Đổi thể tích mL sang L rồi tính số mol từng dung dịch bằng n = CM * V(L).",
      "Bước 2: So sánh n(AgNO3) và n(HCl) vì phương trình có tỉ lệ 1:1.",
      "Bước 3: n(AgCl) bằng số mol chất hết, m(AgCl) = n * 143.5."
    ],
    requiredFields: [
      { id: 'agcl_mass', label: 'Khối lượng kết tủa AgCl', unit: 'Gam', evalPath: { type: 'product', targetName: 'AgCl', property: 'mass' } },
      { id: 'excess_moles', label: 'Số mol chất dư', unit: 'Mol', evalPath: { type: 'excess', property: 'remainingMoles' } }
    ],
    calculateGroundTruth: (inputA, inputB) => {
      const agno3 = inputA.name.includes('AgNO3') ? inputA : inputB;
      const hcl = inputA.name.includes('HCl') ? inputA : inputB;

      const reactantA = { name: 'AgNO3', moles: calculateMolesFromSolution(agno3.molarity, agno3.amount), M: 170, ratio: 1 };
      const reactantB = { name: 'HCl', moles: calculateMolesFromSolution(hcl.molarity, hcl.amount), M: 36.5, ratio: 1 };
      const products = [
        { name: 'AgCl', M: 143.5, ratio: 1, isPrecipitate: true },
        { name: 'HNO3', M: 63, ratio: 1 }
      ];
      return evaluateReaction(reactantA, reactantB, products);
    }
  },
  BaCl2_Na2SO4: {
    reactionKey: "BaCl2_Na2SO4",
    equation: "BaCl2 + Na2SO4 -> BaSO4↓ + 2NaCl",
    question: "Dựa vào hai dung dịch đã trộn, hãy tính khối lượng kết tủa BaSO4 và số mol chất còn dư sau phản ứng.",
    hints: [
      "Bước 1: Tính số mol BaCl2 và Na2SO4 bằng công thức n = CM * V(L).",
      "Bước 2: Phản ứng theo tỉ lệ 1:1 nên so sánh trực tiếp số mol của hai chất.",
      "Bước 3: n(BaSO4) bằng số mol chất hết, m(BaSO4) = n * 233."
    ],
    requiredFields: [
      { id: 'baso4_mass', label: 'Khối lượng kết tủa BaSO4', unit: 'Gam', evalPath: { type: 'product', targetName: 'BaSO4', property: 'mass' } },
      { id: 'excess_moles', label: 'Số mol chất dư', unit: 'Mol', evalPath: { type: 'excess', property: 'remainingMoles' } }
    ],
    calculateGroundTruth: (inputA, inputB) => {
      const bacl2 = inputA.name.includes('BaCl2') ? inputA : inputB;
      const na2so4 = inputA.name.includes('Na2SO4') ? inputA : inputB;

      const reactantA = { name: 'BaCl2', moles: calculateMolesFromSolution(bacl2.molarity, bacl2.amount), M: 208, ratio: 1 };
      const reactantB = { name: 'Na2SO4', moles: calculateMolesFromSolution(na2so4.molarity, na2so4.amount), M: 142, ratio: 1 };
      const products = [
        { name: 'BaSO4', M: 233, ratio: 1, isPrecipitate: true },
        { name: 'NaCl', M: 58.5, ratio: 2 }
      ];
      return evaluateReaction(reactantA, reactantB, products);
    }
  }
};
