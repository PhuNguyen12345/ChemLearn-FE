import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LineChart, Activity, BellRing, FlaskConical, LayoutDashboard } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/parent/dashboard', id: 'dashboard' },
  { name: 'Child Progress', icon: LineChart, path: '/parent/dashboard', id: 'progress' },
  { name: 'Activity Log', icon: Activity, path: '/parent/activity', id: 'activity' },
  { name: 'Alerts', icon: BellRing, path: '/parent/alerts', id: 'alerts' },
];

const Sidebar = ({ className = '', activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, item) => {
    // If it's a tab-based item and we are on the dashboard route...
    if ((item.id === 'dashboard' || item.id === 'progress')) {
      e.preventDefault();
      // Navigate to dashboard route if not already there
      if (location.pathname !== '/parent/dashboard') {
        navigate('/parent/dashboard');
      }
      // Trigger the state update
      if (setActiveTab) {
        setActiveTab(item.id);
      }
    }
    // Otherwise let standard NavLink route handling take over
  };

  return (
    <aside className={`w-64 border-r bg-background flex flex-col h-full ${className}`}>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <FlaskConical className="w-6 h-6 text-primary mr-2" />
        <span className="text-xl font-bold tracking-tight text-primary">ChemLearn Portal</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {navItems.map((item) => {
          // Check if it's visually active
          const isTabActive = location.pathname === '/parent/dashboard' && activeTab === item.id;
          const isRouteActive = location.pathname === item.path && item.id !== 'dashboard' && item.id !== 'progress';
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
