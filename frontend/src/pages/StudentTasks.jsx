import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function StudentTasks({ courseId, onAllTasksPassed }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!courseId) return;

    api.get(`/tasks/student/${courseId}`)
      .then(res => {
        setTasks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setTasks([]));
  }, [courseId]);

  const submitTask = async (taskId) => {
    const answer = prompt("Enter your answer");
    if (!answer) return;

    await api.post("/tasks/submit", { taskId, answer });

    const res = await api.get(`/tasks/student/${courseId}`);
    setTasks(res.data);
  };

  const allPassed =
    tasks.length > 0 &&
    tasks.every(t => t.submission?.status === "pass");

  useEffect(() => {
    if (onAllTasksPassed) {
      onAllTasksPassed(allPassed);
    }
  }, [allPassed, onAllTasksPassed]);

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-3">Tasks</h3>

      {tasks.length === 0 && (
        <p className="text-gray-500">No tasks assigned</p>
      )}

      {tasks.map(task => (
        <div key={task._id} className="border p-3 rounded mb-3">
          <h4 className="font-medium">{task.title}</h4>
          <p>{task.description}</p>

          {task.deadline && (
            <p className="text-xs text-gray-500">
              Deadline: {new Date(task.deadline).toDateString()}
            </p>
          )}

          {task.submission ? (
            <p
              className={`mt-2 font-semibold ${
                task.submission.status === "pass"
                  ? "text-green-600"
                  : task.submission.status === "fail"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {task.submission.status.toUpperCase()}
            </p>
          ) : (
            <button
              onClick={() => submitTask(task._id)}
              className="bg-green-600 text-white px-3 py-1 rounded mt-2"
            >
              Submit Task
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
