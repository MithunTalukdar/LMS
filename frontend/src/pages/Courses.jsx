import { useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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

const PRIVATE_SHOWCASE_COURSES = [
  {
    _id: "mock-beginner-html-css-lab",
    title: "HTML & CSS Studio",
    description: "Master page structure, responsive layouts, and modern visual styling.",
    level: "Beginner",
    duration: "4 weeks",
    isCatalogOnly: true,
    tasks: [
      "Build a semantic landing page with accessible sections",
      "Create a responsive card grid using Flexbox and Grid",
      "Design a mobile-first hero section with reusable components",
    ],
  },
  {
    _id: "mock-beginner-python-foundations",
    title: "Python Foundations Lab",
    description: "Learn Python syntax, problem solving, and real-world scripting basics.",
    level: "Beginner",
    duration: "5 weeks",
    isCatalogOnly: true,
    tasks: [
      "Write functions for reusable grade calculations",
      "Parse CSV data and generate summary reports",
      "Create a CLI mini app with menu-driven actions",
    ],
  },
  {
    _id: "mock-intermediate-react-patterns",
    title: "React UI Patterns",
    description: "Build scalable React apps with state patterns and component architecture.",
    level: "Intermediate",
    duration: "6 weeks",
    isCatalogOnly: true,
    tasks: [
      "Implement reusable modal and drawer components",
      "Create dynamic form validation with controlled inputs",
      "Split a dashboard into reusable feature modules",
    ],
  },
  {
    _id: "mock-intermediate-db-design",
    title: "Database Design in Practice",
    description: "Model data efficiently and build robust query workflows for products.",
    level: "Intermediate",
    duration: "6 weeks",
    isCatalogOnly: true,
    tasks: [
      "Design entity relationships for an LMS schema",
      "Write aggregation queries for course progress analytics",
      "Optimize indexes for faster student dashboard loads",
    ],
  },
  {
    _id: "mock-advanced-system-design",
    title: "System Design Essentials",
    description: "Design scalable software systems with reliability and performance in mind.",
    level: "Advanced",
    duration: "8 weeks",
    isCatalogOnly: true,
    tasks: [
      "Draft a high-level architecture for a learning platform",
      "Design caching strategy for high-traffic course feeds",
      "Plan failover, monitoring, and alerting workflows",
    ],
  },
  {
    _id: "mock-advanced-cloud-security",
    title: "Cloud Security & DevSecOps",
    description: "Secure modern deployments with identity, secrets, and policy automation.",
    level: "Advanced",
    duration: "7 weeks",
    isCatalogOnly: true,
    tasks: [
      "Set up role-based access policy for microservices",
      "Configure secret rotation for environment credentials",
      "Integrate security scans in CI/CD release pipelines",
    ],
  },
];

const FILTER_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

const LEVEL_SECTION_META = [
  {
    key: "beginner",
    title: "Beginner Courses",
    subtitle: "Start with fundamentals and guided practical tasks.",
    accentClass: "from-emerald-500 to-teal-500",
    chipClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    key: "intermediate",
    title: "Intermediate Courses",
    subtitle: "Build stronger workflows with project-driven learning.",
    accentClass: "from-amber-500 to-orange-500",
    chipClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    key: "advanced",
    title: "Advanced Courses",
    subtitle: "Solve real engineering challenges with expert-level tracks.",
    accentClass: "from-rose-500 to-pink-500",
    chipClass: "border-rose-200 bg-rose-50 text-rose-800",
  },
];

const DEFAULT_LEVEL_TASKS = {
  beginner: [
    "Complete module checkpoint quiz",
    "Submit beginner practice assignment",
    "Review mentor feedback and improve output",
  ],
  intermediate: [
    "Build and submit milestone project",
    "Pass applied concepts assessment",
    "Document learning decisions in your notes",
  ],
  advanced: [
    "Implement production-style architecture task",
    "Complete advanced performance challenge",
    "Defend technical solution in review notes",
  ],
  general: [
    "Complete weekly learning checkpoint",
    "Submit practical task output",
    "Track outcomes in your progress board",
  ],
};

const getCourseLabel = (index) => `Course ${String(index + 1).padStart(2, "0")}`;

const getLevelBadgeClass = (level) => {
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

const getDurationValue = (duration) => {
  const match = String(duration || "").match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
};

const normalizeLevelKey = (level) => {
  const rawLevel = String(level || "").toLowerCase();
  if (rawLevel === "beginner" || rawLevel === "intermediate" || rawLevel === "advanced") {
    return rawLevel;
  }
  return "general";
};

const mergeWithPrivateShowcase = (baseCourses) => {
  const catalog = Array.isArray(baseCourses) ? baseCourses : [];
  const existingIds = new Set(
    catalog.map((course) => String(course?._id || course?.id || "").toLowerCase()).filter(Boolean)
  );
  const existingTitles = new Set(
    catalog.map((course) => String(course?.title || "").trim().toLowerCase()).filter(Boolean)
  );

  const additions = PRIVATE_SHOWCASE_COURSES.filter((course) => {
    const idKey = String(course._id || "").toLowerCase();
    const titleKey = String(course.title || "").trim().toLowerCase();
    return !existingIds.has(idKey) && !existingTitles.has(titleKey);
  });

  return [...catalog, ...additions];
};

const getCourseTasks = (course) => {
  if (Array.isArray(course?.tasks) && course.tasks.length > 0) {
    return course.tasks.slice(0, 4);
  }

  if (Array.isArray(course?.demo?.modules) && course.demo.modules.length > 0) {
    return course.demo.modules.slice(0, 3).map((module, index) => `Task ${index + 1}: ${module}`);
  }

  const levelKey = normalizeLevelKey(course?.level);
  return DEFAULT_LEVEL_TASKS[levelKey] || DEFAULT_LEVEL_TASKS.general;
};

export default function Courses({ isPublic = false }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [expandedDemoKey, setExpandedDemoKey] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLevel, setActiveLevel] = useState("All");

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
          const baseCatalog = isPublic ? (apiCourses.length ? apiCourses : MOCK_COURSES) : apiCourses;
          const nextCatalog = !isPublic ? mergeWithPrivateShowcase(baseCatalog) : baseCatalog;
          setCourses(nextCatalog);
        }
      } catch (error) {
        if (error?.response?.status === 401 && isPublic) {
          if (isMounted) {
            setCourses(MOCK_COURSES);
          }
          return;
        }

        if (isMounted) {
          const baseCatalog = isPublic ? MOCK_COURSES : [];
          const nextCatalog = !isPublic ? mergeWithPrivateShowcase(baseCatalog) : baseCatalog;
          setCourses(nextCatalog);
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

  const visibleCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      const level = String(course.level || "General");
      const title = String(course.title || "");
      const description = String(course.description || "");
      const matchesQuery =
        query.length === 0 ||
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query);
      const matchesLevel =
        !isPublic || activeLevel === "All" || level.toLowerCase() === activeLevel.toLowerCase();

      return matchesQuery && matchesLevel;
    });

    return filtered;
  }, [courses, searchQuery, activeLevel, isPublic]);

  const visibleCoursesByLevel = useMemo(() => {
    const grouped = {
      beginner: [],
      intermediate: [],
      advanced: [],
      general: [],
    };

    visibleCourses.forEach((course, displayIndex) => {
      const levelKey = normalizeLevelKey(course.level);
      grouped[levelKey].push({ course, displayIndex });
    });

    return grouped;
  }, [visibleCourses]);

  const privateSections = useMemo(() => {
    return LEVEL_SECTION_META.map((section) => ({
      ...section,
      items: visibleCoursesByLevel[section.key] || [],
    }));
  }, [visibleCoursesByLevel]);

  const analytics = useMemo(() => {
    const levelCounts = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      other: 0,
    };

    let totalWeeks = 0;
    let weeksCounted = 0;

    courses.forEach((course) => {
      const level = String(course.level || "").toLowerCase();
      if (level === "beginner") levelCounts.beginner += 1;
      else if (level === "intermediate") levelCounts.intermediate += 1;
      else if (level === "advanced") levelCounts.advanced += 1;
      else levelCounts.other += 1;

      const weeks = getDurationValue(course.duration);
      if (Number.isFinite(weeks)) {
        totalWeeks += weeks;
        weeksCounted += 1;
      }
    });

    const averageDuration = weeksCounted ? `${(totalWeeks / weeksCounted).toFixed(1)} weeks` : "Self-paced";
    const demoCount = courses.filter((course) => Boolean(course.isMock)).length;

    return {
      totalCount: courses.length,
      visibleCount: visibleCourses.length,
      enrolledCount: enrolled.length,
      demoCount,
      averageDuration,
      levelCounts,
    };
  }, [courses, visibleCourses.length, enrolled.length]);

  const toggleDemoSection = key => {
    setExpandedDemoKey(prev => (prev === key ? "" : key));
  };

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

  const renderCourseCard = (course, displayIndex) => {
    const courseId = course._id || course.id || `${course.title}-${displayIndex}`;
    const demoKey = `${courseId}-${displayIndex}`;
    const isEnrolled = enrolled.includes(courseId);
    const isMock = Boolean(course.isMock);
    const isCatalogOnly = Boolean(course.isCatalogOnly);
    const showDemoDetails = isPublic && isMock;
    const level = course.level || "General";
    const duration = course.duration || "Self-paced";
    const demoContent = course.demo;
    const isDemoOpen = expandedDemoKey === demoKey;
    const cardTheme = PUBLIC_CARD_THEMES[displayIndex % PUBLIC_CARD_THEMES.length];
    const courseTasks = getCourseTasks(course);

    const cardStyle = isPublic
      ? { borderColor: "rgba(17,24,39,0.72)", background: cardTheme.cardBackground }
      : {
          borderColor: "rgba(17,24,39,0.74)",
          background: `linear-gradient(160deg, rgba(255,255,255,0.95) 0%, ${cardTheme.demoBg} 100%)`,
        };
    const cardInlineStyle = { ...cardStyle, animationDelay: `${displayIndex * 0.07}s` };

    const demoTagStyle = isPublic
      ? {
          color: cardTheme.demoText,
          backgroundColor: cardTheme.demoBg,
          borderColor: cardTheme.demoBorder,
        }
      : {
          color: "#1d4ed8",
          backgroundColor: "rgba(219,234,254,0.88)",
          borderColor: "#93c5fd",
        };

    const blobStyle = isPublic
      ? { backgroundColor: cardTheme.blobColor }
      : { backgroundColor: "rgba(59,130,246,0.24)" };

    const topBarStyle = isPublic
      ? { background: cardTheme.topBarBackground }
      : { background: "linear-gradient(90deg,#0ea5e9,#2563eb,#4f46e5)" };

    const previewModules = Array.isArray(demoContent?.modules) ? demoContent.modules.slice(0, 2) : [];

    const demoButtonStyle = isPublic
      ? {
          boxShadow: "0 8px 20px -12px rgba(15,23,42,0.45)",
        }
      : {
          boxShadow: "0 10px 20px -14px rgba(146,64,14,0.5)",
        };

    return (
      <div
        key={courseId}
        className="group relative isolate overflow-hidden rounded-3xl border-2 p-5 md:p-6 backdrop-blur-md shadow-[0_26px_52px_-34px_rgba(15,23,42,0.75)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_35px_68px_-40px_rgba(14,116,144,0.8)] animate-fade-up"
        style={cardInlineStyle}
      >
        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-3xl"
          style={topBarStyle}
        />

        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-70"
          style={blobStyle}
        />

        <div className="pointer-events-none absolute inset-[7px] rounded-[1.2rem] border border-black/15" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <p className="inline-flex rounded-full border border-white/70 bg-white/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              {getCourseLabel(displayIndex)}
            </p>

            {showDemoDetails && (
              <span
                className="text-[10px] font-semibold uppercase tracking-wide border rounded-full px-2 py-1"
                style={demoTagStyle}
              >
                Demo
              </span>
            )}
          </div>

          <h3
            className="mt-3 pr-10 text-xl font-bold leading-tight text-slate-900"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {course.title || "Untitled Course"}
          </h3>

          <p className="mt-3 min-h-[68px] text-[0.96rem] leading-relaxed text-slate-700">
            {course.description || "Course description coming soon."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full border px-2.5 py-1 ${getLevelBadgeClass(level)}`}>{level}</span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-slate-700">
              {duration}
            </span>
          </div>

          {previewModules.length > 0 && (
            <div className="mt-4 rounded-2xl border border-cyan-100/80 bg-white/75 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Popular Modules</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {previewModules.map((module) => (
                  <span
                    key={module}
                    className="rounded-full border border-slate-200 bg-slate-50/90 px-2 py-1 text-[11px] text-slate-700"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          )}

          {courseTasks.length > 0 && (
            <div className="mt-4 rounded-2xl border border-emerald-100/80 bg-emerald-50/75 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">Task Sprint</p>
              <ul className="mt-2 space-y-1.5">
                {courseTasks.map((taskItem) => (
                  <li key={taskItem} className="flex items-start gap-2 text-sm text-emerald-900">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{taskItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto border-t border-black/15 pt-5">
            {showDemoDetails && (
              <>
                <button
                  onClick={() => toggleDemoSection(demoKey)}
                  className="w-full rounded-xl border border-black/50 bg-white/92 px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  style={demoButtonStyle}
                  aria-expanded={isDemoOpen}
                  aria-controls={`demo-content-${demoKey}`}
                >
                  {isDemoOpen ? "Hide Demo Content" : "View Demo Content"}
                </button>

                {isDemoOpen && demoContent && (
                  <div
                    id={`demo-content-${demoKey}`}
                    className="mt-3 rounded-xl border border-black/25 bg-white/80 p-3 text-sm text-slate-800"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Demo Content
                    </p>
                    <p className="mt-1 font-medium text-slate-900">{demoContent.summary}</p>
                    {Array.isArray(demoContent.modules) && (
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-700">
                        {demoContent.modules.map((module) => (
                          <li key={module}>{module}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-2 text-slate-700">
                      <span className="font-semibold text-slate-900">Mini Project:</span> {demoContent.project}
                    </p>
                  </div>
                )}
              </>
            )}

            {!user && (
              <button
                onClick={() => navigate("/login")}
                className={`group w-full rounded-xl border border-white/30 px-3 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 ${
                  isMock ? "mt-3" : ""
                }`}
                style={{
                  background: cardTheme.loginBackground,
                  boxShadow: cardTheme.loginShadow,
                }}
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5l5 5-5 5" />
                    </svg>
                  </span>
                </span>
              </button>
            )}

            {!isPublic && (isCatalogOnly || isMock) && user && (
              <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-sky-800">
                Catalog course
              </div>
            )}

            {!isMock && !isCatalogOnly && user && !isEnrolled && (
              <button
                onClick={() => enroll(courseId, false)}
                className="mt-4 w-full rounded-xl border border-emerald-700 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(5,150,105,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                Enroll
              </button>
            )}

            {isCatalogOnly && user && (
              <button
                disabled
                className="mt-4 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-500"
              >
                Enrollment opens soon
              </button>
            )}

            {!isMock && !isCatalogOnly && user && isEnrolled && (
              <button
                onClick={() => navigate(`/dashboard/quiz/${courseId}`)}
                className="mt-4 w-full rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2.5 text-sm font-semibold text-cyan-900 shadow-[0_10px_20px_-14px_rgba(14,116,144,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-100"
              >
                Start Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const rootClassName =
    "relative isolate min-h-[calc(100vh-170px)] overflow-hidden rounded-[2rem] border border-slate-200/70";

  if (isPublic && user) {
    return <Navigate to="/dashboard/courses" replace />;
  }

  const rootStyle = isPublic
    ? {
        fontFamily: "'Manrope', sans-serif",
        background:
          "radial-gradient(circle at 8% 9%, rgba(125,211,252,0.75) 0%, transparent 28%), radial-gradient(circle at 90% 12%, rgba(250,204,21,0.45) 0%, transparent 30%), radial-gradient(circle at 20% 92%, rgba(167,139,250,0.35) 0%, transparent 32%), linear-gradient(140deg, #eff8ff 0%, #f0f9ff 45%, #fef9e8 100%)",
      }
    : {
        fontFamily: "'Manrope', sans-serif",
        background:
          "radial-gradient(circle at 10% 8%, rgba(250,204,21,0.45) 0%, transparent 24%), radial-gradient(circle at 89% 14%, rgba(56,189,248,0.52) 0%, transparent 28%), radial-gradient(circle at 78% 84%, rgba(74,222,128,0.35) 0%, transparent 30%), linear-gradient(145deg,#fff8ee 0%,#fffef7 28%,#ecfeff 58%,#eef2ff 100%)",
      };

  const contentClassName = isPublic
    ? "relative mx-auto w-full max-w-7xl px-4 pb-14 pt-10 md:px-6 md:pb-16 md:pt-12"
    : "relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8 md:px-6 md:pb-14 md:pt-10";

  const levelBarData = [
    {
      label: "Beginner",
      count: analytics.levelCounts.beginner,
      barClass: "from-emerald-400 to-teal-500",
    },
    {
      label: "Intermediate",
      count: analytics.levelCounts.intermediate,
      barClass: "from-amber-400 to-orange-500",
    },
    {
      label: "Advanced",
      count: analytics.levelCounts.advanced,
      barClass: "from-rose-400 to-pink-500",
    },
  ];

  return (
    <div
      className={rootClassName}
      style={rootStyle}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.56)_0%,rgba(255,255,255,0.24)_36%,rgba(255,255,255,0.62)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.35)_1px,transparent_0)] [background-size:24px_24px]" />

      <div
        className={`pointer-events-none absolute -left-16 top-8 h-72 w-72 rounded-full blur-3xl ${
          isPublic ? "bg-cyan-300/45" : "bg-amber-300/35"
        } animate-drift-large`}
      />
      <div
        className={`pointer-events-none absolute -right-10 bottom-4 h-80 w-80 rounded-full blur-3xl ${
          isPublic ? "bg-indigo-300/35" : "bg-cyan-300/35"
        } animate-drift-medium`}
      />
      <div className="pointer-events-none absolute right-[10%] top-[16%] hidden h-28 w-28 rounded-full border border-white/45 bg-white/20 backdrop-blur-sm lg:block animate-spin-very-slow" />

      <div className={contentClassName}>
        <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-900 backdrop-blur-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-600 animate-pulse-soft" />
              {isPublic ? "Course Discovery Hub" : "Learning Control Room"}
            </p>

            <h2
              className="mt-4 text-4xl font-bold leading-[0.95] text-slate-900 md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Explore courses that feel
              <span className="block bg-gradient-to-r from-cyan-700 via-sky-700 to-indigo-800 bg-clip-text text-transparent">
                crafted for your momentum.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
              Browse structured tracks, compare levels quickly, and start from a catalog designed like a creative
              learning studio.
            </p>

            {!user && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-800">
                Demo mode active
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/75 bg-white/75 p-3 shadow-[0_20px_35px_-28px_rgba(15,23,42,0.9)] backdrop-blur">
                <p className="text-2xl font-extrabold text-slate-900">{analytics.totalCount}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Total Courses</p>
              </div>
              <div className="rounded-2xl border border-white/75 bg-white/75 p-3 shadow-[0_20px_35px_-28px_rgba(15,23,42,0.9)] backdrop-blur">
                <p className="text-2xl font-extrabold text-slate-900">{analytics.enrolledCount}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Enrolled</p>
              </div>
              <div className="rounded-2xl border border-white/75 bg-white/75 p-3 shadow-[0_20px_35px_-28px_rgba(15,23,42,0.9)] backdrop-blur">
                <p className="text-2xl font-extrabold text-slate-900">{analytics.demoCount}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Demo Tracks</p>
              </div>
              <div className="rounded-2xl border border-white/75 bg-white/75 p-3 shadow-[0_20px_35px_-28px_rgba(15,23,42,0.9)] backdrop-blur">
                <p className="text-2xl font-extrabold text-slate-900">{analytics.averageDuration}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Avg. Duration</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/80 bg-white/75 p-4 shadow-[0_26px_50px_-38px_rgba(2,6,23,0.95)] backdrop-blur-xl md:p-5">
              <div>
                <label className="relative block">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" className="h-4 w-4">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {isPublic &&
                  FILTER_LEVELS.map((level) => {
                    const isActive = activeLevel === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setActiveLevel(level)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                          isActive
                            ? "border-cyan-500 bg-cyan-500 text-white shadow-[0_12px_24px_-18px_rgba(6,182,212,0.85)]"
                            : "border-slate-200 bg-white/90 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}

                {(searchQuery || (isPublic && activeLevel !== "All")) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveLevel("All");
                    }}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="animate-fade-up-delayed">
            <div className="relative overflow-hidden rounded-[1.9rem] border border-white/80 bg-white/78 p-5 shadow-[0_35px_62px_-44px_rgba(2,6,23,0.95)] backdrop-blur-xl md:p-6">
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-6 h-44 w-44 rounded-full bg-amber-200/35 blur-3xl" />

              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-800">Live Snapshot</p>
                <h3
                  className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Learning Radar
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Distribution of courses by skill level to help you choose a balanced learning path.
                </p>

                <div className="mt-6 space-y-3">
                  {levelBarData.map((entry) => {
                    const percent = analytics.totalCount
                      ? Math.round((entry.count / analytics.totalCount) * 100)
                      : 0;
                    return (
                      <div key={entry.label}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <p className="font-semibold text-slate-800">{entry.label}</p>
                          <p className="font-bold text-slate-700">
                            {entry.count} ({percent}%)
                          </p>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-200/85">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${entry.barClass} animate-shimmer-track`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-800">Visible Now</p>
                    <p className="mt-1 text-2xl font-extrabold text-cyan-900">{analytics.visibleCount}</p>
                  </div>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-800">Catalog Size</p>
                    <p className="mt-1 text-2xl font-extrabold text-indigo-900">{analytics.totalCount}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-2 text-sm font-semibold text-emerald-800">
                  Tip: Mix one beginner and one intermediate course for faster skill growth.
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
            Showing {analytics.visibleCount} of {analytics.totalCount} courses
          </p>
          <p className="text-sm text-slate-600">
            {isPublic
              ? `${activeLevel === "All" ? "All levels" : `${activeLevel} level`} ${searchQuery ? "with your search query" : ""}`.trim()
              : `Sectioned by level ${searchQuery ? "with your search query" : ""}`.trim()}
          </p>
        </div>

        {visibleCourses.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-white/75 bg-white/80 p-8 text-center shadow-[0_28px_60px_-42px_rgba(15,23,42,0.95)] backdrop-blur">
            <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No courses match your filters
            </h3>
            <p className="mt-2 text-slate-600">Try another level, clear search terms, or switch sorting.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveLevel("All");
              }}
              className="mt-4 rounded-xl border border-cyan-500 bg-cyan-500 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-cyan-600"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {isPublic ? (
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleCourses.map((course, index) => renderCourseCard(course, index))}
              </div>
            ) : (
              <div className="mt-5 space-y-7">
                {privateSections.map((section) => (
                  <section
                    key={section.key}
                    className="rounded-3xl border border-white/70 bg-white/60 p-4 shadow-[0_24px_50px_-42px_rgba(15,23,42,0.95)] backdrop-blur md:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3
                          className="text-2xl font-bold text-slate-900"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {section.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">{section.subtitle}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${section.chipClass}`}>
                        {section.items.length} tracks
                      </span>
                    </div>

                    <div className={`mt-4 h-1.5 w-full rounded-full bg-gradient-to-r ${section.accentClass}`} />

                    {section.items.length === 0 ? (
                      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
                        No courses available in this section right now.
                      </div>
                    ) : (
                      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {section.items.map(({ course, displayIndex }) => renderCourseCard(course, displayIndex))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
