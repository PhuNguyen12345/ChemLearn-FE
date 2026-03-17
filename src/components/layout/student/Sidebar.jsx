import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Microscope, BookOpen, ClipboardList, Target, Trophy, FlaskConical, LayoutDashboard } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/student/home', id: 'dashboard' },
  { name: 'Study Zone', icon: BookOpen, path: '/student/home', id: 'studyZone' },
  { name: 'Virtual Lab', icon: Microscope, path: '/student/home', id: 'labDashboard' },
  { name: 'Quizzes', icon: ClipboardList, path: '/student/home', id: 'quizzes' },
  { name: 'Missions', icon: Target, path: '/student/missions', id: 'missions' },
  { name: 'Leaderboard', icon: Trophy, path: '/student/leaderboard', id: 'leaderboard' },
];

const Sidebar = ({ className = '', activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, item) => {
    // If it's a tab-based item
    if (['dashboard', 'studyZone', 'labDashboard', 'quizzes'].includes(item.id)) {
      e.preventDefault();
      // Navigate to the main home route if we aren't there yet
      if (location.pathname !== '/student/home') {
        navigate('/student/home');
      }
      // Update local state to switch view
      if (setActiveTab) {
        setActiveTab(item.id);
      }
    }
  };

  const handleLogoClick = () => {
    if (location.pathname !== '/student/home') {
      navigate('/student/home');
    }
    if (setActiveTab) {
      setActiveTab('dashboard');
    }
  };

  return (
    <aside className={`w-64 border-r bg-background flex flex-col h-full ${className}`}>
      {/* Logo Area */}
      <button 
        onClick={handleLogoClick}
        className="h-16 flex items-center px-6 border-b border-border/50 hover:bg-slate-50 transition-colors w-full text-left"
      >
        <FlaskConical className="w-6 h-6 text-primary mr-2" />
        <span className="text-xl font-bold tracking-tight text-primary">ChemLearn</span>
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {navItems.map((item) => {
          // Determine if visually active
          const isTabActive = location.pathname === '/student/home' && activeTab === item.id;
          const isRouteActive = location.pathname === item.path && !['dashboard', 'studyZone', 'labDashboard', 'quizzes'].includes(item.id);
          const isActive = isTabActive || isRouteActive;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
