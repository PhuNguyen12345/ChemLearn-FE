import React from 'react';
import { motion } from 'framer-motion';

export const GamificationGrid = ({ level }) => {
  // Generate 12 empty slots for future assets
  const slots = Array.from({ length: 12 });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Elemental Archipelago</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bộ sưu tập nguyên tố hóa học của con
          </p>
        </div>
        <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400 font-bold">
          Level {level || 1}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {slots.map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-colors"
          >
            {/* Future image assets will be placed here */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
