import { useEffect, useMemo, useState } from "react";
import api from "../utils/axios";
import LoadingOverlay from "../components/LoadingOverlay";

const SUBMISSION_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "pass", label: "Verified" },
  { key: "fail", label: "Revision" },
];

const toStatusMeta = (statusValue) => {
  const status = String(statusValue || "").toLowerCase();

  if (status === "pass") {
    return {
      label: "Verified",
      chipClass: "border-emerald-200 bg-emerald-100 text-emerald-800",
    };
  }

  if (status === "fail") {
    return {
      label: "Needs Revision",
      chipClass: "border-rose-200 bg-rose-100 text-rose-800",
    };
  }

  return {
    label: "Pending Review",
    chipClass: "border-amber-200 bg-amber-100 text-amber-800",
  };
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDeadline = (value) => {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function TeacherTasks({ courseId }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [comment, setComment] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isSavingTask, setIsSavingTask] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubmissionFilter, setActiveSubmissionFilter] = useState("all");
  const [activeGradeAction, setActiveGradeAction] = useState("");

  const fetchTasks = async ({ showLoader = false } = {}) => {
    if (!courseId) return;

    if (showLoader) {
      setIsLoading(true);
    }

    setError("");

    try {
      const res = await api.get(`/tasks/teacher/${courseId}`);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (fetchError) {
      setTasks([]);
      setError(fetchError?.response?.data?.message || "Failed to fetch tasks");
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!courseId) {
      setTasks([]);
      setIsLoading(false);
      setError("");
      return;
    }

    fetchTasks({ showLoader: true });
  }, [courseId]);

  const verificationStats = useMemo(() => {
    const counters = {
      totalSubmissions: 0,
      pending: 0,
      pass: 0,
      fail: 0,
    };

    tasks.forEach((task) => {
      const submissions = Array.isArray(task.submissions) ? task.submissions : [];
      submissions.forEach((submission) => {
        counters.totalSubmissions += 1;
        const status = String(submission.status || "pending").toLowerCase();
        if (status === "pass") counters.pass += 1;
        else if (status === "fail") counters.fail += 1;
        else counters.pending += 1;
      });
    });

    return counters;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks
      .map((task) => {
        const submissions = Array.isArray(task.submissions) ? [...task.submissions] : [];

        submissions.sort((a, b) => {
          const rank = (value) => {
            const status = String(value || "").toLowerCase();
            if (status === "pending") return 0;
            if (status === "fail") return 1;
            if (status === "pass") return 2;
            return 3;
          };

          const byStatus = rank(a.status) - rank(b.status);
          if (byStatus !== 0) return byStatus;

          const byDate = new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
          return byDate;
        });

        const visibleSubmissions =
          activeSubmissionFilter === "all"
            ? submissions
            : submissions.filter((submission) => String(submission.status || "pending").toLowerCase() === activeSubmissionFilter);

        return {
          ...task,
          visibleSubmissions,
        };
      })
      .filter((task) => {
        const title = String(task.title || "").toLowerCase();
        const description = String(task.description || "").toLowerCase();
        const matchesSearch = !query || title.includes(query) || description.includes(query);

        if (!matchesSearch) return false;

        if (activeSubmissionFilter === "all") {
          return true;
        }

        return task.visibleSubmissions.length > 0;
      });
  }, [tasks, searchQuery, activeSubmissionFilter]);

  const handleSaveTask = async (event) => {
    event.preventDefault();
    if (isSavingTask) return;

    setIsSavingTask(true);
    setError("");

    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, newTask);
      } else {
        await api.post("/tasks", { ...newTask, courseId });
      }

      setShowCreateForm(false);
      setNewTask({ title: "", description: "", deadline: "" });
      setEditingTaskId(null);
      await fetchTasks();
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Failed to save task");
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleEditClick = (task) => {
    setNewTask({
      title: task.title || "",
      description: task.description || "",
      deadline: task.deadline ? String(task.deadline).split("T")[0] : "",
    });
    setEditingTaskId(task._id);
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = async (taskId) => {
    if (!window.confirm("Delete this task? Student progress may be affected.")) return;

    setError("");

    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks();
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || "Failed to delete task");
    }
  };

  const handleGrade = async (taskId, submissionId, status, providedComment = comment) => {
    const actionKey = `${taskId}:${submissionId}:${status}`;
    setActiveGradeAction(actionKey);
    setError("");

    try {
      await api.post("/tasks/grade", {
        taskId,
        submissionId,
        status,
        comment: providedComment,
      });

      setComment("");
      setSelectedSubmission(null);
      await fetchTasks();
    } catch (gradeError) {
      setError(gradeError?.response?.data?.message || "Failed to verify submission");
    } finally {
      setActiveGradeAction("");
    }
  };

  const openReviewModal = (task, submission) => {
    setComment(submission.comment || "");
    setSelectedSubmission({ task, submission });
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading teacher verification panel..." />;
  }

  if (!courseId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-slate-700">Select a course to open the verification panel.</p>
        <p className="mt-1 text-xs text-slate-500">
          After students submit tasks, you can verify each submission here and unlock their next stage.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/92 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-900">
              <span className="h-2 w-2 rounded-full bg-cyan-600" />
              Verification Flow
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">Teacher Task Verification Panel</h2>
            <p className="mt-1 text-sm text-slate-600">
              Verify submissions to unlock each student&apos;s next stage. Quiz access opens only after all tasks are verified.
            </p>
          </div>

          <button
            onClick={() => {
              setShowCreateForm((prev) => !prev);
              setEditingTaskId(null);
              setNewTask({ title: "", description: "", deadline: "" });
            }}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700"
          >
            {showCreateForm ? "Close Form" : "Create Task"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/85 px-3 py-2.5">
            <p className="text-lg font-extrabold text-slate-900">{verificationStats.totalSubmissions}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Submissions</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/85 px-3 py-2.5">
            <p className="text-lg font-extrabold text-amber-900">{verificationStats.pending}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Pending</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/85 px-3 py-2.5">
            <p className="text-lg font-extrabold text-emerald-900">{verificationStats.pass}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Verified</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/85 px-3 py-2.5">
            <p className="text-lg font-extrabold text-rose-900">{verificationStats.fail}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700">Revision</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {showCreateForm && (
          <form onSubmit={handleSaveTask} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/85 p-4">
            <h3 className="text-sm font-semibold text-slate-700">
              {editingTaskId ? "Edit Task Details" : "Create New Task"}
            </h3>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Task Title</label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
              <textarea
                required
                rows={3}
                value={newTask.description}
                onChange={(event) => setNewTask({ ...newTask, description: event.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Deadline</label>
              <input
                type="date"
                required
                value={newTask.deadline}
                onChange={(event) => setNewTask({ ...newTask, deadline: event.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingTask}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingTask ? "Saving..." : editingTaskId ? "Update Task" : "Publish Task"}
            </button>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/92 p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr,auto]">
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {filteredTasks.length} task(s)
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUBMISSION_FILTERS.map((filter) => {
            const isActive = activeSubmissionFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveSubmissionFilter(filter.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                  isActive
                    ? "border-cyan-500 bg-cyan-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </section>

      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/88 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">No tasks found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <article key={task._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Deadline: {formatDeadline(task.deadline)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(task._id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/75 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Student Submissions ({task.visibleSubmissions.length})
                </p>

                {task.visibleSubmissions.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">No submissions in this filter.</p>
                ) : (
                  <div className="mt-3 space-y-2.5">
                    {task.visibleSubmissions.map((submission) => {
                      const meta = toStatusMeta(submission.status);
                      const previewText = String(submission.answer || "").trim();

                      return (
                        <div
                          key={submission._id}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {submission.studentId?.name || "Unknown Student"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {submission.studentId?.email || "No email"} • {formatDate(submission.submittedAt)}
                              </p>
                            </div>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${meta.chipClass}`}
                            >
                              {meta.label}
                            </span>
                          </div>

                          <p className="mt-2 max-h-10 overflow-hidden text-sm text-slate-700">
                            {previewText || "No answer text provided."}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => openReviewModal(task, submission)}
                              className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                              {submission.status === "pending" ? "Review & Verify" : "View Review"}
                            </button>

                            {String(submission.status || "").toLowerCase() === "pending" && (
                              <>
                                <button
                                  onClick={() => handleGrade(task._id, submission._id, "fail", submission.comment || "")}
                                  disabled={activeGradeAction === `${task._id}:${submission._id}:fail`}
                                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  Mark Revision
                                </button>
                                <button
                                  onClick={() => handleGrade(task._id, submission._id, "pass", submission.comment || "")}
                                  disabled={activeGradeAction === `${task._id}:${submission._id}:pass`}
                                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  Verify Task
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_40px_100px_-50px_rgba(15,23,42,0.95)]">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute right-4 top-4 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>

            <h3 className="text-xl font-bold text-slate-900">Review Submission</h3>
            <p className="mt-1 text-sm text-slate-600">
              Student:{" "}
              <span className="font-semibold text-slate-800">
                {selectedSubmission.submission.studentId?.name || "Unknown Student"}
              </span>
            </p>
            <p className="text-xs text-slate-500">{formatDate(selectedSubmission.submission.submittedAt)}</p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Answer</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {selectedSubmission.submission.answer || "No answer text provided."}
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Teacher Feedback
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Explain what is correct and what should be improved."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <p className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800">
              Verified tasks count toward student progress. When all course tasks are verified, quiz unlocks automatically.
            </p>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                onClick={() =>
                  handleGrade(selectedSubmission.task._id, selectedSubmission.submission._id, "fail", comment)
                }
                disabled={Boolean(activeGradeAction)}
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Needs Revision
              </button>
              <button
                onClick={() =>
                  handleGrade(selectedSubmission.task._id, selectedSubmission.submission._id, "pass", comment)
                }
                disabled={Boolean(activeGradeAction)}
                className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Verify & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
