import { useContext, useEffect, useState } from "react";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);

  useEffect(() => {
    if (!user) return;

    // get all courses
    api.get("/courses")
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]));

    // get enrolled courses
    api.get(`/courses/enrolled/${user._id}`)
      .then(res => setEnrolled(res.data.map(c => c._id)))
      .catch(() => setEnrolled([]));
  }, [user]);

  const enroll = async (courseId) => {
    await api.post("/courses/enroll", {
      courseId,
      userId: user._id
    });

    setEnrolled(prev => [...prev, courseId]);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Courses</h2>

      {courses.length === 0 && <p>No courses available</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-sm text-gray-600">{course.description}</p>

            {!enrolled.includes(course._id) ? (
              <button
                onClick={() => enroll(course._id)}
                className="bg-green-600 text-white px-3 py-1 mt-3 rounded"
              >
                Enroll
              </button>
            ) : (
              <button
                onClick={() => navigate(`/dashboard/quiz/${course._id}`)}
                className="bg-blue-600 text-white px-3 py-1 mt-3 rounded"
              >
                Start Quiz
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
