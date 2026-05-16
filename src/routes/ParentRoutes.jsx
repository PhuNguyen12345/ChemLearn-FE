import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ParentLayout from "../components/layout/parent/ParentLayout";
import ParentDashboard from "../pages/parent/ParentDashboard";

export default function ParentRoutes() {
  return (
    <Routes>
      <Route element={<ParentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboard />} />
      </Route>
    </Routes>
  );
}
