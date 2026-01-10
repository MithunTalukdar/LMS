import { useEffect, useState } from "react";
import api from "../utils/axios";
import TeacherTasks from "./TeacherTasks";
import TeacherAnalytics from "./TeacherAnalytics";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Teacher Panel</h2>

      <select
        className="border p-2 mb-4"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
      >
        <option value="">Select Course</option>
        {courses.map(c => (
          <option key={c._id} value={c._id}>
            {c.title}
          </option>
        ))}
      </select>

      {selectedCourse && (
        <>
          <TeacherTasks courseId={selectedCourse} />
          <TeacherAnalytics courseId={selectedCourse} />
        </>
      )}
    </div>
  );
}
