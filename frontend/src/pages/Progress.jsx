import api from "../utils/axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";

export default function Progress() {
    const { user } = useContext(AuthContext);
    const [progress, setProgress] = useState([]);

    useEffect(() => {
        if (user) {
            api.get(`/progress/user/${user._id}`)
                .then(res => setProgress(res.data))
                .catch(err => console.error(err));
        }
    }, [user]);


    return (
        <div>
            <h2 className="text-xl font-bold mb-4">My Progress</h2>

            {progress.length === 0 && <p className="text-gray-500">No progress found</p>}

            {progress.map(p => {
                const percent = p.percent || 0;

                return (
                    <div key={p._id} className="bg-white p-4 mb-3 rounded shadow">
                        <div className="flex justify-between mb-2">
                            <h3 className="font-semibold">{p.courseId?.title || "Unknown Course"}</h3>
                            <span className="text-sm font-bold text-blue-600">{percent}%</span>
                        </div>
                        <ProgressBar value={percent} />
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">
                                Tasks Completed: {p.completedTasks || 0} / {p.totalTasks || 0}
                            </p>
                            {percent === 100 && (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                                    🏆 Certificate Earned
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
