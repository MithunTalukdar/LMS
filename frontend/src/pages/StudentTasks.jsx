import { useEffect, useState } from "react";
import api from "../utils/axios";
import LoadingOverlay from "../components/LoadingOverlay";

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDeadline = value => {
  if (!value) return "No deadline set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Deadline unavailable";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const getStatusMeta = statusValue => {
  const status = String(statusValue || "").toLowerCase();

  if (status === "pass") {
    return {
      label: "Passed",
      chipClass: "border-emerald-200 bg-emerald-100 text-emerald-800",
      accentClass: "from-emerald-500 via-teal-500 to-cyan-500"
    };
  }

  if (status === "fail") {
    return {
      label: "Needs Revision",
      chipClass: "border-rose-200 bg-rose-100 text-rose-800",
      accentClass: "from-rose-500 via-red-500 to-orange-500"
    };
  }

  if (status === "pending") {
    return {
      label: "Pending Review",
      chipClass: "border-amber-200 bg-amber-100 text-amber-800",
      accentClass: "from-amber-500 via-orange-500 to-yellow-500"
    };
  }

  return {
    label: "Not Submitted",
    chipClass: "border-sky-200 bg-sky-100 text-sky-800",
    accentClass: "from-sky-500 via-cyan-500 to-blue-500"
  };
};

const getDeadlineMeta = (deadlineValue, statusValue) => {
  if (!deadlineValue) {
    return {
      label: "No deadline",
      className: "border-slate-200 bg-slate-100 text-slate-700"
    };
  }

  const deadline = new Date(deadlineValue);
  if (Number.isNaN(deadline.getTime())) {
    return {
      label: "Date unavailable",
      className: "border-slate-200 bg-slate-100 text-slate-700"
    };
  }

  if (String(statusValue || "").toLowerCase() === "pass") {
    return {
      label: "Completed on time",
      className: "border-emerald-200 bg-emerald-100 text-emerald-800"
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const diffDays = Math.round((due - today) / DAY_MS);

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return {
      label: `${days} day${days === 1 ? "" : "s"} overdue`,
      className: "border-rose-200 bg-rose-100 text-rose-800"
    };
  }

  if (diffDays === 0) {
    return {
      label: "Due today",
      className: "border-amber-200 bg-amber-100 text-amber-800"
    };
  }

  if (diffDays === 1) {
    return {
      label: "Due tomorrow",
      className: "border-orange-200 bg-orange-100 text-orange-800"
    };
  }

  return {
    label: `${diffDays} days left`,
    className: diffDays <= 3 ? "border-orange-200 bg-orange-100 text-orange-800" : "border-sky-200 bg-sky-100 text-sky-800"
  };
};

export default function StudentTasks({ courseId, onAllTasksPassed }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    completedTasks: 0,
    totalTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [draftAnswers, setDraftAnswers] = useState({});
  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [submitErrors, setSubmitErrors] = useState({});

  const syncTaskState = data => {
    const taskList = Array.isArray(data.tasks) ? data.tasks : [];
    setTasks(taskList);
    setStats({
      completedTasks: data.completedTasks || 0,
      totalTasks: data.totalTasks || 0
    });

    const allPassed =
      data.totalTasks > 0 &&
      data.completedTasks === data.totalTasks;

    if (onAllTasksPassed) {
      onAllTasksPassed(allPassed);
    }
  };

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);

    api
      .get(`/tasks/student/${courseId}`)
      .then(res => {
        syncTaskState(res.data || {});
      })
      .catch(() => {
        setTasks([]);
        setStats({ completedTasks: 0, totalTasks: 0 });
        if (onAllTasksPassed) onAllTasksPassed(false);
      })
      .finally(() => setLoading(false));
  }, [courseId, onAllTasksPassed]);

  const openAnswerPanel = taskId => {
    setOpenTaskId(taskId);
    setSubmitErrors(prev => ({ ...prev, [taskId]: "" }));
  };

  const closeAnswerPanel = taskId => {
    if (openTaskId === taskId) setOpenTaskId(null);
    setSubmitErrors(prev => ({ ...prev, [taskId]: "" }));
  };

  const handleAnswerChange = (taskId, value) => {
    setDraftAnswers(prev => ({ ...prev, [taskId]: value }));

    if (submitErrors[taskId]) {
      setSubmitErrors(prev => ({ ...prev, [taskId]: "" }));
    }
  };

  const submitTask = async taskId => {
    const answer = (draftAnswers[taskId] || "").trim();

    if (!answer) {
      setSubmitErrors(prev => ({
        ...prev,
        [taskId]: "Please enter your answer before submitting."
      }));
      return;
    }

    setSubmittingTaskId(taskId);

    try {
      await api.post("/tasks/submit", { taskId, answer });

      const res = await api.get(`/tasks/student/${courseId}`);
      syncTaskState(res.data || {});

      setOpenTaskId(null);
      setSubmitErrors(prev => ({ ...prev, [taskId]: "" }));
      setDraftAnswers(prev => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    } catch (err) {
      setSubmitErrors(prev => ({
        ...prev,
        [taskId]:
          err.response?.data?.message ||
          "Failed to submit task"
      }));
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const markAsRead = async taskId => {
    try {
      await api.put(`/tasks/${taskId}/read`);
      setTasks(prev =>
        prev.map(t => {
          if (t._id === taskId && t.submission) {
            return {
              ...t,
              submission: { ...t.submission, isViewed: true }
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = Math.max(stats.totalTasks - stats.completedTasks, 0);
  const completionPercent = stats.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
  const reviewCount = tasks.filter(
    task => String(task.submission?.status || "").toLowerCase() === "pending"
  ).length;

  if (loading) {
    return <LoadingOverlay message="Loading tasks..." />;
  }

  return (
    <section className="relative mb-6 overflow-hidden rounded-[1.9rem] border border-slate-200/80 p-5 shadow-[0_28px_62px_-40px_rgba(15,23,42,0.85)] md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(165,243,252,0.45)_0%,transparent_32%),radial-gradient(circle_at_92%_8%,rgba(253,224,71,0.2)_0%,transparent_34%),linear-gradient(150deg,#fcfeff_0%,#f3f9ff_48%,#f2fbf8_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.25)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute -left-10 top-6 h-36 w-36 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-2 h-36 w-36 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-900">
              <span className="h-2 w-2 rounded-full bg-cyan-600 animate-pulse-soft" />
              Task Workflow
            </p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Tasks Mission Board</h3>
            <p className="mt-2 text-sm text-slate-600">
              Complete assignments, track review status, and unlock your quiz faster.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2.5">
              <p className="text-xl font-extrabold text-emerald-900">{stats.completedTasks}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Done</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2.5">
              <p className="text-xl font-extrabold text-amber-900">{pendingCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Pending</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50/90 px-3 py-2.5">
              <p className="text-xl font-extrabold text-sky-900">{reviewCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">In Review</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>Completion Track</span>
            <span>{completionPercent}% complete</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-700"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-7 text-center">
            <p className="text-sm font-semibold text-slate-700">No tasks assigned yet.</p>
            <p className="mt-1 text-xs text-slate-500">New assignments will appear here automatically.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {tasks.map((task, index) => {
              const status = task.submission?.status;
              const statusMeta = getStatusMeta(status);
              const deadlineMeta = getDeadlineMeta(task.deadline, status);
              const deadlineLabel = formatDeadline(task.deadline);
              const isPanelOpen = openTaskId === task._id;
              const isSubmitting = submittingTaskId === task._id;

              return (
                <article
                  key={task._id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/85 bg-white/92 p-4 shadow-[0_20px_44px_-34px_rgba(15,23,42,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-34px_rgba(14,116,144,0.55)] md:p-5"
                >
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${statusMeta.accentClass}`} />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-200/30 blur-2xl transition-transform duration-300 group-hover:scale-110" />

                  <div className="relative flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[11px] font-bold text-slate-700">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-2xl font-bold tracking-tight text-slate-900">{task.title}</h4>
                          <p className="mt-1 text-sm leading-relaxed text-slate-700">{task.description}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                          Deadline: {deadlineLabel}
                        </span>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${deadlineMeta.className}`}>
                          {deadlineMeta.label}
                        </span>
                      </div>
                    </div>

                    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${statusMeta.chipClass}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  {status ? (
                    <div className="relative mt-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-medium text-slate-500">Submission status is tracked live.</p>
                        {task.submission?.isViewed === false && (
                          <button
                            onClick={() => markAsRead(task._id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                          >
                            <span>Mark as Read</span>
                          </button>
                        )}
                      </div>

                      {task.submission?.comment && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 text-sm">
                          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Teacher Feedback</p>
                          <p className="whitespace-pre-wrap text-slate-700">{task.submission.comment}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative mt-4">
                      <button
                        onClick={() => openAnswerPanel(task._id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(5,150,105,0.9)] transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                        </svg>
                        <span>Submit Task</span>
                      </button>

                      {isPanelOpen && (
                        <div className="mt-3 animate-fade-up rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5">
                          <label
                            htmlFor={`answer-${task._id}`}
                            className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-emerald-800"
                          >
                            Your answer
                          </label>
                          <textarea
                            id={`answer-${task._id}`}
                            value={draftAnswers[task._id] || ""}
                            onChange={e => handleAnswerChange(task._id, e.target.value)}
                            rows={4}
                            placeholder="Write your solution here..."
                            className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                          />

                          {submitErrors[task._id] && (
                            <p className="mt-2 text-sm font-medium text-rose-600">
                              {submitErrors[task._id]}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => submitTask(task._id)}
                              disabled={isSubmitting}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                            >
                              {isSubmitting ? "Submitting..." : "Send Answer"}
                            </button>
                            <button
                              onClick={() => closeAnswerPanel(task._id)}
                              disabled={isSubmitting}
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
