import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";   // ✅ IMPORTANT

export default function Certificate() {
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    if (!user) return;

    api
      .get(`/certificates/${user._id}`)
      .then(res => setCerts(res.data))
      .catch(err => {
        console.error(err);
        setCerts([]);
      });
  }, [user]);

  if (certs.length === 0) {
    return <p>No certificates earned yet.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Certificates</h2>

      {certs.map(cert => (
        <div
          key={cert._id}
          className="bg-white p-8 rounded shadow mb-4 text-center"
        >
          <h1 className="text-2xl font-bold">Certificate of Completion</h1>

          <p className="mt-4">This certifies that</p>
          <h2 className="text-xl font-semibold mt-2">{user.name}</h2>
          <p className="mt-2">has successfully completed the course</p>

          {/* ✅ DOWNLOAD PDF */}
          <a
            href={`http://localhost:5000/api/certificates/download/${c._id}`}
            className="bg-green-600 text-white px-4 py-2 rounded inline-block mt-4"
          >
            Download Certificate
          </a>
        </div>
      ))}
    </div>
  );
}
