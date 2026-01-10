import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function TeacherAnalytics({ courseId }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get(`/tasks/teacher/${courseId}`)
      .then(res => setTasks(res.data))
      .catch(() => setTasks([]));
  }, [courseId]);

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h3 className="font-semibold mb-3">Student Submissions</h3>

      {tasks.map(task => (
        <div key={task._id} className="border p-3 rounded mb-3">
          <h4 className="font-medium">{task.title}</h4>

          {task.submissions.length === 0 && (
            <p className="text-sm text-gray-500">No submissions</p>
          )}

          {task.submissions.map((s, i) => (
            <div key={i} className="text-sm mt-1">
              {s.studentId?.name} – <b>{s.status}</b>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
