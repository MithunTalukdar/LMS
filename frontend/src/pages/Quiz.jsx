import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import StudentTasks from "./StudentTasks";

export default function Quiz() {
  const { courseId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const [attempted, setAttempted] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");

    api
      .get(`/quiz/${courseId}`)
      .then(res => {
        const p = typeof res.data.percent === "number" ? res.data.percent : 0;
        setProgress(p);

        if (res.data.locked) {
          setTasksCompleted(false);
          setAttempted(false);
          setQuestions([]);
          return;
        }

        setTasksCompleted(true);

        if (res.data.attempted) {
          setAttempted(true);
          setScore(res.data.score);
          setQuestions([]);
        } else {
          setAttempted(false);
          setQuestions(res.data.questions || []);

          const prevAnswers = res.data.previousAnswers || [];
          const initialAnswers = new Array(res.data.questions?.length || 0).fill(null);
          prevAnswers.forEach((ans, i) => {
            if (i < initialAnswers.length) {
              initialAnswers[i] = ans;
            }
          });
          setAnswers(initialAnswers);
        }
      })
      .catch(err => {
        setQuestions([]);
        setAttempted(false);
        setError(err.response?.data?.message || "Quiz locked");
      });
  }, [courseId, tasksCompleted]);

  const selectOption = (qIndex, optionIndex) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[qIndex] = optionIndex;
      return copy;
    });
  };

  const submitQuiz = async () => {
    try {
      const res = await api.post("/quiz/submit", {
        courseId,
        answers
      });

      setAttempted(true);
      setScore(res.data.score);
      setQuestions([]);

      alert(`Score: ${res.data.score}/${res.data.total}`);
    } catch (err) {
      alert(err.response?.data?.message || "Quiz submission failed");
    }
  };

  const groupedQuestions = useMemo(() => {
    const groups = [];
    const map = new Map();

    questions.forEach((questionItem, questionIndex) => {
      const topic =
        typeof questionItem.topic === "string" && questionItem.topic.trim()
          ? questionItem.topic.trim()
          : "General";

      if (!map.has(topic)) {
        const group = { topic, items: [] };
        map.set(topic, group);
        groups.push(group);
      }

      map.get(topic).items.push({ questionItem, questionIndex });
    });

    return groups;
  }, [questions]);

  const progressValue = Math.min(100, Math.max(0, Number(progress) || 0));
  const progressSegments = 8;
  const filledSegments = Math.round((progressValue / 100) * progressSegments);

  const progressLabel =
    progressValue >= 85
      ? "Elite momentum"
      : progressValue >= 60
      ? "Strong pace"
      : progressValue >= 30
      ? "Steady build"
      : "Kickstart phase";

  const milestoneHint =
    progressValue >= 100
      ? "All milestones complete. You are fully ready."
      : progressValue >= 75
      ? "Final stretch. Finish pending tasks and lock in mastery."
      : progressValue >= 40
      ? "Good traction. Push to 75% for a stronger quiz setup."
      : "Complete early tasks to build faster quiz readiness.";

  return (
    <div className="space-y-6">
      <div className="relative isolate overflow-hidden rounded-[1.9rem] border border-cyan-200/80 p-5 shadow-[0_26px_56px_-36px_rgba(14,116,144,0.7)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(125,211,252,0.45)_0%,transparent_36%),radial-gradient(circle_at_90%_16%,rgba(45,212,191,0.28)_0%,transparent_40%),linear-gradient(130deg,#f9fdff_0%,#eff9ff_52%,#f3fcf8_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.24)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-teal-300/25 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">
                <span className="h-2 w-2 rounded-full bg-sky-600" />
                Course Journey
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Progress Overview</h2>
              <p className="mt-2 text-sm text-slate-600">{milestoneHint}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-center shadow-[0_16px_30px_-24px_rgba(15,23,42,0.9)]">
              <p className="text-3xl font-extrabold text-slate-900">{progressValue}%</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{progressLabel}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                tasksCompleted
                  ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                  : "border-amber-200 bg-amber-100 text-amber-800"
              }`}
            >
              {tasksCompleted ? "Quiz unlocked" : "Tasks required to unlock quiz"}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {100 - progressValue}% remaining
            </span>
          </div>
        </div>

        <div className="relative mt-4 h-3.5 w-full overflow-hidden rounded-full bg-white/85 ring-1 ring-sky-100">
          <div
            className="h-3.5 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 transition-all duration-700"
            style={{ width: `${progressValue}%` }}
          />
          <div className="pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-white/0 via-white/45 to-white/0 animate-shimmer-track" />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {Array.from({ length: progressSegments }).map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full ${
                index < filledSegments ? "bg-gradient-to-r from-sky-500 to-cyan-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <StudentTasks
        courseId={courseId}
        onAllTasksPassed={setTasksCompleted}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Quiz Arena</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              tasksCompleted
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {tasksCompleted ? "Unlocked" : "Locked"}
          </span>
        </div>

        {!tasksCompleted && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            Complete all tasks to unlock the quiz.
          </p>
        )}

        {tasksCompleted && error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        {tasksCompleted && attempted && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-800">Quiz already submitted</p>
            <p className="text-emerald-700">Your score: {score}</p>
          </div>
        )}

        {tasksCompleted &&
          !attempted &&
          groupedQuestions.map(group => (
            <div key={group.topic} className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="inline-flex rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
                {group.topic}
              </p>

              <div className="mt-3 space-y-4">
                {group.items.map(({ questionItem, questionIndex }) => (
                  <div key={questionItem._id || `${group.topic}-${questionIndex}`}>
                    <p className="font-semibold text-slate-800">
                      {questionIndex + 1}. {questionItem.question}
                    </p>

                    <div className="mt-3 space-y-2">
                      {questionItem.options.map((opt, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                            answers[questionIndex] === optionIndex
                              ? "border-sky-400 bg-sky-50 text-sky-900"
                              : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${questionIndex}`}
                            checked={answers[questionIndex] === optionIndex}
                            onChange={() => selectOption(questionIndex, optionIndex)}
                            className="mt-0.5 h-4 w-4 accent-sky-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {tasksCompleted && !attempted && questions.length > 0 && (
          <button
            onClick={submitQuiz}
            className="rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
