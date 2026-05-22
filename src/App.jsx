import "./App.css";
import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";

import AuthLayout from "./components/layout/auth/AuthLayout";
import Login from "./pages/auth/LoginPage";
import Register from "./pages/auth/RegisterPage";
import RequestAccessPage from "./pages/auth/RequestAccessPage";
import InviteAcceptPage from "./pages/auth/InviteAcceptPage";
import VirtualLabPage from "./features/lab/VirtualLabPage";

import FireQuizGame from "./components/FireQuizGame";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import useAuthStore from "./stores/useAuthStore";


import ConfirmLinkPage from "./pages/shared/ConfirmLinkPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Áp dụng Lazy Load cho các cụm Route theo Role
const StudentRoutes = lazy(() => import("./routes/StudentRoutes"));
const TeacherRoutes = lazy(() => import("./routes/TeacherRoutes"));
const AdminRoutes = lazy(() => import("./routes/AdminRoutes"));
const ParentRoutes = lazy(() => import("./routes/ParentRoutes"));

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
      <BrowserRouter>
        <Routes>
          {/* Public Routes (No Auth Required) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/confirm-link" element={<ConfirmLinkPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Public Auth Wrappers */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/request-access" element={<RequestAccessPage />} />
            <Route path="/invite" element={<InviteAcceptPage />} />
          </Route>

          {/* Protected Routes: Student */}
          <Route path="/student/*" element={<ProtectedRoute allowedRoles={["ROLE_STUDENT"]} />}>
            <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><StudentRoutes /></Suspense>} />
          </Route>

          {/* Protected Routes: Parent */}
          <Route path="/parent/*" element={<ProtectedRoute allowedRoles={["ROLE_PARENT"]} />}>
            <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><ParentRoutes /></Suspense>} />
          </Route>

          {/* Protected Routes: Teacher */}
          <Route path="/teacher/*" element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]} />}>
            <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><TeacherRoutes /></Suspense>} />
          </Route>

          {/* Protected Routes: Admin */}
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><AdminRoutes /></Suspense>} />
          </Route>

          {/* Shared Protected Routes (Multi-role access) */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ROLE_STUDENT",
                  "ROLE_TEACHER",
                  "ROLE_ADMIN",
                  "ROLE_PARENT",
                ]}
              />
            }
          >
            <Route path="/lab-workspace/:id" element={<VirtualLabPage />} />
            <Route path="/fire-quiz" element={<FireQuizGame />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
