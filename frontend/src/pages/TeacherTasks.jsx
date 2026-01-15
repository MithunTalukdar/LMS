import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function TeacherTasks({ courseId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tasks, setTasks] = useState([]);

  /* 🔹 LOAD TASKS */
  useEffect(() => {
    if (!courseId) return;

    api
      .get(`/tasks/teacher/${courseId}`)
      .then(res => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTasks([]));
  }, [courseId]);

  /* 🔹 CREATE TASK */
  const createTask = async () => {
    if (!title || !description || !deadline) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/tasks", {
        courseId,
        title,
        description,
        deadline
      });

      const res = await api.get(`/tasks/teacher/${courseId}`);
      setTasks(res.data);

      setTitle("");
      setDescription("");
      setDeadline("");
    } catch {
      alert("Failed to create task");
    }
  };

  /* 🔹 GRADE TASK */
  const gradeTask = async (taskId, submissionId, status) => {
    try {
      await api.post("/tasks/grade", {
        taskId,
        submissionId,
        status
      });

      const res = await api.get(`/tasks/teacher/${courseId}`);
      setTasks(res.data);
    } catch {
      alert("Failed to grade task");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">

      <h3 className="text-lg font-semibold mb-4">
        📌 Create Task
      </h3>

      {/* 🔹 CREATE FORM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <input
          className="border p-3 rounded-lg text-sm sm:text-base"
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          className="border p-3 rounded-lg text-sm sm:text-base"
          placeholder="Task description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          type="date"
          className="border p-3 rounded-lg text-sm sm:text-base"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
      </div>

      <button
        onClick={createTask}
        className="mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700
        text-white px-6 py-2 rounded-lg transition"
      >
        ➕ Create Task
      </button>

      {/* 🔹 TASK LIST */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">
          📂 Tasks
        </h4>

        {tasks.length === 0 && (
          <p className="text-sm text-gray-500">
            No tasks yet
          </p>
        )}

        <div className="space-y-5">
          {tasks.map(task => {
            const submissions = task.submissions || [];
            const passedCount = submissions.filter(
              s => s.status === "pass"
            ).length;

            return (
              <div
                key={task._id}
                className="border rounded-xl p-4 bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <p className="font-medium text-gray-900">
                    {task.title}
                  </p>

                  <span className="text-xs text-gray-500">
                    Deadline: {new Date(task.deadline).toDateString()}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  {task.description}
                </p>

                <p className="text-xs mt-2 text-green-700 font-medium">
                  Passed: {passedCount} students
                </p>

                {/* 🔹 SUBMISSIONS */}
                <div className="mt-4">
                  <h5 className="font-semibold text-sm mb-2">
                    👨‍🎓 Student Submissions
                  </h5>

                  {submissions.length === 0 && (
                    <p className="text-xs text-gray-500">
                      No submissions yet
                    </p>
                  )}

                  <div className="space-y-2">
                    {submissions.map(sub => (
                      <div
                        key={sub._id}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center
                        gap-2 border rounded-lg p-3 bg-white"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {sub.studentId?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status: {sub.status}
                          </p>
                        </div>

                        {sub.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                gradeTask(task._id, sub._id, "pass")
                              }
                              className="bg-green-600 hover:bg-green-700
                              text-white px-4 py-1.5 rounded text-xs"
                            >
                              Pass
                            </button>

                            <button
                              onClick={() =>
                                gradeTask(task._id, sub._id, "fail")
                              }
                              className="bg-red-600 hover:bg-red-700
                              text-white px-4 py-1.5 rounded text-xs"
                            >
                              Fail
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
