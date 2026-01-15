import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Progress from "./pages/Progress";
import Certificate from "./pages/Certificate";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import TeacherDashboard from "./pages/TeacherDashboard";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import RoleRoute from "./components/RoleRoute";
import AdminDashboard from "./pages/AdminDashboard";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Courses />} />
            <Route path="courses" element={<Courses />} />
            <Route path="progress" element={<Progress />} />
            <Route path="certificates" element={<Certificate />} />
            <Route path="profile" element={<Profile />} />
            <Route path="quiz/:courseId" element={<Quiz />} />

            {/* 👨‍🏫 TEACHER */}
            <Route
              path="teacher"
              element={
                <RoleRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="admin"
              element={
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
