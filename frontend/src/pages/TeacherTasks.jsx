import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function TeacherTasks({ courseId }) {
  const [tasks, setTasks] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [comment, setComment] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* 🔹 LOAD TEACHER TASKS */
  useEffect(() => {
    if (courseId) fetchTasks();
  }, [courseId]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/teacher/${courseId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  /* 🔹 CREATE OR UPDATE TASK */
  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, newTask);
        alert("Task updated successfully");
      } else {
        await api.post("/tasks", { ...newTask, courseId });
        alert("Task created successfully");
      }
      setShowCreateForm(false);
      setNewTask({ title: "", description: "", deadline: "" });
      setEditingTaskId(null);
      fetchTasks(); // Refresh list
    } catch (err) {
      alert("Failed to save task");
    }
  };

  /* 🔹 PREPARE EDIT */
  const handleEditClick = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      deadline: task.deadline ? task.deadline.split("T")[0] : ""
    });
    setEditingTaskId(task._id);
    setShowCreateForm(true);
    window.scrollTo(0, 0);
  };

  /* 🔹 DELETE TASK */
  const handleDeleteClick = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task? This will affect student progress.")) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      alert("Task deleted successfully");
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  /* 🔹 GRADE TASK */
  const handleGrade = async (taskId, submissionId, status) => {
    try {
      await api.post("/tasks/grade", {
        taskId,
        submissionId,
        status,
        comment
      });
      setComment("");
      setSelectedSubmission(null);
      fetchTasks(); // Refresh list to show updated status
    } catch (err) {
      alert("Failed to grade task");
    }
  };

  const openReviewModal = (task, submission) => {
    setComment(submission.comment || ""); // Pre-fill existing comment if any
    setSelectedSubmission({ task, submission });
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 🔹 CREATE TASK SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Course Tasks</h2>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingTaskId(null);
              setNewTask({ title: "", description: "", deadline: "" });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showCreateForm ? "Cancel" : "+ Create Task"}
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tasks by title..."
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {showCreateForm && (
          <form onSubmit={handleSaveTask} className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-700">{editingTaskId ? "Edit Task" : "New Task Details"}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                rows="3"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              {editingTaskId ? "Update Task" : "Publish Task"}
            </button>
          </form>
        )}
      </div>

      {filteredTasks.map((task) => (
        <div key={task._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEditClick(task)}
                className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteClick(task._id)}
                className="text-sm text-red-600 hover:text-red-800 px-2 py-1 bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-gray-600 mb-4 text-sm">{task.description}</p>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Student Submissions</h4>
            
            {task.submissions.length === 0 ? (
               <p className="text-sm text-gray-500 italic">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {task.submissions.map((sub) => (
                  <div key={sub._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{sub.studentId?.name || "Unknown Student"}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "N/A"}
                      </p>
                      <p className={`text-xs font-bold mt-1 uppercase ${
                        sub.status === 'pass' ? 'text-green-600' : 
                        sub.status === 'fail' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {sub.status}
                      </p>
                    </div>
                    <button 
                      onClick={() => openReviewModal(task, sub)}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      Review Answer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 🔹 REVIEW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
            <button 
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-bold mb-1 text-gray-800">Review Submission</h3>
            <p className="text-sm text-gray-500 mb-4">
              Student: <span className="font-medium text-gray-700">{selectedSubmission.submission.studentId?.name}</span>
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 max-h-60 overflow-y-auto">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Student's Answer:</p>
              <p className="text-gray-800 whitespace-pre-wrap text-sm">
                {selectedSubmission.submission.answerText || selectedSubmission.submission.answer}
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Comment (Optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                rows="3"
                placeholder="Write feedback for the student..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t">
              <button
                onClick={() => handleGrade(selectedSubmission.task._id, selectedSubmission.submission._id, "fail")}
                className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition border border-red-100"
              >
                Fail
              </button>
              <button
                onClick={() => handleGrade(selectedSubmission.task._id, selectedSubmission.submission._id, "pass")}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition shadow-sm"
              >
                Pass Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}