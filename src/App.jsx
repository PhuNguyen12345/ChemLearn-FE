import "./App.css";
import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";

import AuthLayout from "./components/layout/auth/AuthLayout";
import Login from "./pages/auth/LoginPage";
import Register from "./pages/auth/RegisterPage";
import VirtualLabPage from "./features/lab/VirtualLabPage";

import FireQuizGame from "./components/FireQuizGame";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import useAuthStore from "./stores/useAuthStore";

import ConfirmLinkPage from "./pages/shared/ConfirmLinkPage";

// Áp dụng Lazy Load cho các cụm Route theo Role
const StudentRoutes = lazy(() => import('./routes/StudentRoutes'));
const TeacherRoutes = lazy(() => import('./routes/TeacherRoutes'));
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const ParentRoutes = lazy(() => import('./routes/ParentRoutes'));

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
      <Toaster position="top-right" richColors />
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      }>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/confirm-link" element={<ConfirmLinkPage />} />

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/register" element={<Navigate to="/auth/register" replace />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
            </Route>

            {/* Shared Routes: Giữ lại ở Top-level và bọc Phân quyền */}
            <Route element={<ProtectedRoute allowedRoles={["ROLE_STUDENT", "ROLE_TEACHER", "ROLE_ADMIN"]} />}>
              <Route path="/lab-workspace/:id" element={<VirtualLabPage />} />
              <Route path="/fire-quiz" element={<FireQuizGame />} />
            </Route>

            {/* Phân luồng cho Student */}
            <Route element={<ProtectedRoute allowedRoles={["ROLE_STUDENT"]} />}>
              <Route path="/student/*" element={<StudentRoutes />} />
            </Route>

            {/* Phân luồng cho Teacher */}
            <Route element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]} />}>
              <Route path="/teacher/*" element={<TeacherRoutes />} />
            </Route>

            {/* Phân luồng cho Admin */}
            <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Route>

            {/* Phân luồng cho Parent */}
            <Route element={<ProtectedRoute allowedRoles={["ROLE_PARENT"]} />}>
              <Route path="/parent/*" element={<ParentRoutes />} />
            </Route>

            {/* Fallbacks */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </>
  );
}

export default App;
