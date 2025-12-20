'use client';

import { useEffect, useState } from 'react';
import { Loader2, ExternalLink, Mail, Calendar, CheckCircle2, Building2 } from 'lucide-react';
import UserNavbar from '../userpanel/Navbar';
import Sidebar from '../userpanel/Sidebar';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

export default function AppliedJobs() {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data first
                const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const userData = await userRes.json();

                if (!userRes.ok) {
                    throw new Error('Failed to fetch user data');
                }

                setUser(userData.user);

                // Fetch applied jobs
                const jobsRes = await fetch(`${API_BASE_URL}/applied-jobs/user/${userData.user.userId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const jobsData = await jobsRes.json();

                if (!jobsRes.ok) {
                    throw new Error(jobsData.error || 'Failed to fetch applied jobs');
                }

                setAppliedJobs(jobsData.jobs || []);
            } catch (err) {
                console.error('Error fetching applied jobs:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#09110f] text-white">
                <UserNavbar onSidebarToggle={toggleSidebar} />
                <Sidebar isOpen={sidebarOpen} onSelectSearch={() => { }} />
                <main className="max-w-[1200px] mx-auto px-6 py-10 mt-14 animate-pulse">
                    <div className="h-10 w-48 bg-gray-800/60 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-gray-800/40 rounded mb-8"></div>

                    <div className="h-28 bg-green-900/10 border border-green-800/20 rounded-xl mb-6"></div>

                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#0b1512] border border-[#11221b] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-14 h-14 bg-green-500/5 rounded-xl flex-shrink-0"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gray-800/60 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-800/40 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-800/40 rounded w-1/4"></div>
                                </div>
                                <div className="h-10 w-32 bg-green-500/10 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#09110f] text-white">
            <UserNavbar onSidebarToggle={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} onSelectSearch={() => { }} />

            <main className="max-w-[1200px] mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">Applied Jobs</h1>
                    <p className="text-[#9ca3af]">
                        Track all jobs where you&apos;ve created Gmail drafts
                    </p>
                </div>

                {/* Stats Card */}
                <div className="mb-6 bg-gradient-to-r from-[#0a2f23] to-[#062217] border border-[#11221b] rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00fa92] to-[#4ade80] flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-[#030604]" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">{appliedJobs.length}</div>
                            <div className="text-sm text-[#9ca3af]">Total Applications</div>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Jobs List */}
                {appliedJobs.length === 0 ? (
                    <div className="bg-[#0b1512] border border-[#11221b] rounded-xl p-12 text-center">
                        <Mail className="w-16 h-16 text-[#7b8f86] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Applied Jobs Yet</h3>
                        <p className="text-[#9ca3af]">
                            Jobs will appear here once you create Gmail drafts for them
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appliedJobs.map((job, index) => (
                            <div
                                key={job._id || index}
                                className="bg-[#0b1512] border border-[#11221b] rounded-xl p-6 hover:border-[#00fa92]/30 transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {job.company?.logo ? (
                                                    <img
                                                        src={job.company.logo}
                                                        alt={job.company?.name}
                                                        className="w-full h-full object-contain p-1"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = ""; e.target.parentElement.innerHTML = '<svg class="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>'; }}
                                                    />
                                                ) : (
                                                    <Building2 size={20} className="text-green-500/60" />
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-white break-words">
                                                {job.email_subject || 'Application Draft'}
                                            </h3>
                                        </div>
                                        {job.company?.name && (
                                            <div className="text-[#00fa92] text-sm font-medium mb-3 ml-12 -mt-1">{job.company.name}</div>
                                        )}

                                        {/* Recipient Email */}
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <Mail className="w-4 h-4 text-[#00fa92] shrink-0" />
                                            <span className="text-sm text-[#9ca3af] break-all">
                                                To: <span className="text-[#c7d7cf]">{job.email_to || 'N/A'}</span>
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="w-4 h-4 text-[#00fa92] shrink-0" />
                                            <span className="text-sm text-[#9ca3af]">
                                                Applied: <span className="text-[#c7d7cf]">{formatDate(job.createdAt)}</span>
                                            </span>
                                        </div>

                                        {/* Job ID */}
                                        <div className="text-xs text-[#7b8f86] font-mono break-all">
                                            Job ID: {job.jobid || job.jobId || job.id || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start mt-2 sm:mt-0">
                                        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00fa92] to-[#4ade80] text-[#030604] text-sm font-semibold flex items-center gap-2 shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Draft Created
                                        </div>

                                        {/* View in Gmail button (if we had draft ID) */}
                                        {job.draftId && (
                                            <a
                                                href={`https://mail.google.com/mail/u/0/#drafts/${job.draftId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#062217] border border-[#11221b] text-[#00fa92] hover:bg-[#083126] transition-colors shrink-0"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View in Gmail
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Email Preview (if available) */}
                                {job.email_content && (
                                    <div className="mt-4 pt-4 border-t border-[#11221b]">
                                        <div className="text-xs text-[#7b8f86] mb-2">Email Preview:</div>
                                        <div className="text-sm text-[#c7d7cf] line-clamp-3 bg-[#07130f] p-3 rounded-md border border-[#13221b]">
                                            {job.email_content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
