import React from "react";

export default function Hero({ variant = "B" }) {
    return (
        <section className="relative bg-[#050807] text-white overflow-hidden">
            {/* decorative rounded block behind the copy */}
            <div className="absolute -left-28 -top-20 w-[520px] h-[420px] rounded-3xl bg-gradient-to-br from-[#032014]/40 to-[#06251a]/30 blur-xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 py-32 lg:py-40">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* LEFT – copy */}
                    <div className="md:col-span-7 lg:col-span-6">
                        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
                            <span className="block">Find</span>
                            <span className="block">Opportunities</span>
                            <span className="block text-[#00ff66]">Smarter with AI</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-gray-300">
                            Revolutionize your job search with AI‑powered LinkedIn automation. Let intelligent algorithms work while you focus on growth.
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                            <a href="#" className="inline-flex items-center gap-2 bg-[#00ff66] text-black font-semibold px-5 py-3 rounded-full shadow-lg hover:opacity-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M2 16.5V21l4.5-1.5" stroke="#000" />
                                    <path d="M14.5 4.5c2 2 3 5.5 3 9s-1.5 7-3.5 8l-7-7C4 13 6.5 11.5 9.5 9.5c2-1.5 4-3 5-5z" stroke="#000" />
                                </svg>
                                Start Free Trial
                            </a>
                            <a href="#" className="inline-flex items-center gap-2 border border-[#0f5b36] text-[#9dfcc2] px-5 py-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2v6l4 4" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                View Demo
                            </a>
                        </div>
                    </div>

                    {/* RIGHT – cards + optional visuals */}
                    <div className="md:col-span-5 lg:col-span-6 flex justify-center md:justify-end">
                        <div className="relative w-[420px] max-w-full">
                            {/* floating translucent panel */}
                            <div className="absolute -left-10 top-6 w-[360px] h-[220px] rounded-2xl bg-[#0b1110]/60 backdrop-blur-sm shadow-2xl border border-[#0e261f]/40" />

                            <div className="relative z-10 p-6 w-[360px] h-[220px] rounded-2xl bg-[#0b1110] shadow-xl border border-[#14221a]">
                                <div className="space-y-4">
                                    <StatusRow text="Scanning LinkedIn jobs..." />
                                    <StatusRow text="AI filtering 2,847 positions..." />
                                    <StatusRow text="Found 23 perfect matches!" />
                                </div>
                            </div>

                            {/* subtle shadow/gradient */}
                            <div className="absolute right-0 bottom-0 w-40 h-24 rounded-md bg-gradient-to-br from-transparent to-[#00140a]/30 transform translate-x-6 translate-y-6" />

                            {/* Variant‑specific visuals */}
                            {variant === "B" && (
                                <>
                                    {/* soft green glow */}
                                    <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full filter blur-3xl bg-[#00ff66]/30 pointer-events-none" />
                                    {/* overlapping dark rounded rectangle */}
                                    <div className="absolute -right-6 -top-6 w-48 h-28 rounded-2xl bg-gradient-to-br from-[#071612] to-[#0b1811] opacity-70 transform rotate-6 pointer-events-none" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatusRow({ text }) {
    return (
        <div className="flex items-center gap-4 bg-[#0f1720]/20 p-3 rounded-lg border border-[#12221a]/40">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-3 h-3 rounded-full bg-[#00ff66] shadow-sm" />
            <div className="flex-1">
                <div className="text-sm text-gray-200">{text}</div>
            </div>
        </div>
    );
}
