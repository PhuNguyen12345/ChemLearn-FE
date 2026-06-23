// ---------------------------------------------------------------------------
// REACTION_MAP  –  Strategy Pattern / Data-Driven Lookup Dictionary
//
// Key: alphabetically sorted reactant names joined by '_'
//      e.g. dropping Na into H2O  →  key = 'H2O_Na (Rắn)'
//
// Schema (multi-layer rendering):
//   • liquidContent    – text label shown inside the liquid layer
//   • solidContent     – text label shown inside the solid/precipitate bottom layer (optional)
//   • gasContent       – text label attached to smoke particles (optional)
//   • liquidColor      – updated beaker liquid tint (optional)
//   • precipitateColor – precipitate/solid layer tint (optional)
//   • reactionState    – CSS animation state: 'violent'|'precipitation'|'exothermic' (optional)
//   • clearStateAfter  – ms after which reactionState is auto-reset to null (optional)
//   • reactionInfo     – { equation, condition, description } shown in the left panel
// ---------------------------------------------------------------------------
export const REACTION_MAP = {
  // 1. Na (solid) + H2O  →  NaOH  (violent, H₂ gas label, clears after 4 s)
  'H2O_Na (Rắn)': {
    liquidContent: 'NaOH',
    gasContent: 'H₂',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionState: 'violent',
    clearStateAfter: 4000,
    reactionInfo: {
      equation: '2Na + 2H_{2}O → 2NaOH + H_{2}↑',
      condition: 'Tỏa nhiệt',
      description: 'Phản ứng cháy nổ sinh khí Hydro.',
    },
  },

  // 2. KMnO4 (solid) + H2O  →  Purple Solution
  'H2O_KMnO4 (Rắn)': {
    liquidContent: 'KMnO_{4}',
    liquidColor: '#AC26EF',
    reactionInfo: {
      equation: 'KMnO_{4} + H_{2}O → Purple Solution',
      condition: 'Phân tán',
      description: 'Thuốc tím (KMnO_{4}) hòa tan tạo thành dung dịch màu tím đậm.',
    },
  },

  // 3. KMnO4 (templateId) dissolving into H2O
  'H2O_kmno4_template': {
    liquidContent: 'KMnO_{4}',
    liquidColor: '#AC26EF',
    reactionInfo: {
      equation: 'KMnO_{4} + H_{2}O → Purple Solution',
      condition: 'Phân tán',
      description: 'Thuốc tím (KMnO_{4}) hòa tan tạo thành dung dịch màu tím đậm.',
    },
  },

  // 4. AgNO3 + NaCl  →  AgCl↓ + NaNO₃
  'AgNO3_NaCl': {
    liquidContent: 'NaNO_{3}',
    solidContent: 'AgCl↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'AgNO_{3} + NaCl → AgCl↓ + NaNO_{3}',
      condition: 'Kết tủa trắng',
      description: 'Tạo thành kết tủa trắng Bạc Clorua.',
    },
  },

  // 5. AgNO3 + HCl  →  AgCl↓ + HNO₃
  'AgNO3_HCl': {
    liquidContent: 'HNO_{3}',
    solidContent: 'AgCl↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'AgNO_{3} + HCl → AgCl↓ + HNO_{3}',
      condition: 'Kết tủa trắng',
      description: 'Bạc Clorua kết tủa ngay lập tức.',
    },
  },

  // 6. BaCl2 + Na2SO4  →  BaSO₄↓ + 2NaCl
  'BaCl2_Na2SO4': {
    liquidContent: '2NaCl',
    solidContent: 'BaSO_{4}↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'BaCl_{2} + Na_{2}SO_{4} → BaSO_{4}↓ + 2NaCl',
      condition: 'Kết tủa trắng',
      description: 'Bari Sunfat kết tủa trắng không tan trong axit.',
    },
  },

  // 7. Fe (Rắn) + CuSO4  →  FeSO₄ (liquid) + Cu (copper precipitate deposit)
  'CuSO4_Fe (Rắn)': {
    liquidContent: 'FeSO₄',
    solidContent: 'Cu (Rắn)',
    liquidColor: 'rgba(187, 247, 208, 0.7)',
    precipitateColor: '#b45309',
    reactionInfo: {
      equation: 'Fe + CuSO_{4} → FeSO_{4} + Cu↓',
      condition: 'Nhiệt độ thường',
      description: 'Sắt đẩy đồng ra khỏi dung dịch, đồng bám vào thanh sắt.',
    },
  },

  // 8. H2C2O4 + KMnO4  →  Mn²⁺ (Colorless) — color fades to near-transparent
  'H2C2O4_KMnO4': {
    liquidContent: 'Mn^{2+}',
    liquidColor: 'rgba(200, 230, 255, 0.15)',
    reactionInfo: {
      equation: '2KMnO_{4} + 5H_{2}C_{2}O_{4} + 3H_{2}SO_{4} → 2MnSO_{4} + 10CO_{2}↑ + 8H_{2}O',
      condition: 'Mất màu tím',
      description: 'Axit oxalic khử KMnO_{4} tím thành Mn^{2+} không màu.',
    },
  },

  // 9. Na2CO3 + HCl  →  NaCl + CO₂↑ + H₂O  (violent, CO₂ gas label, clears after 3 s)
  'HCl_Na2CO3': {
    liquidContent: 'NaCl + H_{2}O',
    gasContent: 'CO_{2}',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionState: 'bubbling',
    clearStateAfter: 3000,
    reactionInfo: {
      equation: 'Na_{2}CO_{3} + 2HCl → 2NaCl + CO_{2}↑ + H_{2}O',
      condition: 'Sủi bọt mạnh',
      description: 'Natri Cacbonat phản ứng với axit clohidric giải phóng CO_{2}.',
    },
  },

  // 10. Zn (solid/grain) + HCl  →  ZnCl₂ (liquid) + H₂↑ (gas label, clears after 3 s)
  'HCl_Zn (Rắn)': {
    liquidContent: 'ZnCl_{2}',
    gasContent: 'H_{2}',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionState: 'bubbling',
    clearStateAfter: 3000,
    reactionInfo: {
      equation: 'Zn + 2HCl → ZnCl_{2} + H_{2}↑',
      condition: 'Sủi bọt',
      description: 'Kẽm hòa tan trong axit clohidric tạo khí Hydro.',
    },
  },

  // 11. NaOH + HCl  →  NaCl + H₂O
  'HCl_NaOH': {
    liquidContent: 'NaCl + H_{2}O',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionInfo: {
      equation: 'NaOH + HCl → NaCl + H_{2}O',
      condition: 'Trung hòa',
      description: 'Phản ứng trung hòa giữa bazơ và axit tạo muối và nước.',
    },
  },

  // 12. CaO + H2O  →  Ca(OH)₂ (exothermic)
  'CaO (Rắn)_H2O': {
    liquidContent: 'Ca(OH)_{2}',
    liquidColor: 'rgba(255, 255, 255, 0.8)',
    reactionState: 'exothermic',
    reactionInfo: {
      equation: 'CaO + H_{2}O → Ca(OH)_{2}',
      condition: 'Tỏa nhiệt mạnh',
      description: 'Canxi oxit phản ứng mãnh liệt với nước tạo Canxi hidroxit.',
    },
  },
};

// ---------------------------------------------------------------------------
// Helper: build a bi-directional lookup key from two reactant labels.
// Sorting alphabetically means 'H2O + Na' and 'Na + H2O' map to the same key.
// ---------------------------------------------------------------------------
export const getReactionKey = (a, b) => [a, b].sort().join('_');
