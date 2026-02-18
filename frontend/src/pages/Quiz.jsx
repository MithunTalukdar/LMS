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

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-white via-sky-50 to-cyan-100 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/40 blur-2xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Course Journey</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Progress Overview</h2>
          </div>

          <span className="rounded-full bg-slate-900 px-4 py-2 text-xl font-bold text-white">
            {progress}%
          </span>
        </div>

        <div className="relative mt-4 h-4 w-full rounded-full bg-white/70 ring-1 ring-sky-100">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
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
