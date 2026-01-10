import api from "../utils/axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";

export default function Progress() {
    const { user } = useContext(AuthContext);
    const [progress, setProgress] = useState([]);

    useEffect(() => {
        api.get(`/progress/user/${user._id}`)
            .then(res => setProgress(res.data));
    }, []);


    return (
        <div>
            <h2 className="text-xl font-bold mb-4">My Progress</h2>

            {progress.length === 0 && <p>No progress found</p>}

            {progress.map(p => {
                const percent = Math.round(
                    (p.completedLessons / p.totalLessons) * 100
                );

                return (
                    <div key={p._id} className="bg-white p-4 mb-3 rounded shadow">
                        <h3 className="font-semibold">{p.courseId.title}</h3>
                        <ProgressBar value={percent} />
                    </div>
                );
            })}
        </div>
    );
}
