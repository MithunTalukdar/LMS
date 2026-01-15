import { useEffect, useState } from "react";
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

  /* 🔓 Load quiz ONLY after tasks are completed */
  useEffect(() => {
    setError(""); // ✅ RESET ERROR

    api
      .get(`/quiz/${courseId}`)
      .then(res => {
        // 📊 Handle Progress
        const p = typeof res.data.percent === 'number' ? res.data.percent : 0;
        setProgress(p);

        // 🔒 Handle Locked State
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
          
          // ✅ Pre-fill previous answers if they exist
          const prevAnswers = res.data.previousAnswers || [];
          const initialAnswers = new Array(res.data.questions?.length || 0).fill(null);
          
          prevAnswers.forEach((ans, i) => { if (i < initialAnswers.length) initialAnswers[i] = ans; });
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

  return (
    <div className="space-y-6">
      {/* 📊 PROGRESS BAR */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Course Progress</h2>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 🧠 TASKS */}
      <StudentTasks
        courseId={courseId}
        onAllTasksPassed={setTasksCompleted}
      />

      {/* 🧪 QUIZ */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Quiz</h2>

        {!tasksCompleted && (
          <p className="text-red-600">
            Complete all tasks to unlock the quiz
          </p>
        )}

        {tasksCompleted && error && (
          <p className="text-red-500">{error}</p>
        )}

        {/* ✅ Already Attempted */}
        {tasksCompleted && attempted && (
          <div className="bg-green-50 border border-green-300 p-4 rounded">
            <p className="font-semibold text-green-700">
              Quiz already submitted ✅
            </p>
            <p>Your Score: {score}</p>
          </div>
        )}

        {/* 📝 Quiz Questions */}
        {tasksCompleted &&
          !attempted &&
          questions.map((q, qi) => (
            <div key={q._id} className="mb-4">
              <p className="font-medium">
                {qi + 1}. {q.question}
              </p>

              {q.options.map((opt, oi) => (
                <label key={oi} className="block cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() => selectOption(qi, oi)}
                  />{" "}
                  {opt}
                </label>
              ))}
            </div>
          ))}

        {tasksCompleted && !attempted && questions.length > 0 && (
          <button
            onClick={submitQuiz}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
