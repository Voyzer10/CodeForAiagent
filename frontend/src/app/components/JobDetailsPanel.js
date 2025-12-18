import React from "react";
import {
    MapPin,
    Clock,
    Briefcase,
    CheckCircle,
    MoreHorizontal,
    Bookmark,
    Share2,
    Building2,
    Globe
} from "lucide-react";

const JobDetailsPanel = ({ job, onApply }) => {
    if (!job) return null;

    // Helper for safe HTML rendering
    const renderHTML = (html) => ({ __html: html });

    // Extract content safely
    const title = job.Title || job.title || "Untitled Job";
    const company = job.Company || job.companyName || "Unknown Company";
    const location = job.Location || job.location || "Remote";
    const type = job.Type || job.jobType || "Full-time";
    const postedAt = job.postedAt || job.datePosted || "Recently";
    const description = job.Description || job.descriptionText || job.descriptionHtml || "";
    const matchScore = job.matchScore || 85; // Placeholder or actual data

    return (
        <div className="h-full overflow-y-auto bg-[#0e1513] text-gray-300 no-scrollbar">
            <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">

                {/* --- Header Section --- */}
                <header className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400">
                        <Building2 size={16} />
                        <span className="font-medium tracking-wide text-sm">{company}</span>
                        <CheckCircle size={14} className="text-green-500 fill-green-500/20" />
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                            Verified
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                        {title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-400 border-b border-green-800/30 pb-6">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-gray-500" />
                            <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Briefcase size={16} className="text-gray-500" />
                            <span>{type}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-gray-500" />
                            <span>{new Date(postedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium uppercase tracking-wider">
                            Actively Hiring
                        </div>
                    </div>
                </header>

                {/* --- Action & Match Section --- */}
                <section className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-5 rounded-xl bg-green-900/10 border border-green-800/30">

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-14 h-14 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-green-900"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="text-green-500 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]"
                                    strokeDasharray={`${matchScore}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                            </svg>
                            <span className="absolute text-xs font-bold text-green-400">{matchScore}%</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Strong Match</h3>
                            <p className="text-xs text-gray-400">Your profile fits this role well.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => onApply && onApply(job)}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.4)] transition-all hover:shadow-[0_0_20px_rgba(22,163,74,0.6)]"
                        >
                            Apply Now
                        </button>
                        <button className="p-2.5 rounded-lg border border-green-800/50 hover:bg-green-900/20 text-gray-400 hover:text-green-400 transition-colors">
                            <Bookmark size={20} />
                        </button>
                        <button className="p-2.5 rounded-lg border border-green-800/50 hover:bg-green-900/20 text-gray-400 hover:text-green-400 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </section>

                {/* --- Job Content Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Description / Responsibilities */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                Job Overview
                            </h2>
                            <div
                                className="prose prose-invert prose-green max-w-none text-sm text-gray-300 leading-relaxed"
                                dangerouslySetInnerHTML={renderHTML(description)}
                            />
                        </div>

                        {/* Hardcoded example structure for Responsibilities if not in description */}
                        {!description.toLowerCase().includes("responsibilities") && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Key Responsibilities</h3>
                                <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-gray-300 marker:text-green-500">
                                    <li>Analyze user requirements and translate them into reliable code.</li>
                                    <li>Collaborate with cross-functional teams to define features.</li>
                                    <li>Optimize applications for maximum speed and scalability.</li>
                                </ul>
                            </div>
                        )}
                    </section>

                    {/* Right Column: Requirements / Skills */}
                    <section className="space-y-6">
                        <div className="p-6 rounded-xl bg-[#0b0f0e] border border-green-800/20">
                            <h2 className="text-lg font-semibold text-white mb-4">Requirements</h2>
                            <ul className="space-y-3">
                                {['3+ years of experience with React/Next.js', 'Proficiency in Tailwind CSS', 'Experience with Node.js backends', 'Strong problem-solving skills'].map((req, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                        <CheckCircle size={16} className="min-w-[16px] text-green-500 mt-1" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6 rounded-xl bg-[#0b0f0e] border border-green-800/20">
                            <h2 className="text-lg font-semibold text-white mb-4">Preferred Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {['TypeScript', 'GraphQL', 'AWS', 'Figma', 'CI/CD'].map((skill) => (
                                    <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border border-green-800/40">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- About Company --- */}
                <section className="pt-6 border-t border-green-800/30">
                    <h2 className="text-xl font-semibold text-white mb-4">About {company}</h2>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            {/* Placeholder for company logo */}
                            <Building2 className="text-black" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-300 leading-relaxed mb-3">
                                {company} is a leading innovator in the tech industry, dedicated to building scalable solutions that empower users worldwide. Join our team to work on cutting-edge technologies.
                            </p>
                            <a href="#" className="inline-flex items-center gap-1.5 text-sm text-green-400 hover:underline">
                                <Globe size={14} />
                                Visit Website
                            </a>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default JobDetailsPanel;
