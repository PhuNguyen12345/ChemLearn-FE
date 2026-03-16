
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VirtualLab from "./pages/VirtualLab";
import AdvancedVirtualLab from "./pages/AdvancedVirtualLab";
import StudentHome from "./pages/student/StudentHome";
import StudentLayout from "./components/layout/student/StudentLayout";
import ParentLayout from "./components/layout/parent/ParentLayout";
import ParentDashboard from "./pages/parent/ParentDashboard";
import TeacherLayout from "./components/layout/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import LandingPage from "./pages/LandingPage";

import AdminLayout from "./components/layout/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VirtualLabPage from "./features/lab/VirtualLabPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="/lab1"
            element={<VirtualLab></VirtualLab>}
          ></Route>
          <Route
            path="/lab2"
            element={<VirtualLabPage></VirtualLabPage>}
          ></Route>
          <Route element={<StudentLayout />}>
            <Route path="/student/home" element={<StudentHome />} />
            {/* Các trang khác của student ném hết vào đây */}
          </Route>
          <Route element={<ParentLayout />}>
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            {/* Các trang khác của parent ném hết vào đây */}
          </Route>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            {/* Các trang khác của teacher ném hết vào đây */}
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Các trang khác của admin ném hết vào đây */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
