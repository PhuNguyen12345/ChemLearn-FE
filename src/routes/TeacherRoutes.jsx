import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TeacherLayout from "../components/layout/teacher/TeacherLayout";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherClassManagement from "../pages/teacher/TeacherClassManagement";
import TeacherQuestionBank from "../pages/teacher/TeacherQuestionBank";
import TeacherStudentProfile from "../pages/teacher/TeacherStudentProfile";

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route element={<TeacherLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard initialTab="performance" />} />
        <Route path="classes" element={<TeacherClassManagement />} />
        <Route path="questions" element={<TeacherQuestionBank />} />
        <Route path="students/:studentId" element={<TeacherStudentProfile />} />
      </Route>
    </Routes>
  );
}
