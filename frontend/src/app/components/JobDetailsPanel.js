import React, { useMemo } from "react";
import {
    MapPin,
    Clock,
    Briefcase,
    CheckCircle,
    MoreHorizontal,
    Bookmark,
    Building2,
    Globe,
    Users
} from "lucide-react";

/* ---------------- SECTION KEYWORDS ---------------- */
const SECTION_KEYWORDS = {
    responsibilities: [
        "responsibilities",
        "roles and responsibility",
        "your role",
        "what you will do"
    ],
    requirements: [
        "requirements",
        "required experience",
        "qualifications",
        "must have",
        "minimum experience"
    ],
    preferred: [
        "good to have",
        "preferred",
        "nice to have",
        "bonus points"
    ],
    skills: [
        "skills",
        "technical skills",
        "technologies",
        "tools"
    ]
};

/* ---------------- DESCRIPTION PARSER ---------------- */
function extractSections(html = "") {
    if (typeof html !== 'string') return { responsibilities: [], requirements: [], preferred: [], skills: [] };

    const text = html
        .replace(/<br\s*\/?>/gi, "\n") // replace <br> with newlines
        .replace(/<[^>]+>/g, "")       // remove other tags
        .toLowerCase(); // keep lower case for keyword matching

    const sections = {
        responsibilities: [],
        requirements: [],
        preferred: [],
        skills: []
    };

    const lines = text
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 15); // filter out short lines

    let currentSection = null;

    for (const line of lines) {
        for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
            if (keywords.some(k => line.includes(k))) {
                currentSection = section;
                break;
            }
        }

        // Push original line content (maybe capitalised in future, but clean for now)
        // Actually we lowercased the whole text above, which ruins display.
        // Better strategy: Use the regex to find match indices in the *original* text? 
        // Or just dont lowercase the whole text at start.
        // Let's fix the logic: Don't lowercase 'text' variable for display.
    }

    // RE-IMPLEMENTATION TO PRESERVE CASE
    const cleanText = html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
    const cleanLines = cleanText.split("\n").map(l => l.trim()).filter(l => l.length > 15);

    let currentSec = null;

    for (const line of cleanLines) {
        const lowerLine = line.toLowerCase();
        for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
            if (keywords.some(k => lowerLine.includes(k))) {
                currentSec = section;
                break;
            }
        }

        if (currentSec) {
            sections[currentSec].push(line);
        }
    }

    return sections;
}

/* ---------------- MAIN COMPONENT ---------------- */
const JobDetailsPanel = ({ job, onApply }) => {
    // Hooks must be called unconditionally
    const descriptionHtml = job?.descriptionHtml || job?.DescriptionText || job?.description || "";

    const sections = useMemo(
        () => extractSections(descriptionHtml),
        [descriptionHtml]
    );

    // Early return AFTER hooks
    if (!job) return null;

    // Safe defaults
    const title = job.Title || job.title || "Untitled Job";
    const company = job.Company || job.companyName || "Unknown Company";
    const location = job.Location || job.location || "Remote";
    const type = job.EmploymentType || job.jobType || "Full-time";
    const postedAt = job.Posted_At || job.datePosted || job.postedAt || null;
    const applicants = job.applicantsCount || null;

    const formattedDate = postedAt ? new Date(postedAt).toLocaleDateString() : "Recently";

    return (
        <div className="h-full overflow-y-auto bg-[#0e1513] text-gray-300 no-scrollbar">
            <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-10">

                {/* ================= HEADER (GRID BASED) ================= */}
                <header className="grid grid-cols-1 md:grid-cols-6 gap-6 border-b border-green-800/30 pb-6">

                    {/* Company */}
                    <div className="md:col-span-6 flex items-center gap-2 text-green-400 text-sm">
                        <Building2 size={16} />
                        <span className="font-medium">{company}</span>
                        <CheckCircle size={14} className="text-green-500" />
                    </div>

                    {/* Job Title */}
                    <div className="md:col-span-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                            {title}
                        </h1>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2 flex md:justify-end">
                        {job.benefits?.includes("Actively Hiring") && (
                            <span className="px-3 py-1 text-xs rounded-full border border-green-500/30 text-green-400">
                                Actively Hiring
                            </span>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="md:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            {location}
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} />
                            {type}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            {formattedDate}
                        </div>
                        {applicants && (
                            <div className="flex items-center gap-2">
                                <Users size={16} />
                                {applicants}+ applicants
                            </div>
                        )}
                    </div>
                </header>

                {/* ================= ACTION BAR ================= */}
                <section className="flex flex-wrap gap-4 items-center justify-between p-5 rounded-xl bg-green-900/10 border border-green-800/30">
                    <button
                        onClick={() => onApply?.(job)}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition"
                    >
                        Apply Now
                    </button>

                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-lg border border-green-800/50">
                            <Bookmark size={18} />
                        </button>
                        <button className="p-2 rounded-lg border border-green-800/50">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </section>

                {/* ================= CONTENT ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT COLUMN */}
                    <section className="space-y-8">

                        {/* Overview */}
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Job Overview
                            </h2>
                            <div
                                className="prose prose-invert max-w-none text-sm"
                                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                            />
                        </div>

                        {/* Responsibilities */}
                        {sections.responsibilities.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    Responsibilities
                                </h3>
                                <ul className="list-disc ml-5 space-y-2 text-sm">
                                    {sections.responsibilities.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    {/* RIGHT COLUMN */}
                    <section className="space-y-6">

                        {/* Requirements */}
                        {sections.requirements.length > 0 && (
                            <div className="p-6 rounded-xl bg-[#0b0f0e] border border-green-800/20">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Requirements
                                </h3>
                                <ul className="space-y-3 text-sm">
                                    {sections.requirements.map((item, i) => (
                                        <li key={i} className="flex gap-2">
                                            <CheckCircle size={16} className="text-green-500 mt-1" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Preferred */}
                        {sections.preferred.length > 0 && (
                            <div className="p-6 rounded-xl bg-[#0b0f0e] border border-green-800/20">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Preferred Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {sections.preferred.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full text-xs border border-green-800/40"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* ================= ABOUT COMPANY ================= */}
                <section className="pt-6 border-t border-green-800/30">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        About {company}
                    </h2>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                            <Building2 size={22} className="text-black" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-300">
                                {company} is a growing organization working on impactful
                                products across industries.
                            </p>
                            {job.link && (
                                <a
                                    href={job.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-green-400 mt-2"
                                >
                                    <Globe size={14} />
                                    View original job post
                                </a>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default JobDetailsPanel;
