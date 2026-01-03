'use client';
import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, Building2, ChevronRight, Bookmark, Search, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '../userpanel/Sidebar';
import UserNavbar from '../userpanel/Navbar';

export default function SavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
                while (API_BASE_URL.endsWith("/")) API_BASE_URL = API_BASE_URL.slice(0, -1);

                const res = await fetch(`${API_BASE_URL}/userjobs/jobs/saved`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (res.ok) setSavedJobs(data.savedJobs || []);
            } catch (err) {
                console.error("Failed to fetch saved jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSavedJobs();
    }, []);

    const removeSavedJob = async (job, e) => {
        if (e) e.stopPropagation();
        try {
            let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
            while (API_BASE_URL.endsWith("/")) API_BASE_URL = API_BASE_URL.slice(0, -1);

            const res = await fetch(`${API_BASE_URL}/userjobs/jobs/save-toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job }),
                credentials: "include",
            });

            if (res.ok) {
                const jobUUID = job.jobid || job.jobId || job.id || job._id;
                setSavedJobs(prev => prev.filter(sj => (sj.jobid || sj.jobId || sj.id || sj._id) !== jobUUID));
            }
        } catch (err) {
            console.error("Failed to remove job:", err);
        }
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const filteredJobs = savedJobs.filter(job =>
        (job.Title || job.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.Company || job.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#0a0f0d] text-white">
            <Sidebar isOpen={sidebarOpen} />

            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
                <UserNavbar onSidebarToggle={toggleSidebar} />

                <main className="flex-1 pt-24 px-4 sm:px-10 overflow-auto no-scrollbar pb-10">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <Link href="/job-found" className="text-green-500 flex items-center gap-2 text-sm mb-2 hover:underline">
                                    <ArrowLeft size={16} />
                                    Back to Job Search
                                </Link>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                    <Bookmark className="text-green-500" />
                                    Saved Jobs
                                </h1>
                                <p className="text-gray-400 mt-2">Manage all the jobs you&apos;ve bookmarked for later.</p>
                            </div>

                            <div className="relative group max-w-sm w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search your saved jobs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#0e1513] border border-green-800/30 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500 transition-all placeholder:text-gray-600 shadow-xl"
                                />
                            </div>
                        </div>

                        {/* Job List */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-[#0e1513] border border-green-800/10 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 animate-pulse">
                                        <div className="w-14 h-14 bg-green-500/5 rounded-xl flex-shrink-0"></div>
                                        <div className="flex-1 space-y-3 w-full">
                                            <div className="h-5 bg-gray-800/60 rounded w-1/3"></div>
                                            <div className="h-4 bg-green-500/5 rounded w-1/4"></div>
                                            <div className="flex gap-4">
                                                <div className="h-3 bg-gray-800/40 rounded w-16"></div>
                                                <div className="h-3 bg-gray-800/40 rounded w-16"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <div className="h-10 w-10 bg-gray-800/40 rounded-lg"></div>
                                            <div className="h-10 w-32 bg-gray-800/60 rounded-lg"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredJobs.length > 0 ? (
                            <div className="space-y-4">
                                {filteredJobs.map((job, idx) => {
                                    const jobUUID = job.jobid || job.jobId || job.id || job._id || idx;
                                    const title = job.Title || job.title || "Untitled Job";
                                    const company = job.Company || job.companyName || "Unknown Company";
                                    const location = job.Location || job.location || "Remote";

                                    return (
                                        <div
                                            key={jobUUID}
                                            className="group bg-[#0e1513] border border-green-800/20 rounded-2xl p-4 sm:p-5 hover:border-green-500/40 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 shadow-lg shadow-black/20"
                                        >
                                            {/* Company Icon / Logo */}
                                            <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-green-400 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative">
                                                {job.company?.logo ? (
                                                    <img
                                                        src={job.company.logo}
                                                        alt={job.company?.name || company}
                                                        className="w-full h-full object-contain p-1.5"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    style={{ display: job.company?.logo ? 'none' : 'flex' }}
                                                    className="w-full h-full items-center justify-center"
                                                >
                                                    <Building2 size={28} />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors break-words line-clamp-2 pr-4">
                                                    {title}
                                                </h3>
                                                <div className="text-green-400 font-medium text-sm mb-3 truncate">{job.company?.name || company}</div>

                                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-green-700" />
                                                        {location}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-green-700" />
                                                        {job.Posted_At || job.datePosted || "Recently"}
                                                    </div>
                                                    {job.EmploymentType && (
                                                        <div className="bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10 text-green-500/80">
                                                            {job.EmploymentType}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto">
                                                <button
                                                    onClick={(e) => removeSavedJob(job, e)}
                                                    className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all order-2 md:order-1"
                                                    title="Remove from bookmarks"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                                <Link
                                                    href={`/ job-found?jobId=${jobUUID}`}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 text-black font-bold hover:bg-green-400 transition-all order-1 md:order-2"
                                                >
                                                    View Details
                                                    <ChevronRight size={18} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-[#0e1513] rounded-3xl border border-dashed border-green-800/40">
                                <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                                    <Bookmark size={40} className="text-green-700/50" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-300">No saved jobs found</h3>
                                <p className="text-gray-500 mt-2 max-w-sm text-center">
                                    {searchTerm
                                        ? `No results match "${searchTerm}". Try a different search term.`
                                        : "You haven't bookmarked any jobs yet. Start exploring or search for jobs to save them here."}
                                </p>
                                <Link
                                    href="/job-found"
                                    className="mt-8 px-8 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all shadow-lg shadow-green-500/10"
                                >
                                    Explore Jobs
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

