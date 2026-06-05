import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from '../shared/Footer';
import { BiMascotProvider } from '../../student/mascot/BiMascot';

const StudentLayout = () => {
  const { pathname } = useLocation();
  const isStudentHome = pathname === '/student/home' || pathname === '/student';

  return (
    <BiMascotProvider>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        {/* Fixed Sidebar on Desktop */}
        <div className="hidden md:block h-full flex-shrink-0 z-20">
          <Sidebar className="h-full border-r border-border" />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          <Header />

          {/* Router Outlet content scrolls */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full bg-muted/30 flex flex-col">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 mx-auto max-w-7xl w-full flex flex-col flex-1 min-h-[calc(100vh-8rem)] relative">
              <Outlet />
            </div>
          </main>

          {isStudentHome && <Footer />}
        </div>
      </div>
    </BiMascotProvider>
  );
};

export default StudentLayout;
