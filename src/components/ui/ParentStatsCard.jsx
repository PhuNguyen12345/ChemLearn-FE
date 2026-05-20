import { motion } from 'framer-motion';

export const ParentStatsCard = ({ title, value, subtitle, icon: Icon, isLoading, colorClass = 'text-blue-500', bgClass = 'bg-blue-500/10' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        {isLoading ? (
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        ) : (
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
        )}
        {subtitle && !isLoading && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};
