import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";

const MOCK_COURSES = [
  {
    _id: "mock-web-dev",
    title: "Modern Web Development",
    description: "Build responsive apps with HTML, CSS, JavaScript, and React.",
    level: "Beginner",
    duration: "6 weeks",
    isMock: true,
  },
  {
    _id: "mock-python",
    title: "Python for Problem Solving",
    description: "Master Python basics, data structures, and automation tasks.",
    level: "Beginner",
    duration: "5 weeks",
    isMock: true,
  },
  {
    _id: "mock-ui-ux",
    title: "UI/UX Design Fundamentals",
    description: "Learn user research, wireframes, and prototype design workflow.",
    level: "Intermediate",
    duration: "4 weeks",
    isMock: true,
  },
  {
    _id: "mock-node-api",
    title: "Node.js API Development",
    description: "Design secure REST APIs with Express, JWT, and MongoDB.",
    level: "Intermediate",
    duration: "7 weeks",
    isMock: true,
  },
  {
    _id: "mock-data-analytics",
    title: "Data Analytics Essentials",
    description: "Analyze datasets and create dashboards with practical projects.",
    level: "Intermediate",
    duration: "6 weeks",
    isMock: true,
  },
  {
    _id: "mock-devops",
    title: "DevOps and Cloud Basics",
    description: "Understand CI/CD pipelines, Docker, and deployment workflows.",
    level: "Advanced",
    duration: "8 weeks",
    isMock: true,
  },
];

export default function Courses() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      try {
        const res = await api.get("/courses", { timeout: 10000 });
        const apiCourses = Array.isArray(res.data) ? res.data : [];

        if (isMounted) {
          setCourses(apiCourses.length ? apiCourses : MOCK_COURSES);
        }
      } catch {
        if (isMounted) {
          setCourses(MOCK_COURSES);
        }
      }
    };

    const loadEnrolledCourses = async () => {
      if (!user?._id) {
        if (isMounted) {
          setEnrolled([]);
        }
        return;
      }

      try {
        const res = await api.get(`/courses/enrolled/${user._id}`);
        const ids = Array.isArray(res.data) ? res.data.map((c) => c._id) : [];

        if (isMounted) {
          setEnrolled(ids);
        }
      } catch {
        if (isMounted) {
          setEnrolled([]);
        }
      }
    };

    loadCourses();
    loadEnrolledCourses();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const enroll = async (courseId, isMock) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isMock) {
      return;
    }

    try {
      await api.post("/courses/enroll", {
        courseId,
        userId: user._id,
      });

      setEnrolled((prev) => [...prev, courseId]);
    } catch {
      alert("Unable to enroll right now. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">All Courses</h2>
        <p className="text-sm text-slate-600 mt-1">
          Explore available courses and start learning.
        </p>
        {!user && (
          <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 inline-block px-3 py-1 rounded-full">
            Demo mode: showing mock courses
          </p>
        )}
      </div>

      {courses.length === 0 && (
        <p className="text-slate-600">No courses available.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => {
          const courseId = course._id || course.id;
          const isEnrolled = enrolled.includes(courseId);
          const isMock = Boolean(course.isMock);

          return (
            <div
              key={courseId}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {course.title || "Untitled Course"}
              </h3>

              <p className="mt-2 text-sm text-slate-600 min-h-[48px]">
                {course.description || "Course description coming soon."}
              </p>

              <div className="mt-3 flex gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                  {course.level || "General"}
                </span>
                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                  {course.duration || "Self-paced"}
                </span>
              </div>

              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full mt-4 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Login to Enroll
                </button>
              ) : isMock ? (
                <button
                  disabled
                  className="w-full mt-4 bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Demo Course
                </button>
              ) : !isEnrolled ? (
                <button
                  onClick={() => enroll(courseId, false)}
                  className="w-full mt-4 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  Enroll
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/dashboard/quiz/${courseId}`)}
                  className="w-full mt-4 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Start Quiz
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
