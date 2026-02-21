import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Topbar from "../components/Topbar";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") navigate("/dashboard/admin");
    else if (user.role === "teacher") navigate("/dashboard/teacher");
    else navigate("/dashboard/courses");
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto w-full max-w-7xl px-3 pb-4 pt-2 sm:px-4 sm:pb-6 lg:px-6">
        <Topbar name={user?.name} />
        <div className="pt-4 sm:pt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
