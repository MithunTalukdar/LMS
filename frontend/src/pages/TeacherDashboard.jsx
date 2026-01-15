import { useEffect, useState } from "react";
import api from "../utils/axios";
import TeacherTasks from "./TeacherTasks";
import TeacherAnalytics from "./TeacherAnalytics";
import TeacherQuiz from "./TeacherQuiz";
import TeacherQuizReview from "./TeacherQuizReview";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    api
      .get("/courses")
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* 🔹 Header + Course Selector */}
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Teacher Panel 🍎
            </h2>

            <div className="w-full md:w-72">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                outline-none transition bg-white text-sm sm:text-base"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select a Course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 🔹 Empty State */}
        {!selectedCourse ? (
          <div className="mt-10 text-center bg-white rounded-xl shadow-sm border p-8">
            <p className="text-gray-500 text-base sm:text-lg">
              Please select a course to manage 📚
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">

            {/* 📌 Tasks Section */}
            <section className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                📌 Tasks
              </h3>
              <TeacherTasks courseId={selectedCourse} />
            </section>

            {/* 📝 Quiz Section */}
            <section className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                📝 Quiz Management
              </h3>
              <TeacherQuiz courseId={selectedCourse} />
            </section>

            {/* 📊 Review & Analytics */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">
                  🔍 Quiz Review
                </h3>
                <TeacherQuizReview courseId={selectedCourse} />
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">
                  📈 Analytics
                </h3>
                <TeacherAnalytics courseId={selectedCourse} />
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
