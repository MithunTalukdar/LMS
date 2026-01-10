import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function TeacherTasks({ courseId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tasks, setTasks] = useState([]);

  /* 🔹 LOAD TEACHER TASKS */
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

  /* 🔹 GRADE TASK (FIXED) */
  const gradeTask = async (taskId, submissionId, status) => {
    try {
      await api.post("/tasks/grade", {
        taskId,
        submissionId,
        status
      });

      const res = await api.get(`/tasks/teacher/${courseId}`);
      setTasks(res.data);
    } catch (err) {
      alert("Failed to grade task");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h3 className="font-semibold mb-3">Create Task</h3>

      {/* 🔹 CREATE FORM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border p-2 rounded"
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Task description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
      </div>

      <button
        onClick={createTask}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Task
      </button>

      {/* 🔹 TASK LIST */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3">Tasks</h4>

        {tasks.length === 0 && (
          <p className="text-sm text-gray-500">No tasks yet</p>
        )}

        {tasks.map(task => {
          const submissions = task.submissions || [];
          const passedCount = submissions.filter(
            s => s.status === "pass"
          ).length;

          return (
            <div key={task._id} className="border rounded p-3 mb-4">
              <div className="flex justify-between">
                <p className="font-medium">{task.title}</p>
                <span className="text-xs text-gray-500">
                  Deadline: {new Date(task.deadline).toDateString()}
                </span>
              </div>

              <p className="text-sm text-gray-600">{task.description}</p>

              <p className="text-xs mt-1 text-green-700">
                Passed: {passedCount} students
              </p>

              {/* 🔹 STUDENT SUBMISSIONS */}
              <div className="mt-3">
                <h5 className="font-semibold text-sm">
                  Student Submissions
                </h5>

                {submissions.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No submissions yet
                  </p>
                )}

                {submissions.map(sub => (
                  <div
                    key={sub._id}
                    className="flex justify-between items-center border rounded p-2 mt-2"
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
                      <div className="space-x-2">
                        <button
                          onClick={() =>
                            gradeTask(
                              task._id,
                              sub._id,
                              "pass"
                            )
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Pass
                        </button>

                        <button
                          onClick={() =>
                            gradeTask(
                              task._id,
                              sub._id,
                              "fail"
                            )
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Fail
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
