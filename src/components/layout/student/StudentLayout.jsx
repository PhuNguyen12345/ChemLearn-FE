import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from '../shared/Footer';
import StudyZone from '../../../pages/student/StudyZone';
import QuizDashboard from '../../../pages/student/QuizDashboard';
import QuizPlayer from '../../../pages/student/QuizPlayer';
import LabDashboard from '../../../features/lab/components/LabDashboard';
import LabWorkspaceHeader from '../../../features/lab/components/LabWorkspaceHeader';
import VirtualLabPage from '../../../features/lab/VirtualLabPage'; 
import FireQuizGame from '../../FireQuizGame';
import StudentShop from '../../../pages/student/StudentShop';
import StudentIsland from '../../../pages/student/StudentIsland';

const STUDENT_HOME_TAB_KEY = 'chemlearn_student_home_tab';

const allowedHomeTabs = new Set([
  'dashboard',
  'studyZone',
  'quizzes',
  'quizPlayer',
  'labDashboard',
  'labWorkspace',
  'fireQuiz',
  'shop',
  'island',
]);

const readStoredHomeTab = () => {
  if (typeof window === 'undefined') return 'dashboard';

  const storedTab = localStorage.getItem(STUDENT_HOME_TAB_KEY);
  return storedTab && allowedHomeTabs.has(storedTab) ? storedTab : 'dashboard';
};

const StudentLayout = () => {
  const [activeTab, setActiveTab] = useState(readStoredHomeTab);
  const [activeLabId, setActiveLabId] = useState(null);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/student/home') {
      localStorage.setItem(STUDENT_HOME_TAB_KEY, activeTab);
    }
  }, [activeTab, location.pathname]);

  // If we're on the main student home route, we intercept to allow internal tabs
  const isHomeRoute = location.pathname === '/student/home';

  // HIDE SIDEBAR & HEADER for Lab Workspace
  if (isHomeRoute && activeTab === 'labWorkspace') {
    return (
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        <div className="absolute inset-0 z-50 flex flex-col bg-slate-50 h-full w-full">
          <LabWorkspaceHeader 
            onBack={() => { setActiveTab('labDashboard'); setActiveLabId(null); }} 
            titleText={activeLabId === 'new' ? 'Untitled Experiment' : 'My Saved Lab'} 
            labId={activeLabId}
          />
          <div className="flex-1 relative overflow-hidden">
            <VirtualLabPage />
          </div>
        </div>
      </div>
    );
  }

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
            {isHomeRoute ? (
              <>
                {activeTab === 'dashboard' && <Outlet context={{ setActiveTab }} />}
                {activeTab === 'studyZone' && <StudyZone />}
                {activeTab === 'quizzes' && (
                  <QuizDashboard 
                    onPlayQuiz={(id) => { 
                      setActiveQuizId(id); 
                      setActiveTab('quizPlayer'); 
                    }} 
                  />
                )}
                {activeTab === 'quizPlayer' && (
                  <QuizPlayer 
                    quizId={activeQuizId} 
                    onBack={() => setActiveTab('quizzes')} 
                  />
                )}
                {activeTab === 'labDashboard' && (
                  <LabDashboard 
                    onOpenLab={(id) => { 
                      setActiveLabId(id); 
                      setActiveTab('labWorkspace'); 
                    }} 
                  />
                )}
                {activeTab === 'fireQuiz' && (
                  <div className="absolute inset-0 z-50">
                    <FireQuizGame 
                      onBack={() => setActiveTab('dashboard')} 
                      onGoShop={() => setActiveTab('shop')}
                    />
                  </div>
                )}
                {activeTab === 'shop' && (
                  <div className="absolute inset-0 z-50 bg-[#1a1c29] flex flex-col">
                    <StudentShop onBack={() => setActiveTab('dashboard')} />
                  </div>
                )}
                {activeTab === 'island' && (
                  <div className="absolute inset-0 z-50 bg-black flex flex-col">
                    <StudentIsland onBack={() => setActiveTab('dashboard')} />
                  </div>
                )}
              </>
            ) : (
              <Outlet context={{ setActiveTab }} />
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default StudentLayout;
