
import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StudentHome from "./pages/student/StudentHome";
import Missions from "./pages/student/Missions";
import Leaderboard from "./pages/student/Leaderboard";
import StudentLayout from "./components/layout/student/StudentLayout";
import ParentLayout from "./components/layout/parent/ParentLayout";
import ParentDashboard from "./pages/parent/ParentDashboard";
import TeacherLayout from "./components/layout/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import LandingPage from "./pages/LandingPage";

import AdminLayout from "./components/layout/admin/AdminLayout";
import AuthLayout from "./components/layout/auth/AuthLayout";
import Login from "./pages/auth/LoginPage";
import Register from "./pages/auth/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
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
          <Route path="/fire-quiz" element={<FireQuizGame />} />
          <Route
            path="/lab"
            element={<VirtualLabPage></VirtualLabPage>}
          ></Route>
          <Route element={<ProtectedRoute allowedRoles={["ROLE_STUDENT"]} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/home" element={<StudentHome />} />
              <Route path="/student/missions" element={<Missions />} />
              <Route path="/student/leaderboard" element={<Leaderboard />} />
              {/* Các trang khác của student ném hết vào đây */}
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ROLE_PARENT"]} />}>
            <Route element={<ParentLayout />}>
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              {/* Các trang khác của parent ném hết vào đây */}
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              {/* Các trang khác của teacher ném hết vào đây */}
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* Các trang khác của admin ném hết vào đây */}
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
