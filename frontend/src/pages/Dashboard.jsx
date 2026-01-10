import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") navigate("/dashboard/admin");
    else if (user.role === "teacher") navigate("/dashboard/teacher");
    else navigate("/dashboard/courses");
  }, [user]);

  return (
    <div className="flex">
      <Sidebar role={user.role} />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Topbar name={user.name} logout={logout} />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
