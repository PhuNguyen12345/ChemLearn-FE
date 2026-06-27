// src/features/lab/data/labTasksMock.js

const task = (id, action, desc, points = 10) => ({
  id,
  action,
  desc,
  points,
  isCompleted: false,
});

const baseSetupTask = task(
  'task_1',
  'DRAG_FLASK_TO_WORKSPACE',
  'Kéo bình phản ứng ra khu vực thí nghiệm',
  10
);

export const LAB_TASKS_MOCK = {
  HYDROGEN_PREPARATION: [
    baseSetupTask,
    task('task_2', 'DRAG_HCL_TO_FLASK', 'Kéo dung dịch HCl vào bình phản ứng', 10),
    task('task_3', 'HCl_Zn (Rắn)', 'Kéo kẽm hạt (Zn) vào bình để điều chế khí Hidro', 30),
  ],
  WATER_PROPERTIES: [
    baseSetupTask,
    task('task_2', 'DRAG_H2O_TO_FLASK', 'Kéo nước (H2O) vào bình phản ứng', 10),
    task('task_3', 'H2O_Na (Rắn)', 'Kéo Natri (Na) vào bình để quan sát phản ứng với nước', 30),
    task('task_4', 'DRAG_PHENOLPHTHALEIN_TO_FLASK', 'Thêm Phenolphthalein để kiểm chứng dung dịch tạo thành có tính kiềm', 10),
  ],
  INDICATOR_CLASSIFICATION: [
    baseSetupTask,
    task('task_2', 'DRAG_HCL_TO_FLASK', 'Kéo dung dịch HCl vào bình để tạo môi trường axit', 10),
    task('task_3', 'DRAG_LITMUS PAPER_TO_FLASK', 'Thả giấy quỳ tím vào dung dịch axit để quan sát đổi màu', 15),
    task('task_4', 'DRAG_NAOH_TO_FLASK', 'Kéo dung dịch NaOH vào bình khác để tạo môi trường bazơ', 10),
    task('task_5', 'DRAG_PHENOLPHTHALEIN_TO_FLASK', 'Thêm Phenolphthalein vào dung dịch bazơ để quan sát màu hồng', 15),
  ],
  SOLUTION_EXCHANGE: [
    baseSetupTask,
    task('task_2', 'DRAG_AGNO3_TO_FLASK', 'Kéo dung dịch AgNO3 vào bình', 10),
    task('task_3', 'AgNO3_NaCl', 'Thêm NaCl để tạo kết tủa AgCl trắng', 20),
    task('task_4', 'DRAG_BACL2_TO_FLASK', 'Chuẩn bị bình khác với dung dịch BaCl2', 10),
    task('task_5', 'BaCl2_Na2SO4', 'Thêm Na2SO4 để tạo kết tủa BaSO4 trắng', 20),
  ],

  // Category fallbacks for older/mock lab records.
  KIM_LOAI: [
    baseSetupTask,
    task('task_2', 'DRAG_HCL_TO_FLASK', 'Kéo dung dịch HCl vào bình phản ứng', 10),
    task('task_3', 'HCl_Zn (Rắn)', 'Kéo kẽm hạt (Zn) vào bình để quan sát khí Hidro sinh ra', 30),
  ],
  GENERAL: [
    baseSetupTask,
    task('task_2', 'DRAG_H2O_TO_FLASK', 'Kéo nước (H2O) vào bình phản ứng', 10),
    task('task_3', 'H2O_Na (Rắn)', 'Kéo Natri (Na) vào bình phản ứng', 30),
  ],
  KET_TUA: [
    baseSetupTask,
    task('task_2', 'DRAG_BACL2_TO_FLASK', 'Kéo dung dịch BaCl2 vào bình', 10),
    task('task_3', 'BaCl2_Na2SO4', 'Kéo dung dịch Na2SO4 vào bình để tạo kết tủa', 30),
  ],
  AXIT_BAZO: [
    baseSetupTask,
    task('task_2', 'DRAG_NAOH_TO_FLASK', 'Kéo dung dịch NaOH vào bình', 10),
    task('task_3', 'HCl_NaOH', 'Kéo dung dịch HCl vào bình để trung hòa', 30),
  ],
};

const normalize = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const readConfig = (config) => {
  if (!config) return {};
  if (typeof config === 'object') return config;
  try {
    return JSON.parse(config);
  } catch {
    return {};
  }
};

export const getLabTasks = (lab = {}) => {
  const title = normalize(lab.title);
  const description = normalize(lab.description);
  const config = readConfig(lab.config);
  const labConfigurationConfig = readConfig(lab.labConfiguration?.config);
  const allowedChemicals =
    config.allowed_chemicals ||
    labConfigurationConfig.allowed_chemicals ||
    lab.allowedChemicals ||
    [];

  if (title.includes('hidro') || (allowedChemicals.includes('zn_grain') && allowedChemicals.includes('hcl'))) {
    return LAB_TASKS_MOCK.HYDROGEN_PREPARATION;
  }

  if (title.includes('nuoc') || (allowedChemicals.includes('sodium') && allowedChemicals.includes('water'))) {
    return LAB_TASKS_MOCK.WATER_PROPERTIES;
  }

  if (
    title.includes('chi thi') ||
    description.includes('quy tim') ||
    (allowedChemicals.includes('litmus_paper') && allowedChemicals.includes('phenolphthalein'))
  ) {
    return LAB_TASKS_MOCK.INDICATOR_CLASSIFICATION;
  }

  if (
    title.includes('trao doi') ||
    title.includes('ket tua') ||
    (allowedChemicals.includes('agno3') && allowedChemicals.includes('nacl')) ||
    (allowedChemicals.includes('bacl2') && allowedChemicals.includes('na2so4'))
  ) {
    return LAB_TASKS_MOCK.SOLUTION_EXCHANGE;
  }

  return LAB_TASKS_MOCK[lab.category] || [];
};
