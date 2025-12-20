// 'use client';

import Image from 'next/image';

export default function About() {
  const stats = [
    { number: "50K+", label: "Jobs Processed Daily" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "2.5x", label: "Faster Job Discovery" },
  ];

  return (
    <>
      <section className="relative z-10 py-20 bg-[#121e12]/50 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 relative h-64 w-full md:h-96 rounded-2xl overflow-hidden border border-white/10 group">
              {/* Abstract AI Image placeholder style using local assets or URL */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBjfK1OKNU2FQjy6ThoBDdmDV3hLLCKl5epdHXZEYFUmmw91Jgvt9xk3gwTxXtEjUq_mgVlP56kRTUAwTBHvUordO-HFVYcsSRcHZKI8xOvLs7Rxv43pOHjPayGOkv4P8_cZZvPn0EEP-L-KbaQ1Om4fkpv6QIA3N-fupKOOC8gB0lmnoc_OTv5mXOtSS7zqY1UNRDUFYJ0Rcu2fwTsTttl1bIrUJxYRBpeaQW4qilUf13DGZ_wKOhS_64OHVBV8FAa_ooUxMcNzOI")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a110a] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-2 w-2 rounded-full bg-[#00FA92] animate-pulse"></span>
                  <span className="text-xs font-mono text-[#00FA92] uppercase">Live Data Feed</span>
                </div>
                <div className="flex gap-2 text-white">
                  <span className="bg-black/50 backdrop-blur px-3 py-1 rounded text-xs border border-white/10">Scraping...</span>
                  <span className="bg-black/50 backdrop-blur px-3 py-1 rounded text-xs border border-white/10">Analyzing...</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight text-white">
                Smart Data. <br />
                <span className="text-[#00FA92]">Smarter Opportunities.</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Stop scrolling endlessly. Our AI analyzes millions of data points to identify job openings that match your unique profile, skills, and career goals before they even trend.
              </p>
              <ul className="space-y-4">
                {[
                  "Automated application tracking",
                  "Keyword optimization for ATS",
                  "Real-time salary insights"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00FA92] mt-1">check</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#00FA92]/10 text-[#00FA92] mb-6 shadow-[0_0_20px_rgba(0,250,146,0.1)]">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-white tracking-tight sm:text-4xl">Revolutionizing Job Search Automation</h2>
          <p className="text-gray-400 leading-relaxed text-lg font-medium">
            At JobScraper AI, we believe talent should not be wasted on refreshing job boards. Our mission is to democratize access to career opportunities by putting the same powerful AI tools used by recruiters into the hands of job seekers. We are building the future where your next career leap finds you, not the other way around.
          </p>
        </div>
      </section>
    </>
  );
}
