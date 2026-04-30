import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, Plus, FlaskConical, Sparkles, Compass, ClipboardList
} from 'lucide-react';

import { useLabData } from '../hooks/useLabData';
import LabCard from './LabCard';
import { LAB_THEMES } from '../data/theme';

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
const LabDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedLabDetails, setSelectedLabDetails] = useState(null);
  
  // Default to Discovery tab
  const [activeTab, setActiveTab] = useState('PREMADE');

  // Custom hook for logic
  const { filteredLabs, tabCounts, hasUncompletedAssignment } = useLabData(activeTab, searchQuery);

  // Object Map to manage header content
  const bannerContent = {
    PREMADE: {
      icon: <Compass className="w-6 h-6 text-white" />,
      title: "Discovery Labs 🧭",
      desc: "Learn from standard laboratory experiments, pre-designed to help you get acquainted."
    },
    SANDBOX: {
      icon: <Sparkles className="w-6 h-6 text-white" />,
      title: "Your Experiments ✨",
      desc: "Create and formulate freely without limits. Record every new discovery!"
    },
    ASSIGNMENT: {
      icon: <ClipboardList className="w-6 h-6 text-white" />,
      title: "Assignments 📝",
      desc: "Complete assigned tasks to accumulate EXP and unlock achievements."
    }
  };

  const currentBanner = bannerContent[activeTab];

  /* Close any open menu when clicking elsewhere */
  const handleWrapperClick = () => {
    if (activeMenuId) setActiveMenuId(null);
  };

  return (
    <div
      className="flex flex-col min-h-full w-full bg-slate-50 overflow-y-auto"
      onClick={handleWrapperClick}
    >

      {/* ══════════════════════════════════════════════
          BANNER HEADER
      ══════════════════════════════════════════════ */}
      <div className="m-4 md:m-6 rounded-[2rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-7 md:p-10 relative overflow-hidden shadow-2xl shadow-purple-400/30">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-44 h-44 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Floating emojis */}
        <div className="absolute top-5 right-24 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>⚗️</div>
        <div className="absolute top-8 right-10 text-2xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🔬</div>
        <div className="absolute bottom-5 right-16 text-xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🧬</div>

        <div className="relative z-10">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300">
              {currentBanner.icon}
            </div>
            <span className="text-white/80 text-sm font-black uppercase tracking-widest flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5 text-yellow-300" /> ChemLearn
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm mt-2 transition-all duration-300">
            {currentBanner.title}
          </h1>
          <p className="text-indigo-100 mt-1.5 font-semibold text-base max-w-lg transition-all duration-300">
            {currentBanner.desc}
          </p>

          {/* Search + Create button row */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Floating search bar */}
            <div className="relative flex-grow sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl shadow-xl shadow-black/10 border-none focus:outline-none focus:ring-4 focus:ring-white/40 font-semibold text-slate-700 placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* Create button — Emerald tactile */}
            <div className={`transition-all duration-300 ${activeTab === 'SANDBOX' ? 'opacity-100 scale-100 w-auto' : 'opacity-0 scale-95 w-0 overflow-hidden absolute pointer-events-none'}`}>
              <button
                onClick={() => navigate('/lab-workspace/new')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-black rounded-2xl border-b-4 border-emerald-700 hover:border-emerald-800 active:border-b active:translate-y-1 shadow-lg shadow-emerald-500/30 shrink-0 text-sm whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Create New Lab
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TABS NAVIGATION
      ══════════════════════════════════════════════ */}
      <div className="px-4 md:px-6 mb-6 flex flex-wrap gap-3">
        {/* Tab: Discovery */}
        <button
          onClick={() => setActiveTab('PREMADE')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 ${
            activeTab === 'PREMADE'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-2 border-indigo-600 translate-y-[-2px]'
              : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          <Compass className="w-4 h-4" /> Discovery ({tabCounts.premade})
        </button>

        {/* Tab: Sandbox */}
        <button
          onClick={() => setActiveTab('SANDBOX')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 ${
            activeTab === 'SANDBOX'
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30 border-2 border-pink-500 translate-y-[-2px]'
              : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Your Experiment ({tabCounts.sandbox})
        </button>

        {/* Tab: Assignments */}
        <button
          onClick={() => setActiveTab('ASSIGNMENT')}
          className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 ${
            activeTab === 'ASSIGNMENT'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 border-2 border-rose-500 translate-y-[-2px]'
              : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Assignments ({tabCounts.assignment})
          {hasUncompletedAssignment && (
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          GRID
      ══════════════════════════════════════════════ */}
      <div className="px-4 md:px-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

          {/* ── CREATE NEW card (Only show when in SANDBOX tab) ── */}
          {activeTab === 'SANDBOX' && (
            <div
              onClick={() => navigate('/lab-workspace/new')}
              className="group bg-indigo-50 rounded-3xl border-4 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-100/70 hover:-translate-y-2 hover:shadow-[0_10px_28px_rgba(99,102,241,0.3)] transition-all duration-300 flex flex-col items-center justify-center p-8 cursor-pointer aspect-[4/3] min-h-[200px]"
            >
              <div className="w-20 h-20 rounded-3xl bg-indigo-200 group-hover:bg-indigo-300 flex items-center justify-center mb-4 transition-all duration-300 shadow-inner shadow-indigo-300/50 group-hover:scale-110 group-hover:rotate-3">
                <Plus className="w-10 h-10 text-indigo-600 group-hover:text-indigo-700" />
              </div>
              <h3 className="font-black text-indigo-600 group-hover:text-indigo-700 text-base text-center">
                New Experiment
              </h3>
              <p className="text-indigo-400 text-xs font-semibold mt-1 text-center">Start from scratch</p>
            </div>
          )}

          {/* ── Existing Lab Cards ── */}
          {filteredLabs.map((lab) => (
            <LabCard
              key={lab.id}
              lab={lab}
              isMenuOpen={activeMenuId === lab.id}
              onToggleMenu={() => setActiveMenuId(activeMenuId === lab.id ? null : lab.id)}
              onOpen={() => navigate('/lab-workspace/' + lab.id)}
              onViewDetails={() => setSelectedLabDetails(lab)}
              onRename={() => toast.info('Feature coming in the next update!')}
              onDuplicate={() => toast.info('Feature coming in the next update!')}
              onDelete={() => toast.error('Delete feature temporarily locked to protect core data.')}
            />
          ))}

        </div>

        {/* Empty state */}
        {filteredLabs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>🔍</div>
            <h3 className="font-black text-slate-700 text-xl mb-2">No experiments found</h3>
            <p className="text-slate-400 font-semibold text-sm">
              {activeTab === 'SANDBOX' 
                ? 'Try searching with different keywords, or create a new experiment!'
                : 'Try searching with different keywords, there seem to be no tasks here.'}
            </p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          DETAILS MODAL
      ══════════════════════════════════════════════ */}
      {selectedLabDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedLabDetails(null)}>
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Header: Gradient Banner */}
            <div className={`w-full h-32 bg-gradient-to-br ${(LAB_THEMES[selectedLabDetails.category] || LAB_THEMES[selectedLabDetails.type] || LAB_THEMES.DEFAULT).gradient} relative flex items-center justify-center`}>
               <div className="absolute inset-0 bg-white/10" />
               <h2 className="relative z-10 text-2xl font-black text-white drop-shadow-md px-6 text-center">{selectedLabDetails.title}</h2>
               {/* Close button */}
               <button 
                 onClick={() => setSelectedLabDetails(null)}
                 className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-20"
               >
                 ✕
               </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 flex flex-col gap-5">
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100">
                  {(LAB_THEMES[selectedLabDetails.category] || LAB_THEMES[selectedLabDetails.type] || LAB_THEMES.DEFAULT).tag}
                </span>
                {selectedLabDetails.difficulty && (
                   <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                     selectedLabDetails.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                     selectedLabDetails.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                     'bg-rose-50 text-rose-600 border-rose-100'
                   }`}>
                     Độ khó: {selectedLabDetails.difficulty}
                   </span>
                )}
                {selectedLabDetails.max_score && (
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                    Max Score: {selectedLabDetails.max_score} EXP
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Mô tả bài thực hành:</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedLabDetails.description || 'Chưa có thông tin mô tả chi tiết cho bài lab này.'}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  navigate('/lab-workspace/' + selectedLabDetails.id);
                  setSelectedLabDetails(null);
                }}
                className="mt-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
              >
                Vào phòng thí nghiệm ngay 🚀
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LabDashboard;
