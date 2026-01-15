import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function TeacherQuiz({ courseId }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [quizzes, setQuizzes] = useState([]);

  /* 🔹 LOAD QUIZZES */
  useEffect(() => {
    if (!courseId) return;

    api
      .get(`/quiz/questions/${courseId}`)
      .then(res => setQuizzes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setQuizzes([]));
  }, [courseId]);

  /* 🔹 CREATE QUIZ */
  const createQuiz = async () => {
    if (!question || options.some(o => !o)) {
      alert("Fill all fields");
      return;
    }

    try {
      await api.post("/quiz", {
        courseId,
        question,
        options,
        correctAnswer
      });

      const res = await api.get(`/quiz/questions/${courseId}`);
      setQuizzes(res.data);

      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
    } catch {
      alert("Failed to create quiz");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 w-full max-w-4xl mx-auto">

      {/* 🔹 HEADER */}
      <h3 className="text-lg sm:text-xl font-bold mb-5 text-gray-800 border-b pb-2">
        📝 Create Quiz
      </h3>

      {/* 🔹 FORM */}
      <div className="space-y-4">

        {/* QUESTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            outline-none transition text-sm sm:text-base"
            placeholder="Enter quiz question"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option {i + 1}
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                outline-none transition text-sm sm:text-base"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={e => {
                  const copy = [...options];
                  copy[i] = e.target.value;
                  setOptions(copy);
                }}
              />
            </div>
          ))}
        </div>

        {/* CORRECT ANSWER */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer
          </label>
          <select
            className="w-full border border-gray-300 p-3 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            outline-none transition bg-white text-sm sm:text-base"
            value={correctAnswer}
            onChange={e => setCorrectAnswer(Number(e.target.value))}
          >
            {options.map((_, i) => (
              <option key={i} value={i}>
                Correct Option {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 ACTION BUTTON */}
      <button
        onClick={createQuiz}
        className="w-full sm:w-auto mt-5 bg-blue-600 hover:bg-blue-700
        text-white font-medium px-6 py-3 rounded-lg transition"
      >
        ➕ Add Quiz Question
      </button>

      {/* 🔹 QUIZ LIST */}
      <div className="mt-10">
        <h4 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">
          📚 Existing Questions
        </h4>

        {quizzes.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500 text-sm sm:text-base">
              No quizzes added yet for this course.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {quizzes.map((q, i) => (
            <div
              key={q._id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4"
            >
              <p className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                <span className="text-blue-600 mr-2">
                  Q{i + 1}.
                </span>
                {q.question}
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((o, idx) => (
                  <li
                    key={idx}
                    className={
                      idx === q.correctAnswer
                        ? "px-3 py-2 rounded-lg bg-green-100 text-green-800 text-sm font-medium border"
                        : "px-3 py-2 rounded-lg text-gray-600 text-sm bg-white border"
                    }
                  >
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
