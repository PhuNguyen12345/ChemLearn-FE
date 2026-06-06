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
      equation: '2Na + 2H₂O → 2NaOH + H₂↑',
      condition: 'Tỏa nhiệt',
      description: 'Phản ứng cháy nổ sinh khí Hydro.',
    },
  },

  // 2. KMnO4 (solid) + H2O  →  Purple Solution
  'H2O_KMnO4 (Rắn)': {
    liquidContent: 'KMnO4',
    liquidColor: '#AC26EF',
    reactionInfo: {
      equation: 'KMnO₄ + H₂O → Purple Solution',
      condition: 'Phân tán',
      description: 'Thuốc tím (KMnO4) hòa tan tạo thành dung dịch màu tím đậm.',
    },
  },

  // 3. KMnO4 (templateId) dissolving into H2O
  'H2O_kmno4_template': {
    liquidContent: 'KMnO4',
    liquidColor: '#AC26EF',
    reactionInfo: {
      equation: 'KMnO₄ + H₂O → Purple Solution',
      condition: 'Phân tán',
      description: 'Thuốc tím (KMnO4) hòa tan tạo thành dung dịch màu tím đậm.',
    },
  },

  // 4. AgNO3 + NaCl  →  AgCl↓ + NaNO₃
  'AgNO3_NaCl': {
    liquidContent: 'NaNO₃',
    solidContent: 'AgCl↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
      condition: 'Kết tủa trắng',
      description: 'Tạo thành kết tủa trắng Bạc Clorua.',
    },
  },

  // 5. AgNO3 + HCl  →  AgCl↓ + HNO₃
  'AgNO3_HCl': {
    liquidContent: 'HNO₃',
    solidContent: 'AgCl↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'AgNO₃ + HCl → AgCl↓ + HNO₃',
      condition: 'Kết tủa trắng',
      description: 'Bạc Clorua kết tủa ngay lập tức.',
    },
  },

  // 6. BaCl2 + Na2SO4  →  BaSO₄↓ + 2NaCl
  'BaCl2_Na2SO4': {
    liquidContent: '2NaCl',
    solidContent: 'BaSO₄↓',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    precipitateColor: 'rgba(255, 255, 255, 0.9)',
    reactionState: 'precipitation',
    reactionInfo: {
      equation: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl',
      condition: 'Kết tủa trắng',
      description: 'Bari Sunfat kết tủa trắng không tan trong axit.',
    },
  },

  // 7. Fe (Rắn) + CuSO4  →  FeSO₄ (liquid) + Cu (copper precipitate deposit)
  'CuSO4_Fe (Rắn)': {
    liquidContent: 'FeSO₄',
    solidContent: 'Cu',
    liquidColor: 'rgba(187, 247, 208, 0.7)',
    precipitateColor: 'rgba(180, 83, 9, 0.8)',
    reactionInfo: {
      equation: 'Fe + CuSO₄ → FeSO₄ + Cu↓',
      condition: 'Nhiệt độ thường',
      description: 'Sắt đẩy đồng ra khỏi dung dịch, đồng bám vào thanh sắt.',
    },
  },

  // 8. H2C2O4 + KMnO4  →  Mn²⁺ (Colorless) — color fades to near-transparent
  'H2C2O4_KMnO4': {
    liquidContent: 'Mn²⁺',
    liquidColor: 'rgba(200, 230, 255, 0.15)',
    reactionInfo: {
      equation: '2KMnO₄ + 5H₂C₂O₄ + 3H₂SO₄ → 2MnSO₄ + 10CO₂↑ + 8H₂O',
      condition: 'Mất màu tím',
      description: 'Axit oxalic khử KMnO4 tím thành Mn²⁺ không màu.',
    },
  },

  // 9. Na2CO3 + HCl  →  NaCl + CO₂↑ + H₂O  (violent, CO₂ gas label, clears after 3 s)
  'HCl_Na2CO3': {
    liquidContent: 'NaCl + H₂O',
    gasContent: 'CO₂',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionState: 'violent',
    clearStateAfter: 3000,
    reactionInfo: {
      equation: 'Na₂CO₃ + 2HCl → 2NaCl + CO₂↑ + H₂O',
      condition: 'Sủi bọt mạnh',
      description: 'Natri Cacbonat phản ứng với axit clohidric giải phóng CO₂.',
    },
  },

  // 10. Zn (solid/grain) + HCl  →  ZnCl₂ (liquid) + H₂↑ (gas label, clears after 3 s)
  'HCl_Zn (Rắn)': {
    liquidContent: 'ZnCl₂',
    gasContent: 'H₂',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionState: 'bubbling',
    clearStateAfter: 3000,
    reactionInfo: {
      equation: 'Zn + 2HCl → ZnCl₂ + H₂↑',
      condition: 'Sủi bọt',
      description: 'Kẽm hòa tan trong axit clohidric tạo khí Hydro.',
    },
  },

  // 11. NaOH + HCl  →  NaCl + H₂O
  'HCl_NaOH': {
    liquidContent: 'NaCl + H₂O',
    liquidColor: 'rgba(200, 230, 255, 0.7)',
    reactionInfo: {
      equation: 'NaOH + HCl → NaCl + H₂O',
      condition: 'Trung hòa',
      description: 'Phản ứng trung hòa giữa bazơ và axit tạo muối và nước.',
    },
  },

  // 12. CaO + H2O  →  Ca(OH)₂ (exothermic)
  'CaO (Rắn)_H2O': {
    liquidContent: 'Ca(OH)₂',
    liquidColor: 'rgba(255, 255, 255, 0.8)',
    reactionState: 'exothermic',
    reactionInfo: {
      equation: 'CaO + H₂O → Ca(OH)₂',
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
