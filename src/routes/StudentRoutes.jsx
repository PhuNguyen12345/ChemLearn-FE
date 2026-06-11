import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import StudentLayout from "../components/layout/student/StudentLayout";
import NotFoundPage from "../pages/shared/NotFoundPage";
import Payments from "../pages/student/Payments";
import StudentHome from "../pages/student/StudentHome";
import Missions from "../pages/student/Missions";
import Leaderboard from "../pages/student/Leaderboard";
import StudyZone from "../pages/student/StudyZone";
import LabDashboard from "../features/lab/components/LabDashboard";
import ClassesLanding from "../pages/student/ClassesLanding";
import ClassDetail from "../pages/student/ClassDetail";
import ClassMaterialPage from "../pages/student/ClassMaterialPage";
import QuizTakingPage from "../pages/student/QuizTakingPage";
import FireQuizGame from "../components/FireQuizGame";
import StudentShop from "../pages/student/StudentShop";
import StudentIsland from "../pages/student/StudentIsland";
import StudentProfile from "../pages/student/StudentProfile";
import ProgressMap from "../pages/student/ProgressMap";
import PvpLobbyPage from "../pages/student/pvp/PvpLobbyPage";

export default function StudentRoutes() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<StudentHome />} />
        <Route path="subscriptions" element={<Payments />} />
        <Route path="payments" element={<Navigate to="/student/subscriptions" replace />} />
        <Route path="missions" element={<Missions />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="study-zone" element={<StudyZone />} />
        <Route path="virtual-lab" element={<LabDashboard />} />
        <Route path="classes" element={<ClassesLanding />} />
        <Route path="class/:classId" element={<ClassDetail />} />
        <Route path="class/:classId/material/:lessonId" element={<ClassMaterialPage />} />
        <Route path="quiz/:quizId" element={<QuizTakingPage />} />
        
        {/* Previously handled conditionally by activeTab */}
        <Route path="fire-quiz" element={<FireQuizGame />} />
        <Route path="shop" element={<StudentShop />} />
        <Route path="island" element={<StudentIsland />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="progress-map" element={<ProgressMap />} />
        <Route path="pvp" element={<PvpLobbyPage />} />
        
        {/* Fallback 404 inside Student Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
