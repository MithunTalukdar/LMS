import { NavLink } from "react-router-dom";

export default function Sidebar({ role }) {
  const linkClass = ({ isActive }) =>
    `block p-2 rounded ${
      isActive ? "bg-blue-600 text-white" : "hover:text-blue-400"
    }`;

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-5">
      <h2 className="text-xl font-bold mb-6">LMS</h2>

      {role === "student" && (
        <ul className="space-y-3">
          <li>
            <NavLink to="/dashboard/courses" end className={linkClass}>
              My Courses
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/progress" className={linkClass}>
              Progress
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/certificates" className={linkClass}>
              Certificates
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/profile" className={linkClass}>
              Profile
            </NavLink>
          </li>
        </ul>
      )}

      {role === "teacher" && (
        <ul className="space-y-3">
          <li>
            <NavLink to="/dashboard/teacher" className={linkClass}>
              Teacher Panel
            </NavLink>
          </li>
        </ul>
      )}

      {role === "admin" && (
        <ul className="space-y-3">
          <li>
            <NavLink to="/dashboard/admin" className={linkClass}>
              Admin Panel
            </NavLink>
          </li>
        </ul>
      )}
    </div>
  );
}
