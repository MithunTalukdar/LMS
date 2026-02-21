import { useEffect, useMemo, useState } from "react";
import api from "../utils/axios";
import LoadingOverlay from "../components/LoadingOverlay";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "pass", label: "Pass" },
  { key: "fail", label: "Fail" },
];

const toStatusMeta = (statusValue) => {
  const status = String(statusValue || "").toLowerCase();

  if (status === "pass") {
    return {
      label: "Pass",
      chipClass: "border-emerald-200 bg-emerald-100 text-emerald-800",
    };
  }

  if (status === "fail") {
    return {
      label: "Fail",
      chipClass: "border-rose-200 bg-rose-100 text-rose-800",
    };
  }

  return {
    label: "Pending",
    chipClass: "border-amber-200 bg-amber-100 text-amber-800",
  };
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TeacherSubmissionInbox() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("pending");
  const [gradingKey, setGradingKey] = useState("");
  const [commentBySubmission, setCommentBySubmission] = useState({});

  const fetchInbox = async ({ showLoader = false } = {}) => {
    if (showLoader) setIsLoading(true);
    setError("");

    try {
      const res = await api.get("/tasks/teacher/submissions");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (fetchError) {
      setItems([]);
      setError(fetchError?.response?.data?.message || "Failed to load submission inbox");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox({ showLoader: true });
  }, []);

  const stats = useMemo(() => {
    const counts = {
      all: items.length,
      pending: 0,
      pass: 0,
      fail: 0,
    };

    items.forEach((item) => {
      const status = String(item.status || "pending").toLowerCase();
      if (status === "pass") counts.pass += 1;
      else if (status === "fail") counts.fail += 1;
      else counts.pending += 1;
    });

    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const status = String(item.status || "pending").toLowerCase();
      const matchesFilter = activeFilter === "all" || status === activeFilter;

      const haystack = [
        item.courseTitle,
        item.taskTitle,
        item.taskDescription,
        item.studentName,
        item.studentEmail,
        item.answer,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [items, searchQuery, activeFilter]);

  const handleGrade = async (item, status) => {
    const actionKey = `${item.taskId}:${item.submissionId}:${status}`;
    setGradingKey(actionKey);
    setError("");

    try {
      await api.post("/tasks/grade", {
        taskId: item.taskId,
        submissionId: item.submissionId,
        status,
        comment: commentBySubmission[item.submissionId] ?? item.comment ?? "",
      });
      await fetchInbox();
    } catch (gradeError) {
      setError(gradeError?.response?.data?.message || "Failed to grade submission");
    } finally {
      setGradingKey("");
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading submission inbox..." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr,auto,auto]">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by student, task, course, or answer..."
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          {filteredItems.length} shown
        </div>

        <button
          onClick={() => fetchInbox()}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          const labelWithCount =
            filter.key === "all"
              ? `${filter.label} (${stats.all})`
              : `${filter.label} (${stats[filter.key] || 0})`;

          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                isActive
                  ? "border-cyan-500 bg-cyan-500 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {labelWithCount}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center">
          <p className="text-sm font-semibold text-slate-700">No submitted tasks found.</p>
          <p className="mt-1 text-xs text-slate-500">
            Once students submit tasks, they will appear here for teacher pass/fail verification.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const statusMeta = toStatusMeta(item.status);

            return (
              <article
                key={`${item.taskId}-${item.submissionId}`}
                className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.studentName || "Unknown Student"}{" "}
                      <span className="font-medium text-slate-500">({item.studentEmail || "No email"})</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.courseTitle} • {item.taskTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">Submitted: {formatDate(item.submittedAt)}</p>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${statusMeta.chipClass}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Student Answer</p>
                  <p className="mt-1 max-h-16 overflow-hidden text-sm text-slate-700">
                    {item.answer || "No answer text"}
                  </p>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Teacher Comment (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={commentBySubmission[item.submissionId] ?? item.comment ?? ""}
                    onChange={(event) =>
                      setCommentBySubmission((prev) => ({
                        ...prev,
                        [item.submissionId]: event.target.value,
                      }))
                    }
                    placeholder="Add feedback for student..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleGrade(item, "pass")}
                    disabled={gradingKey === `${item.taskId}:${item.submissionId}:pass`}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => handleGrade(item, "fail")}
                    disabled={gradingKey === `${item.taskId}:${item.submissionId}:fail`}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Fail
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
