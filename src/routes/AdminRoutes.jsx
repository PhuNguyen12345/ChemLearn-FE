import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layout/admin/AdminLayout";
import NotFoundPage from "../pages/shared/NotFoundPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUserManagement from "../pages/admin/AdminUserManagement";
import AdminStudyZone from "../pages/admin/AdminStudyZone";
import AdminStudyEditPage from "../pages/admin/AdminStudyEditPage";
import AdminAccountRequests from "../pages/admin/AdminAccountRequests";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="study" element={<AdminStudyZone />} />
        <Route path="study/:entityType/:entityId/edit" element={<AdminStudyEditPage />} />
        <Route path="account-requests" element={<AdminAccountRequests />} />
        <Route path="users" element={<AdminUserManagement />} />
        
        {/* Fallback 404 inside Admin Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
