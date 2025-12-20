"use client";

import React from "react";

export default function Feature() {
    const features = [
        {
            icon: "cloud_download",
            title: "AI-Powered Scraping",
            description: "Automatically extract job listings from LinkedIn, Indeed, and Glassdoor simultaneously with zero manual effort."
        },
        {
            icon: "tune",
            title: "Intelligent Filtering",
            description: "Set your criteria once. Our smart algorithms filter out 98% of irrelevant noise to present only high-value matches."
        },
        {
            icon: "dashboard",
            title: "Automated Dashboard",
            description: "Track every application status, interview schedule, and follow-up reminder in one centralized, real-time command center."
        }
    ];

    const stats = [
        { value: "50K+", label: "Jobs Processed Daily" },
        { value: "95%", label: "Accuracy Rate" },
        { value: "2.5x", label: "Faster Job Discovery" }
    ];

    return (
        <>
            <section className="py-24 relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold sm:text-4xl text-white">AI-Powered Features</h2>
                        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Everything you need to automate your job hunt and land your dream role faster.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="glass-card rounded-2xl p-8 flex flex-col gap-6 group">
                                <div className="h-12 w-12 rounded-lg bg-[#00FA92]/10 flex items-center justify-center text-[#00FA92] group-hover:bg-[#00FA92] group-hover:text-[#0a110a] transition-colors">
                                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                                <button className="mt-auto flex items-center text-[#00FA92] text-sm font-bold hover:text-white transition-colors">
                                    Learn More <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="border-y border-white/5 bg-[#121e12]/50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center px-4 py-2">
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{stat.value}</div>
                                <div className="text-[#00FA92] font-medium text-sm uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
