import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import StudentTasks from "./StudentTasks";

export default function Quiz() {
  const { courseId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  /* ✅ LOAD QUIZ ONLY AFTER TASKS ARE COMPLETED */
  useEffect(() => {
    if (!tasksCompleted || !courseId) return;

    setLoadingQuiz(true);

    api.get(`/quiz/${courseId}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setQuestions(data);
        setAnswers(new Array(data.length).fill(null));
      })
      .catch(() => {
        setQuestions([]);
        setAnswers([]);
      })
      .finally(() => setLoadingQuiz(false));
  }, [tasksCompleted, courseId]);

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

      alert(`Score: ${res.data.score}/${res.data.total}`);
    } catch (err) {
      alert(err.response?.data?.message || "Quiz failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔹 STUDENT TASKS */}
      <StudentTasks
        courseId={courseId}
        onAllTasksPassed={setTasksCompleted}  
      />

      {/* 🔹 QUIZ SECTION */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Quiz</h2>

        {!tasksCompleted && (
          <p className="text-red-600 font-medium">
            Complete all tasks to unlock the quiz
          </p>
        )}

        {tasksCompleted && loadingQuiz && (
          <p>Loading quiz...</p>
        )}

        {tasksCompleted && !loadingQuiz && questions.length === 0 && (
          <p>No quiz questions available</p>
        )}

        {tasksCompleted && questions.map((q, qi) => (
          <div key={q._id} className="mb-4">
            <p className="font-medium mb-2">
              {qi + 1}. {q.question}
            </p>

            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className="block cursor-pointer mb-1"
              >
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

        {tasksCompleted && questions.length > 0 && (
          <button
            onClick={submitQuiz}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
