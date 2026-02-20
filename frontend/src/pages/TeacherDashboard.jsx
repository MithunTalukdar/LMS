import { useEffect, useMemo, useState } from "react";
import api from "../utils/axios";
import TeacherTasks from "./TeacherTasks";
import TeacherAnalytics from "./TeacherAnalytics";
import TeacherQuiz from "./TeacherQuiz";
import TeacherQuizReview from "./TeacherQuizReview";

const LEVEL_SECTIONS = [
  {
    key: "beginner",
    title: "Beginner Courses",
    subtitle: "Foundational tracks with guided topics.",
    chipClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    accentClass: "from-emerald-500 to-teal-500",
  },
  {
    key: "intermediate",
    title: "Intermediate Courses",
    subtitle: "Project-focused learning with stronger workflows.",
    chipClass: "border-amber-200 bg-amber-50 text-amber-800",
    accentClass: "from-amber-500 to-orange-500",
  },
  {
    key: "advanced",
    title: "Advanced Courses",
    subtitle: "High-impact modules for expert-level outcomes.",
    chipClass: "border-rose-200 bg-rose-50 text-rose-800",
    accentClass: "from-rose-500 to-pink-500",
  },
];

const createInitialCourseDraft = () => ({
  title: "",
  description: "",
  level: "Beginner",
  duration: "6 weeks",
  topics: [],
  tasks: [],
});

const normalizeLevelKey = (level) => {
  const raw = String(level || "").trim().toLowerCase();
  if (raw === "beginner") return "beginner";
  if (raw === "intermediate") return "intermediate";
  if (raw === "advanced") return "advanced";
  return "other";
};

const normalizeList = (items) =>
  Array.isArray(items)
    ? [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))]
    : [];

const mergeUniqueItems = (baseItems, incomingItems) =>
  [...new Set([...(Array.isArray(baseItems) ? baseItems : []), ...(Array.isArray(incomingItems) ? incomingItems : [])])];

const matchAnyItem = (items, target) => {
  const cleanTarget = String(target || "").trim().toLowerCase();
  if (!cleanTarget) return false;
  return items.some((item) => String(item || "").trim().toLowerCase() === cleanTarget);
};

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [coursesError, setCoursesError] = useState("");

  const [draftCourse, setDraftCourse] = useState(createInitialCourseDraft);
  const [topicDraft, setTopicDraft] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [titleHint, setTitleHint] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const [topicInputByCourse, setTopicInputByCourse] = useState({});
  const [isAddingTopicByCourse, setIsAddingTopicByCourse] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      setCoursesError("");

      try {
        const res = await api.get("/courses/teacher");
        if (isMounted) {
          setCourses(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        try {
          const fallback = await api.get("/courses");
          if (isMounted) {
            setCourses(Array.isArray(fallback.data) ? fallback.data : []);
            setCoursesError("Showing available courses. Teacher-only filter is not available right now.");
          }
        } catch {
          if (isMounted) {
            setCourses([]);
            setCoursesError("Unable to load courses right now.");
          }
        }
      }
    };

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const exists = courses.some((course) => course._id === selectedCourse);
    if (!exists) {
      setSelectedCourse("");
    }
  }, [courses, selectedCourse]);

  const selectedCourseName = useMemo(() => {
    const found = courses.find((course) => course._id === selectedCourse);
    return found?.title || "";
  }, [courses, selectedCourse]);

  const courseTitleOptions = useMemo(() => {
    return [...new Set(courses.map((course) => String(course.title || "").trim()).filter(Boolean))];
  }, [courses]);

  const matchedTitleCourse = useMemo(() => {
    const titleKey = String(draftCourse.title || "").trim().toLowerCase();
    if (!titleKey) return null;
    return courses.find((course) => String(course.title || "").trim().toLowerCase() === titleKey) || null;
  }, [courses, draftCourse.title]);

  const suggestedTopicOptions = useMemo(() => {
    if (matchedTitleCourse) {
      return normalizeList(matchedTitleCourse.topics);
    }

    return normalizeList(courses.flatMap((course) => normalizeList(course.topics)));
  }, [courses, matchedTitleCourse]);

  const groupedCourses = useMemo(() => {
    const grouped = {
      beginner: [],
      intermediate: [],
      advanced: [],
      other: [],
    };

    courses.forEach((course) => {
      const key = normalizeLevelKey(course.level);
      grouped[key].push(course);
    });

    return grouped;
  }, [courses]);

  const analytics = useMemo(() => {
    const totalTopics = courses.reduce((sum, course) => sum + normalizeList(course.topics).length, 0);
    const totalTasks = courses.reduce((sum, course) => sum + normalizeList(course.tasks).length, 0);

    return {
      totalCourses: courses.length,
      beginner: groupedCourses.beginner.length,
      intermediate: groupedCourses.intermediate.length,
      advanced: groupedCourses.advanced.length,
      totalTopics,
      totalTasks,
    };
  }, [courses, groupedCourses]);

  const handleDraftTitleChange = (value) => {
    const nextTitle = String(value || "");
    const titleKey = nextTitle.trim().toLowerCase();
    const matchedCourse =
      courses.find((course) => String(course.title || "").trim().toLowerCase() === titleKey) || null;

    if (!matchedCourse) {
      setDraftCourse((prev) => ({ ...prev, title: nextTitle }));
      setTitleHint("");
      return;
    }

    const matchedTopics = normalizeList(matchedCourse.topics);
    const matchedTasks = normalizeList(matchedCourse.tasks);

    setDraftCourse((prev) => ({
      ...prev,
      title: nextTitle,
      description: prev.description || String(matchedCourse.description || ""),
      level: matchedCourse.level || prev.level,
      duration: matchedCourse.duration || prev.duration,
      topics: mergeUniqueItems(prev.topics, matchedTopics),
      tasks: mergeUniqueItems(prev.tasks, matchedTasks),
    }));

    setTitleHint("Loaded available topics from selected course title.");
  };

  const addDraftTopicValue = (value) => {
    const cleanTopic = String(value || "").trim();
    if (!cleanTopic) return;

    setDraftCourse((prev) => {
      if (matchAnyItem(prev.topics, cleanTopic)) {
        return prev;
      }

      return {
        ...prev,
        topics: [...prev.topics, cleanTopic],
      };
    });
    setTopicDraft("");
  };

  const addDraftTopic = () => {
    addDraftTopicValue(topicDraft);
  };

  const addDraftTask = () => {
    const cleanTask = taskDraft.trim();
    if (!cleanTask) return;

    if (matchAnyItem(draftCourse.tasks, cleanTask)) {
      setTaskDraft("");
      return;
    }

    setDraftCourse((prev) => ({
      ...prev,
      tasks: [...prev.tasks, cleanTask],
    }));
    setTaskDraft("");
  };

  const removeDraftTopic = (index) => {
    setDraftCourse((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, topicIndex) => topicIndex !== index),
    }));
  };

  const removeDraftTask = (index) => {
    setDraftCourse((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, taskIndex) => taskIndex !== index),
    }));
  };

  const createCourse = async (event) => {
    event.preventDefault();
    if (isCreatingCourse) return;

    setCreateError("");
    setCreateSuccess("");

    const title = draftCourse.title.trim();
    const description = draftCourse.description.trim();
    const duration = draftCourse.duration.trim();

    if (!title || !description) {
      setCreateError("Course title and description are required.");
      return;
    }

    if (draftCourse.topics.length === 0) {
      setCreateError("Add at least one topic to create a proper sectioned course.");
      return;
    }

    setIsCreatingCourse(true);

    try {
      const payload = {
        title,
        description,
        level: draftCourse.level,
        duration: duration || "Self-paced",
        topics: normalizeList(draftCourse.topics),
        tasks: normalizeList(draftCourse.tasks),
      };

      const { data } = await api.post("/courses", payload);
      setCourses((prev) => [data, ...prev]);
      setSelectedCourse(data?._id || "");
      setDraftCourse(createInitialCourseDraft());
      setTopicDraft("");
      setTaskDraft("");
      setTitleHint("");
      setCreateSuccess("Course created successfully.");
    } catch (error) {
      setCreateError(error?.response?.data?.message || "Failed to create course.");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const addTopicToCourse = async (courseId) => {
    const topic = String(topicInputByCourse[courseId] || "").trim();
    if (!topic) return;

    setIsAddingTopicByCourse((prev) => ({ ...prev, [courseId]: true }));
    setCoursesError("");

    try {
      const { data } = await api.post(`/courses/${courseId}/topics`, { topic });
      setCourses((prev) => prev.map((course) => (course._id === courseId ? data : course)));
      setTopicInputByCourse((prev) => ({ ...prev, [courseId]: "" }));
    } catch (error) {
      setCoursesError(error?.response?.data?.message || "Failed to add topic.");
    } finally {
      setIsAddingTopicByCourse((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const renderCourseCard = (course) => {
    const topics = normalizeList(course.topics);
    const tasks = normalizeList(course.tasks);
    const levelLabel = String(course.level || "General");
    const isActive = selectedCourse === course._id;

    return (
      <article
        key={course._id}
        className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.75)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold text-slate-900">{course.title || "Untitled Course"}</h4>
            <p className="mt-1 text-sm text-slate-600">{course.description || "No description provided."}</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {levelLabel}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800">
            {course.duration || "Self-paced"}
          </span>
          <button
            onClick={() => setSelectedCourse(course._id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              isActive
                ? "border-cyan-500 bg-cyan-500 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {isActive ? "Active Course" : "Use in Panel"}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topics</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topics.length > 0 ? (
              topics.map((topic) => (
                <span key={`${course._id}-topic-${topic}`} className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800">
                  {topic}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No topics yet.</span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tasks</p>
          {tasks.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {tasks.slice(0, 4).map((task, index) => (
                <li key={`${course._id}-task-${task}`} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  {index + 1}. {task}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-500">No tasks added yet.</p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Add topic to this course"
            value={topicInputByCourse[course._id] || ""}
            onChange={(event) =>
              setTopicInputByCourse((prev) => ({
                ...prev,
                [course._id]: event.target.value,
              }))
            }
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
          <button
            onClick={() => addTopicToCourse(course._id)}
            disabled={Boolean(isAddingTopicByCourse[course._id])}
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:from-cyan-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isAddingTopicByCourse[course._id] ? "Adding..." : "Add"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-4 md:p-6"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 10% 8%, #bfdbfe 0%, transparent 30%), radial-gradient(circle at 88% 10%, #a7f3d0 0%, transparent 30%), linear-gradient(145deg,#f8fafc 0%,#eff6ff 52%,#ecfdf5 100%)",
      }}
    >
      <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-cyan-300/35 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-14 bottom-8 h-48 w-48 rounded-full bg-indigo-300/30 blur-3xl animate-float-slow-delayed" />

      <div className="relative">
        <section className="rounded-2xl border border-white/80 bg-white/82 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-600" />
              Teaching Workspace
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Teacher Panel
            </h2>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Build courses by level, add topics, and run tasks, quizzes, and analytics from one panel.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">My Courses</p>
              <p className="mt-1 text-2xl font-bold text-cyan-900">{analytics.totalCourses}</p>
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Total Topics</p>
              <p className="mt-1 text-2xl font-bold text-violet-900">{analytics.totalTopics}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Total Tasks</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{analytics.totalTasks}</p>
            </div>
          </div>

          {coursesError && <p className="mt-3 text-sm font-medium text-rose-600">{coursesError}</p>}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white/88 p-5 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Create Course</h3>
            <p className="mt-1 text-sm text-slate-600">
              Add a course to Beginner, Intermediate, or Advanced section with topics and tasks.
            </p>

            {createError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {createSuccess}
              </div>
            )}

            <form onSubmit={createCourse} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Course title"
                list="teacher-course-title-options"
                value={draftCourse.title}
                onChange={(event) => handleDraftTitleChange(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
              <datalist id="teacher-course-title-options">
                {courseTitleOptions.map((title) => (
                  <option key={`title-option-${title}`} value={title} />
                ))}
              </datalist>
              <p className="text-xs text-slate-500">
                Select an existing course title from popup suggestions, or type a new title.
              </p>
              {titleHint && (
                <p className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800">
                  {titleHint}
                </p>
              )}

              <textarea
                placeholder="Course description"
                value={draftCourse.description}
                onChange={(event) => setDraftCourse((prev) => ({ ...prev, description: event.target.value }))}
                rows="3"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={draftCourse.level}
                  onChange={(event) => setDraftCourse((prev) => ({ ...prev, level: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <input
                  type="text"
                  placeholder="Duration (example: 6 weeks)"
                  value={draftCourse.duration}
                  onChange={(event) => setDraftCourse((prev) => ({ ...prev, duration: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/85 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Topics</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr,auto]">
                  <input
                    type="text"
                    value={topicDraft}
                    onChange={(event) => setTopicDraft(event.target.value)}
                    list="teacher-topic-options"
                    placeholder="Add topic"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                  <button
                    type="button"
                    onClick={addDraftTopic}
                    className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
                  >
                    Add
                  </button>
                </div>
                <datalist id="teacher-topic-options">
                  {suggestedTopicOptions.map((topic) => (
                    <option key={`topic-list-${topic}`} value={topic} />
                  ))}
                </datalist>

                {matchedTitleCourse && suggestedTopicOptions.length > 0 && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Available topics from "{matchedTitleCourse.title}"
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {suggestedTopicOptions.slice(0, 8).map((topic) => (
                        <button
                          key={`suggestion-chip-${topic}`}
                          type="button"
                          onClick={() => addDraftTopicValue(topic)}
                          className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
                        >
                          + {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {draftCourse.topics.map((topic, index) => (
                    <button
                      type="button"
                      key={`draft-topic-${topic}-${index}`}
                      onClick={() => removeDraftTopic(index)}
                      className="rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-900"
                    >
                      {topic} x
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/85 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Tasks (optional)</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={taskDraft}
                    onChange={(event) => setTaskDraft(event.target.value)}
                    placeholder="Add task"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                  <button
                    type="button"
                    onClick={addDraftTask}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {draftCourse.tasks.map((task, index) => (
                    <button
                      type="button"
                      key={`draft-task-${task}-${index}`}
                      onClick={() => removeDraftTask(index)}
                      className="rounded-full border border-indigo-200 bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-900"
                    >
                      {task} x
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingCourse}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:from-cyan-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCreatingCourse ? "Creating..." : "Create Course"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/88 p-5 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Level Distribution</h3>
            <p className="mt-1 text-sm text-slate-600">Your courses are automatically sectioned by level.</p>

            <div className="mt-4 space-y-3">
              {LEVEL_SECTIONS.map((section) => {
                const count = analytics[section.key];
                return (
                  <div key={`level-stats-${section.key}`} className="rounded-xl border border-slate-200 bg-slate-50/85 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{section.title}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${section.chipClass}`}>
                        {count}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${section.accentClass}`}
                        style={{
                          width:
                            analytics.totalCourses > 0
                              ? `${Math.max(8, Math.round((count / analytics.totalCourses) * 100))}%`
                              : "8%",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/85 p-3">
              <p className="text-sm text-slate-700">
                Active panel course:{" "}
                <span className="font-semibold text-slate-900">{selectedCourseName || "None selected"}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-5">
          {LEVEL_SECTIONS.map((section) => {
            const coursesInSection = groupedCourses[section.key];

            return (
              <div key={`section-${section.key}`} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 md:text-xl">{section.title}</h3>
                    <p className="text-sm text-slate-600">{section.subtitle}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${section.chipClass}`}>
                    {coursesInSection.length} course(s)
                  </span>
                </div>

                <div className={`mt-3 h-1 w-full rounded-full bg-gradient-to-r ${section.accentClass}`} />

                {coursesInSection.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                    No course in this section yet. Create one from the form above.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {coursesInSection.map((course) => renderCourseCard(course))}
                  </div>
                )}
              </div>
            );
          })}

          {groupedCourses.other.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
              <h3 className="text-lg font-bold text-slate-900 md:text-xl">General Courses</h3>
              <p className="text-sm text-slate-600">Courses without a recognized level.</p>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {groupedCourses.other.map((course) => renderCourseCard(course))}
              </div>
            </div>
          )}
        </section>

        {!selectedCourse ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/85 p-8 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">No Course Selected</h3>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Select a course to manage tasks, quizzes, review attempts, and analytics.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white/88 p-4 shadow-sm md:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-slate-900 md:text-xl">Task Management</h3>
                <span className="inline-flex rounded-full border border-sky-200 bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-900">
                  Assign, Review, Grade
                </span>
              </div>
              <TeacherTasks courseId={selectedCourse} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/88 p-4 shadow-sm md:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-slate-900 md:text-xl">Quiz Management</h3>
                <span className="inline-flex rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-900">
                  Create and Maintain Questions
                </span>
              </div>
              <TeacherQuiz courseId={selectedCourse} />
            </section>

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/88 p-4 shadow-sm md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 md:text-xl">Quiz Review</h3>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                    Attempts
                  </span>
                </div>
                <TeacherQuizReview courseId={selectedCourse} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/88 p-4 shadow-sm md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 md:text-xl">Analytics</h3>
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                    Performance Insights
                  </span>
                </div>
                <TeacherAnalytics courseId={selectedCourse} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
