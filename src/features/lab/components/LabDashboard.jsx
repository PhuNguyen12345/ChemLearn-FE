import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Beaker, MoreVertical, Edit2, Trash, Copy, FlaskConical, Sparkles, Zap } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Mock data — each lab now has a `gradient` for its thumbnail
───────────────────────────────────────────────────────── */
const mockLabs = [
  {
    id: '1',
    title: 'Acid-Base Titration',
    lastEdited: '2 hours ago',
    gradient: 'from-teal-400 to-emerald-500',
    iconColor: 'text-emerald-100',
    tag: '🧪 Reactions',
  },
  {
    id: '2',
    title: 'Exothermic Reactions 101',
    lastEdited: 'Yesterday',
    gradient: 'from-orange-400 to-rose-500',
    iconColor: 'text-rose-100',
    tag: '🔥 Thermochemistry',
  },
  {
    id: '3',
    title: 'Properties of Metals',
    lastEdited: '3 days ago',
    gradient: 'from-sky-400 to-blue-600',
    iconColor: 'text-blue-100',
    tag: '⚗️ Materials',
  },
  {
    id: '4',
    title: 'My First Experiment',
    lastEdited: '1 week ago',
    gradient: 'from-violet-400 to-purple-600',
    iconColor: 'text-purple-100',
    tag: '🌟 Beginner',
  },
];

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
const LabDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const filteredLabs = mockLabs.filter((lab) =>
    lab.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

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
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <span className="text-white/80 text-sm font-black uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> My Lab Hub
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm mt-2">
            Your Experiments 🧪
          </h1>
          <p className="text-indigo-100 mt-1.5 font-semibold text-base max-w-lg">
            Create, manage, and revisit your virtual lab experiments. Earn XP for every discovery!
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
            <button
              onClick={() => navigate('/lab-workspace/new')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-black rounded-2xl border-b-4 border-emerald-700 hover:border-emerald-800 active:border-b active:translate-y-1 transition-all duration-150 shadow-lg shadow-emerald-500/30 shrink-0 text-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Lab
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STATS ROW
      ══════════════════════════════════════════════ */}
      <div className="px-4 md:px-6 mb-2 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border-2 border-indigo-100 border-b-[3px] border-b-indigo-300 rounded-2xl px-4 py-2 shadow-sm text-sm font-black text-indigo-600">
          <FlaskConical className="w-4 h-4" /> {filteredLabs.length} Experiments
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-emerald-100 border-b-[3px] border-b-emerald-300 rounded-2xl px-4 py-2 shadow-sm text-sm font-black text-emerald-600">
          <Zap className="w-4 h-4" /> +120 XP Earned
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          GRID
      ══════════════════════════════════════════════ */}
      <div className="px-4 md:px-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

          {/* ── CREATE NEW card ── */}
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

          {/* ── Existing Lab Cards ── */}
          {filteredLabs.map((lab) => (
            <div
              key={lab.id}
              onClick={() => navigate('/lab-workspace/' + lab.id)}
              className="group bg-white rounded-3xl border-2 border-slate-100 border-b-4 border-b-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-indigo-200 hover:border-b-indigo-300 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden relative"
            >
              {/* ── Gradient Thumbnail ── */}
              <div className={`w-full aspect-video bg-gradient-to-br ${lab.gradient} flex items-center justify-center relative overflow-hidden`}>
                {/* Inner gloss */}
                <div className="absolute inset-0 bg-white/10" />
                <div className="absolute inset-x-0 top-0 h-1/3 bg-white/10" />

                <Beaker
                  className={`w-14 h-14 ${lab.iconColor} relative z-10 drop-shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}
                  strokeWidth={1.5}
                />

                {/* Tag badge on thumbnail */}
                <span className="absolute bottom-2 left-2.5 text-[10px] font-black text-white bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
                  {lab.tag}
                </span>
              </div>

              {/* ── Card Details ── */}
              <div className="p-4 flex flex-col flex-1 relative">
                <h3 className="font-black text-slate-800 text-base truncate pr-8" title={lab.title}>
                  {lab.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  ✏️ Edited {lab.lastEdited}
                </p>

                {/* Open button that appears on hover */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="text-xs font-black text-indigo-500 flex items-center gap-1">
                    Open Lab <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
                  </div>
                </div>

                {/* ── Settings trigger ── */}
                <button
                  onClick={(e) => toggleMenu(e, lab.id)}
                  className="absolute right-3 top-3 p-1.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-all duration-150"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* ── Popover menu ── */}
                {activeMenuId === lab.id && (
                  <div className="absolute right-3 top-10 bg-white border border-slate-100 shadow-2xl rounded-2xl flex flex-col py-2 z-20 w-40 overflow-hidden">
                    <button
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 text-left w-full transition-colors"
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      Rename
                    </button>
                    <button
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-700 text-left w-full transition-colors"
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
                        <Copy className="w-3.5 h-3.5 text-sky-600" />
                      </div>
                      Duplicate
                    </button>
                    <div className="mx-3 border-t border-slate-100 my-1" />
                    <button
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 text-left w-full transition-colors"
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
                        <Trash className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      Delete
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}

        </div>

        {/* Empty state */}
        {filteredLabs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>🔍</div>
            <h3 className="font-black text-slate-700 text-xl mb-2">No experiments found</h3>
            <p className="text-slate-400 font-semibold text-sm">Try a different search term, or create a new experiment!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default LabDashboard;
