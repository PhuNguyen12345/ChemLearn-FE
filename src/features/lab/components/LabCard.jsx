import React from 'react';
import { Beaker, MoreVertical, Edit2, Trash, Copy, CheckCircle2, Clock, CircleDashed, Info } from 'lucide-react';
import { LAB_THEMES } from '../data/theme';
import { formatRelativeTime } from '../../../lib/utils';

const LabCard = ({
  lab,
  isMenuOpen,
  onToggleMenu,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  onViewDetails
}) => {
  
  const themeKey = lab.category || lab.type;
  const theme = LAB_THEMES[themeKey] || LAB_THEMES.DEFAULT;
  const ThemeIcon = theme.Icon || Beaker;

  // Helper to render Difficulty Badge
  const renderDifficultyBadge = () => {
    if (!lab.difficulty) return null;
    
    let colorClass = "";
    let label = "";
    
    switch (lab.difficulty) {
      case 'EASY':
        colorClass = "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20";
        label = "EASY";
        break;
      case 'MEDIUM':
        colorClass = "bg-amber-500 text-white border-amber-400 shadow-amber-500/20";
        label = "MEDIUM";
        break;
      case 'HARD':
        colorClass = "bg-rose-500 text-white border-rose-400 shadow-rose-500/20";
        label = "HARD";
        break;
      default:
        return null;
    }
    
    return (
      <div className={`flex items-center px-2.5 py-0.5 border rounded-lg text-[10px] font-black absolute top-3 left-3 shadow-md z-10 ${colorClass}`}>
        {label}
      </div>
    );
  };

  // Helper to render Status Badge for Assignments
  const renderStatusBadge = () => {
    if (lab.type !== 'ASSIGNMENT') return null;
    
    if (lab.status === 'UNCOMPLETED') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50/90 backdrop-blur-sm border border-rose-100 text-rose-600 rounded-lg text-xs font-bold absolute top-3 right-3 shadow-sm z-10">
          <CircleDashed className="w-3.5 h-3.5" /> Not Started
        </div>
      );
    } else if (lab.status === 'IN_PROGRESS') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/90 backdrop-blur-sm border border-amber-100 text-amber-600 rounded-lg text-xs font-bold absolute top-3 right-3 shadow-sm z-10">
          <Clock className="w-3.5 h-3.5" /> In Progress
        </div>
      );
    } else if (lab.status === 'SUBMITTED') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/90 backdrop-blur-sm border border-emerald-100 text-emerald-600 rounded-lg text-xs font-bold absolute top-3 right-3 shadow-sm z-10">
          <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
        </div>
      );
    }
    return null;
  };

  // Helper to render progress bar at the bottom of the Card
  const renderProgressBar = () => {
    if (lab.type !== 'ASSIGNMENT' || lab.status !== 'IN_PROGRESS') return null;
    const percentage = (lab.progress / lab.max_score) * 100;
    return (
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 z-10 rounded-b-[22px] overflow-hidden">
        <div 
          className="h-full bg-amber-400 transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div
      onClick={onOpen}
      className={`group bg-white rounded-3xl border-2 border-slate-100 border-b-4 border-b-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-indigo-200 hover:border-b-indigo-300 transition-all duration-300 cursor-pointer flex flex-col relative ${isMenuOpen ? 'z-50' : 'z-10'}`}
    >
      {/* ── Gradient Thumbnail ── */}
      <div className={`w-full aspect-video rounded-t-[22px] bg-gradient-to-br ${theme.gradient} flex items-center justify-center relative overflow-hidden`}>
        {/* Inner gloss */}
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute inset-x-0 top-0 h-1/3 bg-white/10" />

        <ThemeIcon
          className={`w-14 h-14 ${theme.iconColor} relative z-10 drop-shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}
          strokeWidth={1.5}
        />

        {/* Tag badge on thumbnail */}
        <span className="absolute bottom-2 left-2.5 text-[13px] font-black text-white bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 z-10">
          {theme.tag}
        </span>

        {/* Difficulty Badge */}
        {renderDifficultyBadge()}

        {/* Status Badge (For Assignments) */}
        {renderStatusBadge()}
      </div>

      {/* ── Card Details ── */}
      <div className="p-4 flex flex-col flex-1 relative">
        <h3 className="font-black text-slate-800 text-base truncate pr-8" title={lab.title}>
          {lab.title}
        </h3>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          ✏️ {formatRelativeTime(lab.updatedAt)}
        </p>

        {/* Open button that appears on hover */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="text-xs font-black text-indigo-500 flex items-center gap-1">
            Open Lab <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
          </div>
        </div>

        {/* ── Settings trigger ── */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
          className="absolute right-3 top-3 p-1.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-all duration-150 z-20"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* ── Popover menu ── */}
        {isMenuOpen && (
          <div className="absolute right-3 top-10 bg-white border border-slate-100 shadow-2xl rounded-2xl flex flex-col py-2 z-30 w-40 overflow-hidden">
            <button
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-700 text-left w-full transition-colors"
              onClick={(e) => { e.stopPropagation(); onToggleMenu(); onViewDetails && onViewDetails(); }}
            >
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                <Info className="w-3.5 h-3.5 text-slate-600" />
              </div>
              Chi tiết
            </button>
            <button
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 text-left w-full transition-colors"
              onClick={(e) => { e.stopPropagation(); onToggleMenu(); onRename(); }}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              Rename
            </button>
            <button
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-700 text-left w-full transition-colors"
              onClick={(e) => { e.stopPropagation(); onToggleMenu(); onDuplicate(); }}
            >
              <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
                <Copy className="w-3.5 h-3.5 text-sky-600" />
              </div>
              Duplicate
            </button>
            <div className="mx-3 border-t border-slate-100 my-1" />
            <button
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 text-left w-full transition-colors"
              onClick={(e) => { e.stopPropagation(); onToggleMenu(); onDelete(); }}
            >
              <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
                <Trash className="w-3.5 h-3.5 text-rose-600" />
              </div>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar at the bottom of the card (If Assignment is IN_PROGRESS) */}
      {renderProgressBar()}

    </div>
  );
};

export default LabCard;
