
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import VirtualLabPage from "./features/lab/VirtualLabPage";
import StudyZone from "./pages/student/StudyZone";
import QuizDashboard from "./pages/student/QuizDashboard";
import QuizPlayer from "./pages/student/QuizPlayer";
import LabDashboard from "./features/lab/components/LabDashboard";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="/lab-workspace/:id"
            element={<VirtualLabPage />}
          />
          <Route element={<StudentLayout />}>
            <Route path="/student/home" element={<StudentHome />} />
            <Route path="/student/missions" element={<Missions />} />
            <Route path="/student/leaderboard" element={<Leaderboard />} />
            <Route path="/student/study-zone" element={<StudyZone />} />
            <Route path="/student/quiz" element={<QuizDashboard />} />
            <Route path="/student/quiz/:id" element={<QuizPlayer />} />
            <Route path="/student/virtual-lab" element={<LabDashboard />} />
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
