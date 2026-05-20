
import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import StudentHome from "./pages/student/StudentHome";
import Missions from "./pages/student/Missions";
import Leaderboard from "./pages/student/Leaderboard";
import StudentLayout from "./components/layout/student/StudentLayout";
import ClassesLanding from "./pages/student/ClassesLanding";
import ClassDetail from "./pages/student/ClassDetail";
import ClassMaterialPage from "./pages/student/ClassMaterialPage";
import QuizTakingPage from "./pages/student/QuizTakingPage";
import ParentLayout from "./components/layout/parent/ParentLayout";
import ParentDashboard from "./pages/parent/ParentDashboard";
import TeacherLayout from "./components/layout/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClassManagement from "./pages/teacher/TeacherClassManagement";
import TeacherQuestionBank from "./pages/teacher/TeacherQuestionBank";
import TeacherQuizCreation from "./pages/teacher/TeacherQuizCreation";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import TeacherStudentProfile from "./pages/teacher/TeacherStudentProfile";
import TeacherContentManagement from "./pages/teacher/TeacherContentManagement";
import TeacherClassChapters from "./pages/teacher/TeacherClassChapters";
import TeacherClassQuizzes from "./pages/teacher/TeacherClassQuizzes";
import TeacherQuizSubmissions from "./pages/teacher/TeacherQuizSubmissions";
import TeacherClassStudents from "./pages/teacher/TeacherClassStudents";
import LandingPage from "./pages/LandingPage";

import AdminLayout from "./components/layout/admin/AdminLayout";
import AuthLayout from "./components/layout/auth/AuthLayout";
import Login from "./pages/auth/LoginPage";
import Register from "./pages/auth/RegisterPage";
import RequestAccessPage from "./pages/auth/RequestAccessPage";
import InviteAcceptPage from "./pages/auth/InviteAcceptPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudyZone from "./pages/admin/AdminStudyZone";
import AdminStudyEditPage from "./pages/admin/AdminStudyEditPage";
import AdminClassManagement from "./pages/admin/AdminClassManagement";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import VirtualLabPage from "./features/lab/VirtualLabPage";
import FireQuizGame from "./components/FireQuizGame";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import useAuthStore from "./stores/useAuthStore";

const isJwtExpired = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    const decodedPayload = JSON.parse(atob(payloadBase64));
    if (!decodedPayload?.exp) return false;

    return decodedPayload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

function App() {
  const { token, user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!token || !user || isJwtExpired(token)) {
      logout();
    }
  }, [isAuthenticated, logout, token, user]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<Navigate to="/login" replace />} />
          <Route path="/auth/register" element={<Navigate to="/register" replace />} />
          <Route path="/fire-quiz" element={<FireQuizGame />} />
          <Route
            path="/lab"
            element={<VirtualLabPage></VirtualLabPage>}
          ></Route>

          <Route path="/student" element={<Navigate to="/student/home" replace />} />
          <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
          <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route element={<ProtectedRoute allowedRoles={["ROLE_STUDENT"]} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/home" element={<StudentHome />} />
              <Route path="/student/classes" element={<ClassesLanding />} />
              <Route path="/student/class/:classId" element={<ClassDetail />} />
              <Route path="/student/class/:classId/material/:lessonId" element={<ClassMaterialPage />} />
              <Route path="/student/missions" element={<Missions />} />
              <Route path="/student/leaderboard" element={<Leaderboard />} />
              <Route path="/student/quiz/:quizId" element={<QuizTakingPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ROLE_PARENT"]} />}>
            <Route element={<ParentLayout />}>
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard initialTab="performance" />} />
              <Route path="/teacher/profile" element={<TeacherProfile />} />
              <Route path="/teacher/classes" element={<TeacherClassManagement />} />
              <Route path="/teacher/classes/:classId/chapters" element={<TeacherClassChapters />} />
              <Route path="/teacher/classes/:classId/quizzes" element={<TeacherClassQuizzes />} />
              <Route path="/teacher/classes/:classId/quizzes/:quizId/submissions" element={<TeacherQuizSubmissions />} />
              <Route path="/teacher/classes/:classId/students" element={<TeacherClassStudents />} />
              <Route path="/teacher/content" element={<TeacherContentManagement />} />
              <Route path="/teacher/quiz-creation" element={<TeacherQuizCreation />} />
              <Route path="/teacher/questions" element={<TeacherQuestionBank />} />
              <Route path="/teacher/students/:studentId" element={<TeacherStudentProfile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/study" element={<AdminStudyZone />} />
              <Route path="/admin/study/:entityType/:entityId/edit" element={<AdminStudyEditPage />} />
              <Route path="/admin/classes" element={<AdminClassManagement />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/request-access" element={<RequestAccessPage />} />
            <Route path="/invite" element={<InviteAcceptPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
