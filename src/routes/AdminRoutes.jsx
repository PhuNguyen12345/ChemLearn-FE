import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminClassManagement from "../pages/admin/AdminClassManagement";
import AdminUserManagement from "../pages/admin/AdminUserManagement";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="classes" element={<AdminClassManagement />} />
        <Route path="users" element={<AdminUserManagement />} />
      </Route>
    </Routes>
  );
}
