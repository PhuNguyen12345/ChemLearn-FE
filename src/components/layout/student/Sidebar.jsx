import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Microscope,
  BookOpen,
  Target,
  Trophy,
  FlaskConical,
  LayoutDashboard,
  Users,
  Sparkles,
  Map,
  Swords,
  ChevronLeft,
  ClipboardList
} from 'lucide-react';
import { useStudentStore } from '../../../stores/useStudentStore';
import { useSidebarStore } from '../../../stores/useSidebarStore';

const navItems = [
  { name: 'Dashboard',   icon: LayoutDashboard, path: '/student/home', id: 'dashboard', emoji: '🏠' },
  { name: 'Progress Map',icon: Map,             path: '/student/home', id: 'progressMap', emoji: '🗺️' },
  { name: 'Study Zone',  icon: BookOpen,        path: '/student/home', id: 'studyZone', emoji: '📚' },
  { name: 'Virtual Lab', icon: Microscope,      path: '/student/home', id: 'labDashboard', emoji: '🧪' },
  { name: 'Missions',    icon: Target,          path: '/student/missions', id: 'missions', emoji: '🎯' },
  { name: 'Quizzes',     icon: ClipboardList,   path: '/student/quiz', id: 'quizzes', emoji: '❓' },
  { name: 'PVP Battle',  icon: Swords,          path: '/student/pvp', id: 'pvp', emoji: '⚔️' },
  { name: 'Leaderboard', icon: Trophy,          path: '/student/leaderboard', id: 'leaderboard', emoji: '🏆' },
  { name: 'Classes',     icon: Users,           path: '/student/classes', id: 'classes', emoji: '👥' },
];

/* Colour accent per nav item for its active state */
const itemAccent = {
  dashboard: { bg: 'bg-indigo-500', border: 'border-b-indigo-700', shadow: 'shadow-indigo-300/40' },
  progressMap: { bg: 'bg-cyan-500', border: 'border-b-cyan-700', shadow: 'shadow-cyan-300/40' },
  studyZone: { bg: 'bg-sky-500', border: 'border-b-sky-700', shadow: 'shadow-sky-300/40' },
  labDashboard: { bg: 'bg-purple-500', border: 'border-b-purple-700', shadow: 'shadow-purple-300/40' },
  missions: { bg: 'bg-orange-500', border: 'border-b-orange-700', shadow: 'shadow-orange-300/40' },
  leaderboard: { bg: 'bg-amber-500', border: 'border-b-amber-700', shadow: 'shadow-amber-300/40' },
  profile: { bg: 'bg-pink-500', border: 'border-b-pink-700', shadow: 'shadow-pink-300/40' },
  pvp: { bg: 'bg-rose-600', border: 'border-b-rose-800', shadow: 'shadow-rose-300/40' },
  classes: { bg: 'bg-indigo-600', border: 'border-b-indigo-800', shadow: 'shadow-indigo-300/40' },
};

const Sidebar = ({ className = '', activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { experience, level } = useStudentStore();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  const homeTabIds = ['dashboard', 'studyZone', 'labDashboard', 'profile', 'progressMap', 'pvp'];

  const handleNavClick = (e, item) => {
    if (homeTabIds.includes(item.id)) {
      e.preventDefault();
      if (location.pathname !== '/student/home') navigate('/student/home');
      if (setActiveTab) setActiveTab(item.id);
    }
  };

  const handleLogoClick = () => {
    navigate('/student/home');
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-50 flex flex-col h-full border-r border-slate-200 transition-all duration-300 relative overflow-visible ${className}`}>

      {/* ── Logo ── */}
      <button
        onClick={handleLogoClick}
        className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200/70 hover:bg-white transition-colors w-full text-left group"
      >
        <div className="p-1.5 bg-indigo-500 rounded-xl shadow-md shadow-indigo-300/50 group-hover:scale-110 transition-transform shrink-0">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>

        {!isCollapsed && (
          <>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Chem<span className="text-indigo-500">Learn</span>
            </span>
          </>
        )}

      </button>

      {/* Collapse/Expand Button */}
      <button
        onClick={toggleSidebar}
        className={`absolute z-30 p-1 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-200 ${isCollapsed ? '-right-3 top-[5.75rem]' : 'right-3 top-5'}`}
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <ChevronLeft className={`w-5 h-5 text-slate-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1.5">
        {navItems.map((item) => {
          const isTabActive = location.pathname === '/student/home' && activeTab === item.id;
          const isRouteActive = location.pathname === item.path && !['dashboard', 'studyZone', 'labDashboard', 'quizzes', "classes"].includes(item.id);
          const isActive = isTabActive || isRouteActive;
          const accent = itemAccent[item.id] ?? itemAccent.dashboard;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 select-none
                ${isCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? `${accent.bg} text-white font-black border-b-4 ${accent.border} shadow-md ${accent.shadow}`
                  : 'text-slate-500 font-bold hover:bg-white hover:text-slate-800 hover:-translate-y-0.5 hover:shadow-sm border-b-4 border-transparent'
                }
              `}
              title={isCollapsed ? item.name : ''}
            >
              {/* Icon wrapper */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all
                ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}
              `}>
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              </div>

              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white/60 shrink-0 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom XP badge ── */}
      <div className="px-4 py-4 border-t border-slate-200/70">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-3 text-white shadow-md shadow-indigo-300/30">
          {!isCollapsed && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">⚡ Your Progress</p>
              {/* XP bar */}
              <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-yellow-300 rounded-full" style={{ width: `${(experience % 1000) / 10}%` }}>
                  <div className="h-full w-full bg-white/20 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-black">
                <span>{experience.toLocaleString()} XP</span>
                <span className="text-indigo-200">Lv.{level + 1} → {level * 1000}</span>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center text-lg">⚡</div>
          )}
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
