"use client";
import { useState, useEffect } from "react";
import Sidebar from "../userpanel/Sidebar";
import UserNavbar from "../userpanel/Navbar";

export default function JobFound() {
    const [userJobs, setUserJobs] = useState([]);
    const [user, setUser] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null); // For modal open
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

    useEffect(() => {
        const fetchUserAndJobs = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch user");
                setUser(data.user);

                if (data.user && data.user.userId) {
                    const jobRes = await fetch(
                        `http://localhost:5000/api/userjobs/${data.user.userId}`,
                        {
                            method: "GET",
                            credentials: "include",
                        }
                    );
                    const jobData = await jobRes.json();
                    if (jobRes.ok && Array.isArray(jobData.jobs)) {
                        setUserJobs(jobData.jobs);
                    }
                }
            } catch (err) {
                console.error("Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndJobs();
    }, []);

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen text-green-400">
                Loading your saved jobs...
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                {error}
            </div>
        );

    return (
        <div className="flex min-h-screen bg-[#0b0f0e] text-white">
            <UserNavbar onSidebarToggle={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} />

            <div className="flex-1 p-6 md:p-10">
                <h2 className="text-2xl font-bold text-green-400 mb-6 border-b border-green-900 pb-2">
                    Your Saved Jobs
                </h2>

                {userJobs.length > 0 ? (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {userJobs.map((job, idx) => (
                            <div
                                key={idx}
                                className="p-5 bg-[#111a17] border border-[#1f2d2a] rounded-xl shadow-lg hover:shadow-green-900/20 transition-all cursor-pointer"
                                onClick={() => setSelectedJob(job)}
                            >
                                <h4 className="text-green-300 font-semibold mb-1 truncate">
                                    {job.Title}
                                </h4>
                                <p className="text-gray-400 text-sm mb-2">{job.Location}</p>

                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {job.Description || "No description available."}
                                </p>

                                <button
                                    className="mt-3 px-3 py-1 text-sm rounded-md bg-green-700/20 border border-green-700 text-green-300 hover:bg-green-700/40 transition"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedJob(job);
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">
                        No jobs available for the current user.
                    </p>
                )}
            </div>

            {/* Modal View */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-[#13201c] border border-green-900 rounded-xl w-11/12 md:w-2/3 lg:w-1/2 p-6 shadow-lg relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-green-400 text-lg"
                            onClick={() => setSelectedJob(null)}
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-green-400 mb-3">
                            {selectedJob.Title}
                        </h3>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {Object.keys(selectedJob).map((key) => {
                                if (["_id", "__v"].includes(key)) return null;
                                return (
                                    <div key={key} className="text-sm">
                                        <span className="font-semibold text-green-300">{key}: </span>
                                        {key === "link" || key === "applyUrl" ? (
                                            <a
                                                href={selectedJob[key]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-400 underline"
                                            >
                                                {selectedJob[key]}
                                            </a>
                                        ) : (
                                            <span className="text-gray-300">{selectedJob[key]}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {selectedJob.link && (
                            <div className="mt-6 text-center">
                                <a
                                    href={selectedJob.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-green-600 text-black px-5 py-2 rounded-md hover:bg-green-500 transition font-semibold"
                                >
                                    Go to Job
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
