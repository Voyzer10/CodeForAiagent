"use client";

import React from "react";

export default function CTA() {
  const steps = [
    {
      icon: "radar",
      title: "Smart Scanning",
      description: "Our bots crawl major job boards 24/7 based on your exact parameters.",
      active: true
    },
    {
      icon: "filter_alt",
      title: "Intelligent Filter",
      description: "AI analyzes job descriptions to ensure a 90%+ match with your resume.",
      active: false
    },
    {
      icon: "notifications_active",
      title: "Instant Alerts",
      description: "Get notified via Email, Slack, or SMS the moment a match is found.",
      active: false
    }
  ];

  return (
    <section className="py-24 bg-[#0a110a] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold mb-6 text-white">Your Dream Job — <br /><span className="text-[#00FA92]">Found by Automation</span></h2>
            <p className="text-gray-400 mb-8">
              Experience the future of career advancement with our cutting-edge AI technology that never sleeps, never misses an opportunity, and always works in your favor.
            </p>
            <button className="flex items-center gap-4 text-white font-bold hover:text-[#00FA92] transition-colors group">
              <span className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#00FA92]/10 group-hover:border-[#00FA92]/30 transition-all">
                <span className="material-symbols-outlined">play_arrow</span>
              </span>
              Watch Full Demo
            </button>
          </div>
          <div className="md:w-2/3">
            <div className="space-y-12 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#00FA92]/50 to-transparent"></div>

              {steps.map((step, index) => (
                <div key={index} className="relative flex gap-6">
                  <div className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#121e12] border ${step.active ? 'border-[#00FA92]/50 shadow-[0_0_20px_rgba(0,250,146,0.2)]' : 'border-white/10'}`}>
                    <span className={`material-symbols-outlined ${step.active ? 'text-[#00FA92]' : 'text-gray-400'}`}>{step.icon}</span>
                  </div>
                  <div className="pt-2 text-left">
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
