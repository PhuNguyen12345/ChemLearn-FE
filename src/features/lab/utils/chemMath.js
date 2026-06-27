/**
 * Core Math Engine cho ChemLearn Virtual Lab
 * Xử lý tính toán định lượng hóa học với độ chính xác cao.
 */

// 1. Tiện ích làm tròn (Xử lý sai số Floating-Point của JavaScript)
// Mặc định làm tròn 4 chữ số thập phân cho tính toán ngầm (Logic Engine).
// Có thể tùy chỉnh tham số decimals = 2 khi xuất ra UI.
export const round = (value, decimals = 4) => {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

// 2. Tiện ích Quy đổi (Conversion Utilities)
export const calculateMolesFromMass = (m, M) => {
  if (!m || !M) return 0;
  return round(m / M);
};
//tính số mol từ thể tích khí 
export const calculateMolesFromVolumeGas = (V_liters) => {
  if (!V_liters) return 0;
  // Áp dụng chuẩn SGK mới (25 độ C, 1 bar) -> hằng số 24.79 thay vì 22.4
  return round(V_liters / 24.79);
};
//tính số mol từ dung dịch
export const calculateMolesFromSolution = (C_M, V_mL) => {
  if (!C_M || !V_mL) return 0;
  // Đổi mL sang Lít trước khi nhân
  const V_L = V_mL / 1000;
  return round(C_M * V_L);
};

/**
 * 3. Thuật toán Xét Chất Dư/Hết (Limiting Reactant Solver)
 * Phương trình tổng quát: aA + bB -> cC + dD
 * 
 * @param {Object} reactantA { name: 'Zn', moles: 0.01, M: 65, ratio: 1 } // ratio tương ứng với 'a' (hệ số pt)
 * @param {Object} reactantB { name: 'HCl', moles: 0.02, M: 36.5, ratio: 2 } // ratio tương ứng với 'b' (hệ số pt)
 * @param {Array} products [{ name: 'ZnCl2', M: 136, ratio: 1 }, { name: 'H2', M: 2, ratio: 1, isGas: true }]
 * @returns {Object} GroundTruth data
 */
export const evaluateReaction = (reactantA, reactantB, products = []) => {
  const { moles: n_A, ratio: a } = reactantA;
  const { moles: n_B, ratio: b } = reactantB;

  // Lập tỉ số so sánh
  const ratioA = n_A / a;
  const ratioB = n_B / b;

  let limitingReactant = null;
  let excessReactant = null;
  let limitingMoles = 0;
  let limitingRatio = 0;

  // Phân loại Trường hợp theo Thuật toán
  if (ratioA < ratioB) {
    // Trường hợp 1: A hết, B dư
    limitingReactant = reactantA;
    excessReactant = reactantB;
    limitingMoles = n_A;
    limitingRatio = a;
  } else if (ratioA > ratioB) {
    // Trường hợp 2: B hết, A dư
    limitingReactant = reactantB;
    excessReactant = reactantA;
    limitingMoles = n_B;
    limitingRatio = b;
  } else {
    // Trường hợp 3: Phản ứng vừa đủ (Bằng nhau)
    limitingReactant = reactantA; // Tính theo A hay B đều được
    limitingMoles = n_A;
    limitingRatio = a;
  }

  // Tính toán Khối lượng / Số mol chất dư còn lại (nếu có)
  let excessRemaining = null;
  if (excessReactant) {
    // n_phản_ứng = (n_chất_hết * hệ_số_chất_dư) / hệ_số_chất_hết
    const reactedMoles = round((limitingMoles * excessReactant.ratio) / limitingRatio);
    const remainingMoles = round(excessReactant.moles - reactedMoles);
    const remainingMass = round(remainingMoles * excessReactant.M);

    excessRemaining = {
      name: excessReactant.name,
      initialMoles: excessReactant.moles,
      reactedMoles,
      remainingMoles,
      remainingMass,
      // Tỷ lệ còn lại (%) dùng để truyền vào hệ thống mài mòn (Tween) của Phaser
      remainingPercentage: round(remainingMoles / excessReactant.moles)
    };
  }

  // Tính toán số lượng Sản phẩm sinh ra (Khí, Kết tủa, Dung dịch...)
  const generatedProducts = products.map(prod => {
    // n_sản_phẩm = (n_chất_hết * hệ_số_sản_phẩm) / hệ_số_chất_hết
    const prodMoles = round((limitingMoles * prod.ratio) / limitingRatio);
    const prodMass = round(prodMoles * prod.M);
    
    // Nếu là khí, tính thể tích (DKC mới 24.79)
    const prodVolume = prod.isGas ? round(prodMoles * 24.79) : null;

    return {
      name: prod.name,
      moles: prodMoles,
      mass: prodMass,
      volume: prodVolume,
      isGas: !!prod.isGas,
      isPrecipitate: !!prod.isPrecipitate
    };
  });

  return {
    limitingReactant: limitingReactant.name,
    excessRemaining, // Trả về null nếu phản ứng vừa đủ
    generatedProducts
  };
};
