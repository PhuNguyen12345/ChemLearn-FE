import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import TeacherLayout from "../components/layout/teacher/TeacherLayout";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherClassManagement from "../pages/teacher/TeacherClassManagement";
import TeacherQuestionBank from "../pages/teacher/TeacherQuestionBank";
import TeacherStudentProfile from "../pages/teacher/TeacherStudentProfile";
import TeacherProfile from "../pages/teacher/TeacherProfile";
import TeacherContentManagement from "../pages/teacher/TeacherContentManagement";
import TeacherClassChapters from "../pages/teacher/TeacherClassChapters";
import TeacherClassQuizzes from "../pages/teacher/TeacherClassQuizzes";
import TeacherQuizSubmissions from "../pages/teacher/TeacherQuizSubmissions";
import TeacherClassStudents from "../pages/teacher/TeacherClassStudents";
import TeacherQuizCreation from "../pages/teacher/TeacherQuizCreation";

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route element={<TeacherLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard initialTab="performance" />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="classes" element={<TeacherClassManagement />} />
        <Route path="classes/:classId/chapters" element={<TeacherClassChapters />} />
        <Route path="classes/:classId/quizzes" element={<TeacherClassQuizzes />} />
        <Route path="classes/:classId/quizzes/:quizId/submissions" element={<TeacherQuizSubmissions />} />
        <Route path="classes/:classId/students" element={<TeacherClassStudents />} />
        <Route path="content" element={<TeacherContentManagement />} />
        <Route path="quiz-creation" element={<TeacherQuizCreation />} />
        <Route path="questions" element={<TeacherQuestionBank />} />
        <Route path="students/:studentId" element={<TeacherStudentProfile />} />
      </Route>
    </Routes>
  );
}
