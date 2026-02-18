import { useEffect, useState } from "react";
import api from "../utils/axios";

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

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/70 p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">Tasks</h3>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
          {stats.completedTasks}/{stats.totalTasks} completed
        </span>
      </div>

      {loading && (
        <p className="text-sm text-slate-500">Loading tasks...</p>
      )}

      {!loading && tasks.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
          No tasks assigned yet.
        </p>
      )}

      <div className="space-y-4">
        {tasks.map(task => {
          const status = task.submission?.status;
          const isPanelOpen = openTaskId === task._id;
          const isSubmitting = submittingTaskId === task._id;

          return (
            <div
              key={task._id}
              className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{task.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {task.description}
                  </p>

                  {task.deadline && (
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Deadline: {new Date(task.deadline).toDateString()}
                    </p>
                  )}
                </div>

                {status && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      status === "pass"
                        ? "bg-emerald-100 text-emerald-700"
                        : status === "fail"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {status}
                  </span>
                )}
              </div>

              {status ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-end">
                    {task.submission?.isViewed === false && (
                      <button
                        onClick={() => markAsRead(task._id)}
                        className="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>

                  {task.submission?.comment && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                      <p className="mb-1 font-semibold text-slate-800">Teacher Feedback</p>
                      <p className="whitespace-pre-wrap text-slate-600">{task.submission.comment}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    onClick={() => openAnswerPanel(task._id)}
                    className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
                  >
                    Submit Task
                  </button>

                  {isPanelOpen && (
                    <div className="mt-3 animate-fade-up rounded-xl border border-emerald-200 bg-emerald-50/85 p-3">
                      <label
                        htmlFor={`answer-${task._id}`}
                        className="mb-1 block text-sm font-semibold text-emerald-900"
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
