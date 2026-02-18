import { useEffect, useMemo, useState } from "react";
import api from "../utils/axios";
import TeacherTasks from "./TeacherTasks";
import TeacherAnalytics from "./TeacherAnalytics";
import TeacherQuiz from "./TeacherQuiz";
import TeacherQuizReview from "./TeacherQuizReview";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      setIsLoadingCourses(true);
      setCoursesError("");

      try {
        const res = await api.get("/courses");
        if (isMounted) {
          setCourses(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (isMounted) {
          setCourses([]);
          setCoursesError("Unable to load courses right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCourses(false);
        }
      }
    };

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCourseName = useMemo(() => {
    const found = courses.find((course) => course._id === selectedCourse);
    return found?.title || "";
  }, [courses, selectedCourse]);

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
        <div className="rounded-2xl border border-white/80 bg-white/82 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-600" />
                Teaching Workspace
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Teacher Panel
              </h2>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Manage tasks, quizzes, reviews, and analytics for your active course.
              </p>
            </div>

            <div className="w-full max-w-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Active Course
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={isLoadingCourses || courses.length === 0}
              >
                <option value="">{isLoadingCourses ? "Loading courses..." : "Select a Course"}</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {coursesError && <p className="mt-2 text-xs font-medium text-rose-600">{coursesError}</p>}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Courses Available</p>
              <p className="mt-1 text-2xl font-bold text-cyan-900">{courses.length}</p>
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Management Modules</p>
              <p className="mt-1 text-2xl font-bold text-violet-900">4</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Selected Course</p>
              <p className="mt-1 truncate text-sm font-bold text-emerald-900">
                {selectedCourseName || "None selected"}
              </p>
            </div>
          </div>
        </div>

        {!selectedCourse ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/85 p-8 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">No Course Selected</h3>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Choose a course from the dropdown to open task management, quiz creation, and analytics.
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
