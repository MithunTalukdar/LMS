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
    demo: {
      summary: "Create a complete landing page with reusable UI blocks.",
      modules: [
        "HTML semantic layout and accessibility basics",
        "Modern CSS with Flexbox and Grid",
        "JavaScript DOM interactions and validation",
      ],
      project: "Responsive portfolio homepage",
    },
  },
  {
    _id: "mock-python",
    title: "Python for Problem Solving",
    description: "Master Python basics, data structures, and automation tasks.",
    level: "Beginner",
    duration: "5 weeks",
    isMock: true,
    demo: {
      summary: "Solve practical coding tasks with readable Python patterns.",
      modules: [
        "Variables, loops, and functions",
        "Lists, dictionaries, and string handling",
        "Small automation scripts for daily tasks",
      ],
      project: "Student marks analyzer CLI",
    },
  },
  {
    _id: "mock-ui-ux",
    title: "UI/UX Design Fundamentals",
    description: "Learn user research, wireframes, and prototype design workflow.",
    level: "Intermediate",
    duration: "4 weeks",
    isMock: true,
    demo: {
      summary: "Design user-first interfaces from problem to prototype.",
      modules: [
        "User persona and pain-point mapping",
        "Low-fidelity wireframe systems",
        "Clickable prototype and usability check",
      ],
      project: "Mobile food ordering app flow",
    },
  },
  {
    _id: "mock-node-api",
    title: "Node.js API Development",
    description: "Design secure REST APIs with Express, JWT, and MongoDB.",
    level: "Intermediate",
    duration: "7 weeks",
    isMock: true,
    demo: {
      summary: "Build production-style APIs with auth and clear route design.",
      modules: [
        "Express routing and controller pattern",
        "JWT auth and protected endpoints",
        "MongoDB models and pagination",
      ],
      project: "Course management REST API",
    },
  },
  {
    _id: "mock-data-analytics",
    title: "Data Analytics Essentials",
    description: "Analyze datasets and create dashboards with practical projects.",
    level: "Intermediate",
    duration: "6 weeks",
    isMock: true,
    demo: {
      summary: "Turn raw datasets into clear charts and business insights.",
      modules: [
        "Data cleaning and transformation basics",
        "Exploratory analysis and trend reading",
        "Dashboard storytelling techniques",
      ],
      project: "Sales performance insight dashboard",
    },
  },
  {
    _id: "mock-devops",
    title: "DevOps and Cloud Basics",
    description: "Understand CI/CD pipelines, Docker, and deployment workflows.",
    level: "Advanced",
    duration: "8 weeks",
    isMock: true,
    demo: {
      summary: "Ship applications faster using repeatable DevOps workflows.",
      modules: [
        "Docker images and container best practices",
        "CI pipelines and automated testing flow",
        "Cloud deployment and monitoring basics",
      ],
      project: "Containerized app deployment pipeline",
    },
  },
];

const PUBLIC_CARD_THEMES = [
  {
    borderColor: "#22d3ee",
    cardBackground: "linear-gradient(160deg,#ecfeff 0%,#f0f9ff 100%)",
    topBarBackground: "linear-gradient(90deg,#06b6d4,#2563eb)",
    demoBg: "#cffafe",
    demoText: "#164e63",
    demoBorder: "#a5f3fc",
    blobColor: "rgba(34,211,238,0.30)",
    innerBorder: "#bae6fd",
    loginBackground: "linear-gradient(90deg,#0891b2,#2563eb)",
    loginShadow: "0 12px 24px -12px rgba(8,145,178,0.65)",
    enrollBackground: "linear-gradient(90deg,#059669,#0d9488)",
    enrollShadow: "0 12px 24px -12px rgba(5,150,105,0.6)",
    startBackground: "#ecfeff",
    startBorder: "#67e8f9",
    startText: "#0f766e",
  },
  {
    borderColor: "#818cf8",
    cardBackground: "linear-gradient(160deg,#eef2ff 0%,#f5f3ff 100%)",
    topBarBackground: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    demoBg: "#e0e7ff",
    demoText: "#312e81",
    demoBorder: "#c7d2fe",
    blobColor: "rgba(129,140,248,0.30)",
    innerBorder: "#c7d2fe",
    loginBackground: "linear-gradient(90deg,#4f46e5,#7c3aed)",
    loginShadow: "0 12px 24px -12px rgba(79,70,229,0.65)",
    enrollBackground: "linear-gradient(90deg,#059669,#0d9488)",
    enrollShadow: "0 12px 24px -12px rgba(5,150,105,0.6)",
    startBackground: "#eef2ff",
    startBorder: "#a5b4fc",
    startText: "#3730a3",
  },
  {
    borderColor: "#fb923c",
    cardBackground: "linear-gradient(160deg,#fff7ed 0%,#fef2f2 100%)",
    topBarBackground: "linear-gradient(90deg,#f59e0b,#f43f5e)",
    demoBg: "#ffedd5",
    demoText: "#9a3412",
    demoBorder: "#fdba74",
    blobColor: "rgba(251,146,60,0.30)",
    innerBorder: "#fed7aa",
    loginBackground: "linear-gradient(90deg,#ea580c,#e11d48)",
    loginShadow: "0 12px 24px -12px rgba(234,88,12,0.65)",
    enrollBackground: "linear-gradient(90deg,#059669,#0d9488)",
    enrollShadow: "0 12px 24px -12px rgba(5,150,105,0.6)",
    startBackground: "#fff7ed",
    startBorder: "#fdba74",
    startText: "#9a3412",
  },
  {
    borderColor: "#34d399",
    cardBackground: "linear-gradient(160deg,#ecfdf5 0%,#f0fdfa 100%)",
    topBarBackground: "linear-gradient(90deg,#10b981,#14b8a6)",
    demoBg: "#d1fae5",
    demoText: "#065f46",
    demoBorder: "#6ee7b7",
    blobColor: "rgba(52,211,153,0.30)",
    innerBorder: "#a7f3d0",
    loginBackground: "linear-gradient(90deg,#059669,#0891b2)",
    loginShadow: "0 12px 24px -12px rgba(5,150,105,0.65)",
    enrollBackground: "linear-gradient(90deg,#059669,#0d9488)",
    enrollShadow: "0 12px 24px -12px rgba(5,150,105,0.6)",
    startBackground: "#ecfdf5",
    startBorder: "#6ee7b7",
    startText: "#065f46",
  },
];

const getCourseLabel = (index) => `Course ${String(index + 1).padStart(2, "0")}`;

const getLevelBadgeClass = (level, isPublic) => {
  if (!isPublic) {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  switch (String(level).toLowerCase()) {
    case "beginner":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "intermediate":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "advanced":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default function Courses({ isPublic = false }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [expandedDemoId, setExpandedDemoId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      if (isPublic && !user) {
        if (isMounted) {
          setCourses(MOCK_COURSES);
        }
        return;
      }

      try {
        const res = await api.get("/courses", { timeout: 10000 });
        const apiCourses = Array.isArray(res.data) ? res.data : [];

        if (isMounted) {
          setCourses(apiCourses.length ? apiCourses : MOCK_COURSES);
        }
      } catch (error) {
        if (error?.response?.status === 401 && isPublic) {
          if (isMounted) {
            setCourses(MOCK_COURSES);
          }
          return;
        }

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
  }, [isPublic, user]);

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

  const rootClassName = isPublic
    ? "relative min-h-[calc(100vh-170px)] overflow-hidden"
    : "bg-transparent";
  const rootStyle = isPublic
    ? {
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 10% 8%, #67e8f9 0%, transparent 28%), radial-gradient(circle at 88% 12%, #a5b4fc 0%, transparent 32%), linear-gradient(145deg, #f8fafc 0%, #eef2ff 52%, #f0f9ff 100%)",
      }
    : undefined;

  const contentClassName = isPublic
    ? "relative max-w-6xl mx-auto px-4 py-10 md:py-14 pb-16"
    : "max-w-6xl mx-auto px-4 py-8";

  return (
    <div
      className={rootClassName}
      style={rootStyle}
    >
      {isPublic && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.18), rgba(255,255,255,0.4))",
          }}
        />
      )}

      {isPublic && (
        <>
          <div className="pointer-events-none absolute -left-16 top-14 h-64 w-64 rounded-full bg-cyan-300/45 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-indigo-300/35 blur-3xl animate-float-slow-delayed" />
        </>
      )}

      <div className={contentClassName}>
        <div className={isPublic ? "mb-8 md:mb-10 animate-fade-up" : "mb-6"}>
          {isPublic && (
            <p className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold uppercase tracking-[0.16em] text-cyan-900 bg-cyan-100/80 border border-cyan-200 rounded-full px-4 py-2 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-600" />
              Course Catalog
            </p>
          )}

          <h2
            className={
              isPublic
                ? "mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900"
                : "text-2xl font-bold text-slate-900"
            }
          >
            All Courses
          </h2>

          <p
            className={
              isPublic
                ? "mt-3 text-base md:text-lg text-slate-700 max-w-2xl"
                : "text-sm text-slate-600 mt-1"
            }
          >
            Explore available courses and start learning.
          </p>

          {!user && (
            <p
              className={
                isPublic
                  ? "mt-4 inline-block text-xs md:text-sm font-semibold text-indigo-900 bg-indigo-100/80 border border-indigo-200 rounded-full px-4 py-1.5 shadow-sm"
                  : "mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 inline-block px-3 py-1 rounded-full"
              }
            >
              Demo mode: showing mock courses
            </p>
          )}
        </div>

        {courses.length === 0 && (
          <p className="text-slate-600">No courses available.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {courses.map((course, index) => {
            const courseId = course._id || course.id || `${course.title}-${index}`;
            const isEnrolled = enrolled.includes(courseId);
            const isMock = Boolean(course.isMock);
            const level = course.level || "General";
            const duration = course.duration || "Self-paced";
            const demoContent = course.demo;
            const isDemoOpen = expandedDemoId === courseId;
            const cardTheme = PUBLIC_CARD_THEMES[index % PUBLIC_CARD_THEMES.length];

            const cardClassName = isPublic
              ? "group relative isolate overflow-hidden rounded-3xl border-2 backdrop-blur-md p-5 md:p-6 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-30px_rgba(37,99,235,0.5)] animate-fade-up"
              : "relative bg-white border border-black/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition";
            const cardStyle = isPublic
              ? { borderColor: "#111827", background: cardTheme.cardBackground }
              : undefined;
            const cardInlineStyle = isPublic
              ? { ...cardStyle, animationDelay: `${index * 0.08}s` }
              : undefined;

            const buttonPrimaryClass = isPublic
              ? "w-full border px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:-translate-y-0.5 hover:brightness-105"
              : "w-full mt-4 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium";
            const buttonPrimaryStyle = isPublic
              ? {
                  background: cardTheme.startBackground,
                  borderColor: cardTheme.startBorder,
                  color: cardTheme.startText,
                  boxShadow: "0 10px 20px -15px rgba(15,23,42,0.4)",
                }
              : undefined;

            const buttonEnrollClass = isPublic
              ? "w-full border text-white px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:-translate-y-0.5 hover:brightness-110"
              : "w-full mt-4 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium";
            const buttonEnrollStyle = isPublic
              ? {
                  background: cardTheme.enrollBackground,
                  borderColor: cardTheme.borderColor,
                  boxShadow: cardTheme.enrollShadow,
                }
              : undefined;

            const loginButtonClass = isPublic
              ? "group w-full border text-white px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:-translate-y-0.5 hover:brightness-110"
              : "w-full mt-4 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium";
            const loginButtonStyle = isPublic
              ? {
                  background: cardTheme.loginBackground,
                  borderColor: cardTheme.borderColor,
                  boxShadow: cardTheme.loginShadow,
                }
              : undefined;

            const demoTagStyle = isPublic
              ? {
                  color: cardTheme.demoText,
                  backgroundColor: cardTheme.demoBg,
                  borderColor: cardTheme.demoBorder,
                }
              : undefined;

            const innerPanelStyle = isPublic
              ? { borderColor: cardTheme.innerBorder }
              : undefined;

            const blobStyle = isPublic
              ? { backgroundColor: cardTheme.blobColor }
              : undefined;

            const topBarStyle = isPublic
              ? { background: cardTheme.topBarBackground }
              : undefined;

            const demoButtonClass = isPublic
              ? "w-full border border-black text-slate-900 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-md hover:-translate-y-0.5"
              : "w-full border border-black text-slate-900 bg-white px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold hover:bg-slate-50";
            const demoButtonStyle = isPublic
              ? {
                  background: "linear-gradient(90deg,#ffffff,#f8fafc)",
                  boxShadow: "0 8px 20px -12px rgba(15,23,42,0.45)",
                }
              : undefined;

            return (
              <div
                key={courseId}
                className={cardClassName}
                style={cardInlineStyle}
              >
                {isPublic && (
                  <div
                    className="absolute inset-x-0 top-0 h-1 rounded-t-3xl"
                    style={topBarStyle}
                  />
                )}

                {isPublic && (
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-70"
                    style={blobStyle}
                  />
                )}

                {isPublic ? (
                  <div className="pointer-events-none absolute inset-[7px] rounded-[1.2rem] border border-black/25" />
                ) : (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border border-black/35" />
                )}

                <div className={isPublic ? "relative h-full flex flex-col" : ""}>
                  {isPublic && (
                    <p className="mb-3 inline-flex w-fit rounded-full border border-white/70 bg-white/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {getCourseLabel(index)}
                    </p>
                  )}

                {isMock && (
                  <span
                    className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wide border rounded-full px-2 py-1"
                    style={demoTagStyle}
                  >
                    Demo
                  </span>
                )}

                <h3
                  className={
                    isPublic
                      ? "text-xl md:text-[1.65rem] font-bold text-slate-900 leading-tight pr-14"
                      : "text-lg font-semibold text-slate-900"
                  }
                >
                  {course.title || "Untitled Course"}
                </h3>

                <p
                  className={
                    isPublic
                      ? "mt-3 text-slate-700 leading-relaxed min-h-[72px] text-[1.03rem]"
                      : "mt-2 text-sm text-slate-600 min-h-[48px]"
                  }
                >
                  {course.description || "Course description coming soon."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-full border ${getLevelBadgeClass(level, isPublic)}`}
                  >
                    {level}
                  </span>
                  <span className="px-2.5 py-1 rounded-full border border-slate-200 bg-white/80 text-slate-700">
                    {duration}
                  </span>
                </div>

                {isPublic && (
                  <div
                    className="mt-4 rounded-2xl border bg-white/70 px-3.5 py-3"
                    style={innerPanelStyle}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Learning Outcome
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Build practical skills with guided lessons and quiz-based checkpoints.
                    </p>
                  </div>
                )}

                <div className={isPublic ? "mt-auto pt-5 border-t border-black/25" : "mt-4 pt-4 border-t border-black/20"}>
                {isMock && (
                  <>
                    <button
                      onClick={() => setExpandedDemoId(isDemoOpen ? "" : courseId)}
                      className={demoButtonClass}
                      style={demoButtonStyle}
                    >
                      {isDemoOpen ? "Hide Demo Content" : "View Demo Content"}
                    </button>

                    {isDemoOpen && demoContent && (
                      <div className="mt-3 rounded-xl border border-black/30 bg-white/80 p-3 text-sm text-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Demo Content
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {demoContent.summary}
                        </p>
                        <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-700">
                          {demoContent.modules.map((module) => (
                            <li key={module}>{module}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-slate-700">
                          <span className="font-semibold text-slate-900">Mini Project:</span>{" "}
                          {demoContent.project}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!user && (
                  <button
                    onClick={() => navigate("/login")}
                    className={`${loginButtonClass} ${isMock ? "mt-3" : ""}`}
                    style={loginButtonStyle}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>Login to Enroll</span>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14m-5-5l5 5-5 5"
                          />
                        </svg>
                      </span>
                    </span>
                  </button>
                )}

                {!isMock && user && !isEnrolled && (
                  <button
                    onClick={() => enroll(courseId, false)}
                    className={buttonEnrollClass}
                    style={buttonEnrollStyle}
                  >
                    Enroll
                  </button>
                )}

                {!isMock && user && isEnrolled && (
                  <button
                    onClick={() => navigate(`/dashboard/quiz/${courseId}`)}
                    className={buttonPrimaryClass}
                    style={buttonPrimaryStyle}
                  >
                    Start Quiz
                  </button>
                )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
