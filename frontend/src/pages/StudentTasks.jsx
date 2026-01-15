import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function StudentTasks({ courseId, onAllTasksPassed }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    completedTasks: 0,
    totalTasks: 0
  });
  const [loading, setLoading] = useState(true);

  /* 🔹 LOAD STUDENT TASKS */
  useEffect(() => {
    if (!courseId) return;

    setLoading(true);

    api
      .get(`/tasks/student/${courseId}`)
      .then(res => {
        const data = res.data || {};

        const taskList = Array.isArray(data.tasks) ? data.tasks : [];

        setTasks(taskList);
        setStats({
          completedTasks: data.completedTasks || 0,
          totalTasks: data.totalTasks || 0
        });

        // ✅ Unlock quiz only if ALL tasks are PASSED
        const allPassed =
          data.totalTasks > 0 &&
          data.completedTasks === data.totalTasks;

        if (onAllTasksPassed) {
          onAllTasksPassed(allPassed);
        }
      })
      .catch(() => {
        setTasks([]);
        setStats({ completedTasks: 0, totalTasks: 0 });
        if (onAllTasksPassed) onAllTasksPassed(false);
      })
      .finally(() => setLoading(false));
  }, [courseId, onAllTasksPassed]);

  /* 🔹 SUBMIT TASK */
  const submitTask = async taskId => {
    const answer = prompt("Enter your answer");
    if (!answer) return;

    try {
      await api.post("/tasks/submit", { taskId, answer });

      // 🔄 Reload tasks after submission
      const res = await api.get(`/tasks/student/${courseId}`);

      setTasks(res.data.tasks || []);
      setStats({
        completedTasks: res.data.completedTasks || 0,
        totalTasks: res.data.totalTasks || 0
      });

      const allPassed =
        res.data.totalTasks > 0 &&
        res.data.completedTasks === res.data.totalTasks;

      if (onAllTasksPassed) {
        onAllTasksPassed(allPassed);
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to submit task"
      );
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-3">
        Tasks ({stats.completedTasks}/{stats.totalTasks})
      </h3>

      {loading && (
        <p className="text-gray-500">Loading tasks...</p>
      )}

      {!loading && tasks.length === 0 && (
        <p className="text-gray-500">No tasks assigned</p>
      )}

      {tasks.map(task => {
        const status = task.submission?.status;

        return (
          <div key={task._id} className="border p-3 rounded mb-3">
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-gray-700">
              {task.description}
            </p>

            {task.deadline && (
              <p className="text-xs text-gray-500 mt-1">
                Deadline:{" "}
                {new Date(task.deadline).toDateString()}
              </p>
            )}

            {/* STATUS / ACTION */}
            {status ? (
              <p
                className={`mt-2 font-semibold ${
                  status === "pass"
                    ? "text-green-600"
                    : status === "fail"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {status.toUpperCase()}
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
        );
      })}
    </div>
  );
}
