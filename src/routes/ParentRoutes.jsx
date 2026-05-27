import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ParentLayout from "../components/layout/parent/ParentLayout";
import NotFoundPage from "../pages/shared/NotFoundPage";
import ParentDashboard from "../pages/parent/ParentDashboard";

export default function ParentRoutes() {
  return (
    <Routes>
      <Route element={<ParentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        
        {/* Fallback 404 inside Parent Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
