import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function TeacherQuizReview({ courseId }) {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    if (!courseId) return;

    api
      .get(`/quiz/teacher/${courseId}`)
      .then(res => setAttempts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAttempts([]));
  }, [courseId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        📋 Quiz Submissions
      </h3>

      {attempts.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500 text-sm sm:text-base">
            No quiz attempts yet
          </p>
        </div>
      )}

      <div className="space-y-4">
        {attempts.map(a => (
          <div
            key={a._id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <p className="font-medium text-gray-900 text-sm sm:text-base">
              👤 {a.userId?.name}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1">
              <p className="text-sm text-blue-700 font-semibold">
                Score: {a.score}
              </p>

              <p className="text-xs text-gray-500">
                {new Date(a.attemptedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
