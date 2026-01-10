import { useContext, useEffect, useState } from "react";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/progress/user/${user._id}`)
      .then(res => {
        setProgress(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) return <p>Loading courses...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Courses</h2>

      {progress.length === 0 && (
        <p className="text-gray-500">You are not enrolled in any course yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {progress.map(p => {
          const percent = Math.round(
            (p.completedLessons / p.totalLessons) * 100
          );

          return (
            <div key={p._id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{p.courseId.title}</h3>
              <p className="text-sm text-gray-600 mb-2">Progress</p>
              <ProgressBar value={percent} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
