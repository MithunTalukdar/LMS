import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";

const CARD_THEMES = [
  {
    border: "#22d3ee",
    glow: "rgba(34,211,238,0.30)",
    badge: "bg-cyan-100 text-cyan-900 border-cyan-200",
    button: "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
  },
  {
    border: "#a78bfa",
    glow: "rgba(167,139,250,0.30)",
    badge: "bg-violet-100 text-violet-900 border-violet-200",
    button: "from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
  },
  {
    border: "#34d399",
    glow: "rgba(52,211,153,0.30)",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
    button: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
  },
];

const formatIssuedDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Certificate() {
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCertificates = async () => {
      if (!user?._id) {
        if (isMounted) {
          setCerts([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await api.get("/certificates");
        if (isMounted) {
          setCerts(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load certificates right now.");
          setCerts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCertificates();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-5 md:p-7"
      style={{
        fontFamily: "'Sora', sans-serif",
        background:
          "radial-gradient(circle at 12% 8%, #bfdbfe 0%, transparent 30%), radial-gradient(circle at 88% 10%, #fde68a 0%, transparent 32%), linear-gradient(145deg,#f8fafc 0%,#eff6ff 55%,#fffbeb 100%)",
      }}
    >
      <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-sky-300/35 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl animate-float-slow-delayed" />

      <div className="relative">
        <div className="rounded-2xl border border-white/80 bg-white/82 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-600" />
                Achievement Vault
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                My Certificates
              </h2>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Download and showcase your course completion certificates.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-sm shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Earned</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{certs.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 text-sm text-slate-600 shadow-sm">
              Loading your certificates...
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {!isLoading && !error && certs.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">No Certificates Yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Complete all required tasks in your courses to unlock certificates.
              </p>
              <Link
                to="/dashboard/progress"
                className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Check My Progress
              </Link>
            </div>
          )}

          {!isLoading && !error && certs.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {certs.map((cert, index) => {
                const theme = CARD_THEMES[index % CARD_THEMES.length];
                const courseTitle = cert.courseId?.title || "Course Certificate";

                return (
                  <div
                    key={cert._id}
                    className="group relative overflow-hidden rounded-2xl border p-5 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.55)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-34px_rgba(37,99,235,0.45)]"
                    style={{
                      borderColor: theme.border,
                      background:
                        "linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_100%)",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition group-hover:scale-110"
                      style={{ background: theme.glow }}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${theme.badge}`}>
                          Verified
                        </span>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {formatIssuedDate(cert.issuedAt)}
                        </p>
                      </div>

                      <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                        Certificate of Completion
                      </h3>
                      <p className="mt-3 text-sm text-slate-600">
                        This certifies that <span className="font-semibold text-slate-900">{user?.name || "Student"}</span> has
                        successfully completed:
                      </p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{courseTitle}</p>

                      <a
                        href={`${api.defaults.baseURL}/certificates/download/${cert._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 ${theme.button}`}
                      >
                        <span>Download Certificate</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v10m0 0l4-4m-4 4l-4-4M5 20h14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
