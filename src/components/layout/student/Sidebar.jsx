import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Microscope,
  BookOpen,
  ClipboardList,
  Target,
  Trophy,
  FlaskConical,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',   icon: LayoutDashboard, path: '/student/home', id: 'dashboard',    emoji: '🏠' },
  { name: 'Study Zone',  icon: BookOpen,         path: '/student/home', id: 'studyZone',    emoji: '📚' },
  { name: 'Virtual Lab', icon: Microscope,        path: '/student/home', id: 'labDashboard', emoji: '🧪' },
  { name: 'Quizzes',     icon: ClipboardList,     path: '/student/home', id: 'quizzes',      emoji: '❓' },
  { name: 'Missions',    icon: Target,            path: '/student/missions', id: 'missions', emoji: '🎯' },
  { name: 'Leaderboard', icon: Trophy,            path: '/student/leaderboard', id: 'leaderboard', emoji: '🏆' },
];

/* Colour accent per nav item for its active state */
const itemAccent = {
  dashboard:    { bg: 'bg-indigo-500',  border: 'border-b-indigo-700',  shadow: 'shadow-indigo-300/40'  },
  studyZone:    { bg: 'bg-sky-500',     border: 'border-b-sky-700',     shadow: 'shadow-sky-300/40'     },
  labDashboard: { bg: 'bg-purple-500',  border: 'border-b-purple-700',  shadow: 'shadow-purple-300/40'  },
  quizzes:      { bg: 'bg-emerald-500', border: 'border-b-emerald-700', shadow: 'shadow-emerald-300/40' },
  missions:     { bg: 'bg-orange-500',  border: 'border-b-orange-700',  shadow: 'shadow-orange-300/40'  },
  leaderboard:  { bg: 'bg-amber-500',   border: 'border-b-amber-700',   shadow: 'shadow-amber-300/40'   },
};

const Sidebar = ({ className = '', activeTab, setActiveTab }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleNavClick = (e, item) => {
    if (['dashboard', 'studyZone', 'labDashboard', 'quizzes'].includes(item.id)) {
      e.preventDefault();
      if (location.pathname !== '/student/home') navigate('/student/home');
      if (setActiveTab) setActiveTab(item.id);
    }
  };

  const handleLogoClick = () => {
    if (location.pathname !== '/student/home') navigate('/student/home');
    if (setActiveTab) setActiveTab('dashboard');
  };

  return (
    <aside className={`w-64 bg-slate-50 flex flex-col h-full border-r border-slate-200 ${className}`}>

      {/* ── Logo ── */}
      <button
        onClick={handleLogoClick}
        className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200/70 hover:bg-white transition-colors w-full text-left group"
      >
        <div className="p-1.5 bg-indigo-500 rounded-xl shadow-md shadow-indigo-300/50 group-hover:scale-110 transition-transform">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-slate-800">
          Chem<span className="text-indigo-500">Learn</span>
        </span>
        <Sparkles className="w-4 h-4 text-indigo-400 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1.5">
        {navItems.map((item) => {
          const isTabActive   = location.pathname === '/student/home' && activeTab === item.id;
          const isRouteActive = location.pathname === item.path && !['dashboard', 'studyZone', 'labDashboard', 'quizzes'].includes(item.id);
          const isActive      = isTabActive || isRouteActive;
          const accent        = itemAccent[item.id] ?? itemAccent.dashboard;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 select-none
                ${isActive
                  ? `${accent.bg} text-white font-black border-b-4 ${accent.border} shadow-md ${accent.shadow}`
                  : 'text-slate-500 font-bold hover:bg-white hover:text-slate-800 hover:-translate-y-0.5 hover:shadow-sm border-b-4 border-transparent'
                }
              `}
            >
              {/* Icon wrapper */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all
                ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}
              `}>
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              </div>

              <span className="flex-1">{item.name}</span>

              {/* Active indicator dot */}
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-white/60 shrink-0 animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom XP badge ── */}
      <div className="px-4 py-4 border-t border-slate-200/70">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-3 text-white shadow-md shadow-indigo-300/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">⚡ Your Progress</p>
          {/* XP bar */}
          <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-yellow-300 rounded-full" style={{ width: '82%' }}>
              <div className="h-full w-full bg-white/20 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between text-[11px] font-black">
            <span>2,450 XP</span>
            <span className="text-indigo-200">Lv.8 → 3,000</span>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
