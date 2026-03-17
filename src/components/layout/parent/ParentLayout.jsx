import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from '../shared/Footer';
import ParentDashboard from '../../../pages/parent/ParentDashboard';
import ChildProgress from '../../../pages/parent/ChildProgress';

const ParentLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  
  // If the user is exactly on the dashboard route configured in App.jsx, 
  // we can use our conditional rendering override. Otherwise, let Outlet handle other routes.
  const isDashboardRoute = location.pathname === '/parent/dashboard';

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Fixed Sidebar on Desktop */}
      <div className="hidden md:block h-full flex-shrink-0 z-20">
        <Sidebar 
          className="h-full border-r border-border" 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        <Header />
        
        {/* Router Outlet content scrolls */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full bg-muted/30">
          <div className="p-4 md:p-6 lg:p-8 mx-auto max-w-7xl w-full h-full min-h-[calc(100vh-8rem)]">
            {isDashboardRoute ? (
              <>
                {activeTab === 'dashboard' && <ParentDashboard />}
                {activeTab === 'progress' && <ChildProgress />}
              </>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default ParentLayout;
