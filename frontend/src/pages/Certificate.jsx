import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";   // ✅ IMPORTANT

export default function Certificate() {
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);
  const [courses, setCourses] = useState({});

  useEffect(() => {
    if (!user) return;

    api
      .get("/certificates")
      .then(res => setCerts(res.data))
      .catch(err => {
        console.error(err);
        setCerts([]);
      });

    // Fetch courses to get titles if not populated in certificate
    api.get("/courses")
      .then(res => {
        const courseMap = {};
        res.data.forEach(c => courseMap[c._id] = c);
        setCourses(courseMap);
      })
      .catch(err => console.error(err));
  }, [user]);

  if (certs.length === 0) {
    return <p>No certificates earned yet.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Certificates</h2>

      {certs.map(cert => {
        const courseId = typeof cert.courseId === 'object' ? cert.courseId?._id : cert.courseId;
        const courseTitle = cert.courseId?.title || courses[courseId]?.title || "Course";
        return (
          <div
          key={cert._id}
          className="bg-white p-8 rounded shadow mb-4 text-center"
        >
          <h1 className="text-2xl font-bold">Certificate of Completion</h1>

          <p className="mt-4">This certifies that</p>
          <h2 className="text-xl font-semibold mt-2">{user.name}</h2>
          <p className="mt-2">has successfully completed the course</p>
          <h3 className="text-lg font-bold text-blue-600 mt-2">{courseTitle}</h3>

          {/* ✅ DOWNLOAD PDF */}
          <a
            href={`${api.defaults.baseURL}/certificates/download/${cert._id}`}
            className="bg-green-600 text-white px-4 py-2 rounded inline-block mt-4"
          >
            Download Certificate
          </a>
        </div>
      )})}
    </div>
  );
}
