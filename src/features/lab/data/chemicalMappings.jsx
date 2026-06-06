import React from 'react';
import { Beaker, Box, Cloud, Droplet, Flame, Globe } from 'lucide-react';

// ---------------------------------------------------------------------------
// templateId → the string that is placed as the initial container content
// when dropping a solid/chemical with no reaction target.
// Also used to map the templateId to the canonical content name before
// looking up reactions.
// ---------------------------------------------------------------------------
export const TEMPLATE_TO_CONTENT = {
  water: 'H2O',
  kmno4: 'KMnO4 (Rắn)',
  sodium: 'Na (Rắn)',
  agno3: 'AgNO3',
  nacl: 'NaCl',
  bacl2: 'BaCl2',
  na2so4: 'Na2SO4',
  fe_powder: 'Fe (Rắn)',
  cuso4: 'CuSO4',
  h2c2o4: 'H2C2O4',
  na2co3: 'Na2CO3',
  hcl: 'HCl',
  zn_grain: 'Zn (Rắn)',
  cao: 'CaO (Rắn)',
  naoh_sol: 'NaOH',
  phenolphthalein: 'Phenolphthalein',
  litmus_paper: 'Litmus Paper',
};

// Liquid colors shown when a chemical is deposited into an EMPTY container.
export const EMPTY_DROP_LIQUID_COLOR = {
  water: 'rgba(96, 165, 250, 0.6)',
  agno3: 'rgba(200, 230, 255, 0.7)',
  nacl: 'rgba(200, 230, 255, 0.7)',
  bacl2: 'rgba(200, 230, 255, 0.7)',
  na2so4: 'rgba(200, 230, 255, 0.7)',
  cuso4: 'rgba(37, 99, 235, 0.6)',
  h2c2o4: 'rgba(200, 230, 255, 0.7)',
  na2co3: 'rgba(200, 230, 255, 0.7)',
  hcl: 'rgba(200, 230, 255, 0.7)',
  naoh_sol: 'rgba(200, 230, 255, 0.7)',
};

export const FILTER_TABS = [
  { id: 'ALL', label: 'Tất cả', icon: <Globe className="w-7 h-7" /> },
  { id: 'CONTAINER', label: 'Bình phản ứng', icon: <Beaker className="w-7 h-7" /> },
  { id: 'EQUIPMENT', label: 'Thiết bị', icon: <Flame className="w-7 h-7" /> },
  { id: 'LIQUID', label: 'Chất lỏng', icon: <Droplet className="w-7 h-7" /> },
  { id: 'SOLID', label: 'Chất rắn', icon: <Box className="w-7 h-7" /> },
  { id: 'GAS', label: 'Chất khí', icon: <Cloud className="w-7 h-7" /> },
];
