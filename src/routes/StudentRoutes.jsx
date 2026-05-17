import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import StudentLayout from "../components/layout/student/StudentLayout";
import StudentHome from "../pages/student/StudentHome";
import Missions from "../pages/student/Missions";
import Leaderboard from "../pages/student/Leaderboard";
import StudyZone from "../pages/student/StudyZone";
import QuizDashboard from "../pages/student/QuizDashboard";
// import QuizPlayer from "../pages/student/QuizPlayer";
import LabDashboard from "../features/lab/components/LabDashboard";
import ClassesLanding from "../pages/student/ClassesLanding";
import ClassDetail from "../pages/student/ClassDetail";

export default function StudentRoutes() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<StudentHome />} />
        <Route path="missions" element={<Missions />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="study-zone" element={<StudyZone />} />
        <Route path="quiz" element={<QuizDashboard />} />
        {/* <Route path="quiz/:id" element={<QuizPlayer />} /> */}
        <Route path="virtual-lab" element={<LabDashboard />} />
        <Route path="/student/classes" element={<ClassesLanding />} />
        <Route path="/student/class/:classId" element={<ClassDetail />} />
      </Route>
    </Routes>
  );
}
