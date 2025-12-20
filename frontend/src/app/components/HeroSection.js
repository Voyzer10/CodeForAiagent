"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative pt-20 overflow-hidden">
            {/* Neural Network Background Effect */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#00FA92]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-[#00FA92]/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    {/* Hero Content */}
                    <div className="flex flex-col gap-6 max-w-2xl">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[#00FA92] backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FA92] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FA92]"></span>
                            </span>
                            v2.0 Now Live: Enhanced LinkedIn Automation
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
                            Find Opportunities <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FA92] to-white">Smarter with AI</span>
                        </h1>
                        <p className="text-lg leading-relaxed text-gray-400 max-w-lg">
                            Revolutionize your job search with AI-powered LinkedIn automation. Let intelligent algorithms work while you focus on interview prep and career growth.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-4">
                            <Link href="/auth/register" className="flex h-12 items-center justify-center rounded-xl bg-[#00FA92] px-8 text-base font-bold text-[#0a110a] transition-all hover:bg-white hover:scale-105">
                                Start Free Trial
                            </Link>
                            <button className="flex h-12 items-center justify-center rounded-xl border border-white/20 bg-transparent px-8 text-base font-bold text-white transition-all hover:bg-white/10 hover:border-white/40">
                                <span className="material-symbols-outlined mr-2 text-xl">play_circle</span>
                                View Demo
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0a110a] bg-gray-700 bg-cover overflow-hidden">
                                        <Image
                                            src={`https://lh3.googleusercontent.com/aida-public/AB6AXuANPzE8K9ylaIXtEWXMQaYhwBODLE29MbBxxTNaeURJOsXP4WpUL5E34FsAqu5tCrBdEumaNf-xESqVdJere5Qz1vvChGNQDQMa3OLBZZAcA1s9GXyUeFnlQS4RvewyZqX-lwpOzDiQy0ng4HekWgtUHQWx9YtIBkY7TFkkINBNA1KK8lFJr9gpHQibpkodxwCpW-8K2EP2AH-gLvCt-OEI6UahxboKGcMMQwYdPMzXPEFLAbfS4TV8eOzaQlrA9Yb5w71rQEpeOao`}
                                            width={32}
                                            height={32}
                                            alt="User avatar"
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by 10,000+ job seekers</p>
                        </div>
                    </div>

                    {/* Hero Visual - Glassmorphic Dashboard */}
                    <div className="relative lg:ml-auto w-full max-w-[500px]">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00FA92] to-blue-600 rounded-2xl blur opacity-20"></div>
                        <div className="relative glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="text-xs font-mono text-gray-400">agent_status: <span className="text-[#00FA92]">active</span></div>
                            </div>
                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#00FA92] animate-spin">radar</span>
                                        <span className="text-gray-300">Scanning LinkedIn jobs...</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Target: Product Designer</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-400">filter_list</span>
                                        <span className="text-gray-300">AI filtering positions...</span>
                                    </div>
                                    <span className="text-xs text-blue-400">2,847 Processed</span>
                                </div>
                                <div className="p-3 rounded bg-[#00FA92]/10 border border-[#00FA92]/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="material-symbols-outlined text-[#00FA92]">check_circle</span>
                                        <span className="text-white font-bold">Found 23 perfect matches!</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[#00FA92] h-full rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                <div className="pt-2 space-y-2">
                                    <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer">
                                        <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-xs font-bold font-sans">L</div>
                                        <div className="flex-1 min-w-0 font-sans">
                                            <p className="text-white truncate">Senior Product Designer</p>
                                            <p className="text-xs text-gray-500 truncate">Remote • $120k - $160k</p>
                                        </div>
                                        <span className="text-[10px] text-[#00FA92] border border-[#00FA92]/30 px-2 py-0.5 rounded font-sans uppercase font-bold">98% Match</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer">
                                        <div className="h-8 w-8 rounded bg-purple-600 flex items-center justify-center text-xs font-bold font-sans">S</div>
                                        <div className="flex-1 min-w-0 font-sans">
                                            <p className="text-white truncate">UX/UI Lead</p>
                                            <p className="text-xs text-gray-500 truncate">Hybrid • $140k+</p>
                                        </div>
                                        <span className="text-[10px] text-[#00FA92] border border-[#00FA92]/30 px-2 py-0.5 rounded font-sans uppercase font-bold">95% Match</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
