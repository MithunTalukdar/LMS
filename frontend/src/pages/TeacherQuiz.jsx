import { useEffect, useMemo, useState } from "react";
import api from "../utils/axios";

export default function TeacherQuiz({ courseId }) {
  const [topic, setTopic] = useState("General");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (!courseId) return;

    api
      .get(`/quiz/questions/${courseId}`)
      .then(res => setQuizzes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setQuizzes([]));
  }, [courseId]);

  const groupedQuizzes = useMemo(() => {
    const groups = [];
    const map = new Map();

    quizzes.forEach(item => {
      const name = typeof item.topic === "string" && item.topic.trim() ? item.topic.trim() : "General";
      if (!map.has(name)) {
        const group = { topic: name, items: [] };
        map.set(name, group);
        groups.push(group);
      }
      map.get(name).items.push(item);
    });

    return groups;
  }, [quizzes]);

  const createQuiz = async () => {
    const cleanQuestion = question.trim();
    const cleanTopic = topic.trim() || "General";
    const cleanOptions = options.map(opt => opt.trim());

    if (!cleanQuestion || cleanOptions.some(opt => !opt)) {
      alert("Fill all fields");
      return;
    }

    try {
      await api.post("/quiz", {
        courseId,
        topic: cleanTopic,
        question: cleanQuestion,
        options: cleanOptions,
        correctAnswer
      });

      const res = await api.get(`/quiz/questions/${courseId}`);
      setQuizzes(Array.isArray(res.data) ? res.data : []);

      setTopic("General");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
    } catch {
      alert("Failed to create quiz");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 w-full max-w-4xl mx-auto">
      <h3 className="text-lg sm:text-xl font-bold mb-5 text-gray-800 border-b pb-2">
        Create Topic-wise MCQ
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            outline-none transition text-sm sm:text-base"
            placeholder="Example: React Hooks"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer (single choice)
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

      <button
        onClick={createQuiz}
        className="w-full sm:w-auto mt-5 bg-blue-600 hover:bg-blue-700
        text-white font-medium px-6 py-3 rounded-lg transition"
      >
        Add MCQ Question
      </button>

      <div className="mt-10">
        <h4 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">
          Existing Questions by Topic
        </h4>

        {quizzes.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500 text-sm sm:text-base">
              No quizzes added yet for this course.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {groupedQuizzes.map(group => (
            <div key={group.topic} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                {group.topic}
              </p>

              <div className="mt-3 space-y-3">
                {group.items.map((q, index) => (
                  <div key={q._id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                      <span className="text-blue-600 mr-2">Q{index + 1}.</span>
                      {q.question}
                    </p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((option, idx) => (
                        <li
                          key={idx}
                          className={
                            idx === q.correctAnswer
                              ? "px-3 py-2 rounded-lg bg-green-100 text-green-800 text-sm font-medium border"
                              : "px-3 py-2 rounded-lg text-gray-600 text-sm bg-white border"
                          }
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
