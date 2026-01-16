import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user?.role === "student") {
      api.get("/tasks/notifications")
        .then(res => setNotificationCount(res.data.count))
        .catch(err => console.error("Failed to fetch notifications"));
    }
  }, [user]);

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <span>📚</span> LMS
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Home</Link>
          <Link to="/courses" className="text-gray-600 hover:text-blue-600 font-medium transition">Courses</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'student' ? (
                <>
                  <Link to="/dashboard/courses" className="text-gray-600 hover:text-blue-600 font-medium transition relative">
                    My Courses
                    {notificationCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/dashboard/progress" className="text-gray-600 hover:text-blue-600 font-medium transition">Progress</Link>
                  <Link to="/dashboard/certificates" className="text-gray-600 hover:text-blue-600 font-medium transition">Certificates</Link>
                  <Link to="/dashboard/profile" className="text-gray-600 hover:text-blue-600 font-medium transition">Profile</Link>
                </>
              ) : (
                <Link to={user.role === 'admin' ? "/dashboard/admin" : "/dashboard/teacher"} className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    Logout
                  </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger Button */}
        <button 
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4 shadow-lg">
          <Link to="/" className="block text-gray-600 hover:text-blue-600 font-medium transition" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/courses" className="block text-gray-600 hover:text-blue-600 font-medium transition" onClick={() => setIsOpen(false)}>Courses</Link>
          
          {user ? (
            <>
              {user.role === 'student' ? (
                <>
                  <Link to="/dashboard/courses" className="block text-gray-600 hover:text-blue-600 font-medium transition" onClick={() => setIsOpen(false)}>
                    My Courses
                    {notificationCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/dashboard/progress" className="block text-gray-600 hover:text-blue-600 font-medium transition" onClick={() => setIsOpen(false)}>Progress</Link>
                  <Link to="/dashboard/certificates" className="block text-gray-600 hover:text-blue-600 font-medium transition" onClick={() => setIsOpen(false)}>Certificates</Link>
                  <Link to="/dashboard/profile" className="block text-gray-600 hover:text-blue-600 font-medium transition" onClick={() => setIsOpen(false)}>Profile</Link>
                </>
              ) : (
                <Link to={user.role === 'admin' ? "/dashboard/admin" : "/dashboard/teacher"} className="block text-gray-600 hover:text-blue-600 font-medium transition" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              )}
              <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Signed in as {user.name}</p>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    Logout
                  </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/login" className="block text-center text-gray-600 hover:text-blue-600 font-medium transition" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="block text-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium" onClick={() => setIsOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}