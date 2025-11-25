// src/app/components/Feature.js
import React from "react";
import { Cpu, Filter, LayoutDashboard } from "lucide-react";

/**
 * Feature section (JSX). No images used.
 * Tailwind classes assume Tailwind is configured in your Next.js project.
 */

export default function Feature() {
    const cards = [
        {
            id: 1,
            title: "AI-Powered Scraping",
            body:
                "Advanced machine learning algorithms automatically scan and extract relevant job postings from LinkedIn with 99.7% accuracy.",
            icon: <Cpu className="h-6 w-6" />,
        },
        {
            id: 2,
            title: "Intelligent Filtering",
            body:
                "Smart categorization and filtering system that learns your preferences and delivers only the most relevant opportunities.",
            icon: <Filter className="h-6 w-6" />,
        },
        {
            id: 3,
            title: "Automated Dashboard",
            body:
                "Real-time tracking dashboard with analytics, application status, and performance metrics to optimize your job search strategy.",
            icon: <LayoutDashboard className="h-6 w-6" />,
        },
    ];

    return (
        <section className="bg-[#050807] text-white py-20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center">
                    <span className="text-white">Smart Data.</span>{" "}
                    <span className="text-[#00ff66]">Smarter Opportunities</span>
                </h2>

                <p className="text-center text-gray-300 mt-4 max-w-2xl mx-auto">
                    Experience the future of job hunting with cutting-edge AI automation
                </p>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cards.map((c) => (
                        <article
                            key={c.id}
                            className="group relative bg-[#07110f] border border-[#0f1f1a] rounded-xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-transform transform hover:-translate-y-1"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-11 w-11 rounded-lg bg-[#00180f] ring-2 ring-[#002815] flex items-center justify-center shadow-[0_6px_18px_rgba(0,255,102,0.06)] group-hover:shadow-[0_8px_24px_rgba(0,255,102,0.12)]">
                                        <div className="text-[#00ff66]">{c.icon}</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-white font-semibold text-lg">
                                        {c.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-300 max-w-md">
                                        {c.body}
                                    </p>

                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-2 mt-4 text-[#00ff66] font-medium text-sm"
                                    >
                                        Learn More
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* subtle neon border glow (pseudo) */}
                            <div className="pointer-events-none absolute inset-0 rounded-xl border border-transparent group-hover:border-[#003d28]/60" />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
