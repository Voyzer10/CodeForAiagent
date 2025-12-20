"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    goals: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 bg-[#121e12]/50 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div className="text-left">
            <h2 className="text-3xl font-bold mb-2 text-white tracking-tight">Ready to Transform Your Career?</h2>
            <p className="text-gray-400 mb-8">Get in touch or start your trial today.</p>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#0a110a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00FA92] focus:ring-1 focus:ring-[#00FA92] outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#0a110a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00FA92] focus:ring-1 focus:ring-[#00FA92] outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company (Optional)</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-[#0a110a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00FA92] focus:ring-1 focus:ring-[#00FA92] outline-none transition-colors"
                  placeholder="Current Company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tell us about your goals</label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  className="w-full bg-[#0a110a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00FA92] focus:ring-1 focus:ring-[#00FA92] outline-none transition-colors"
                  placeholder="I'm looking for senior engineering roles..."
                  rows="4"
                ></textarea>
              </div>
              <button className="w-full py-4 rounded-lg bg-white text-[#0a110a] font-bold hover:bg-[#00FA92] transition-colors" type="button">
                Send Message
              </button>
            </form>
          </div>

          {/* Side Info */}
          <div className="flex flex-col justify-center space-y-8 lg:pl-12 border-l border-white/5 text-left">
            {[
              { icon: "mail", title: "Email Us", detail: "hello@jobscraperai.com" },
              { icon: "calendar_month", title: "Book a Demo", detail: "Schedule a 15-min walkthrough with our team." },
              { icon: "support_agent", title: "24/7 Support", detail: "Our automated agents are always here to help." }
            ].map((info, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-[#00FA92]/10 flex items-center justify-center shrink-0 text-[#00FA92]">
                  <span className="material-symbols-outlined">{info.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{info.title}</h3>
                  <p className="text-gray-400">{info.detail}</p>
                </div>
              </div>
            ))}

            <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[#00FA92]/20 to-transparent border border-[#00FA92]/20">
              <p className="text-white font-medium italic italic">&quot;JobScraper AI changed my life. I found my current role at a Fortune 500 company in just 3 days.&quot;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-500 bg-cover overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtCRt-uW_4-wacDwq1_kOiMQ79Ato06959YkYi_qvPos3bWiniTOTx_Cw0XxmyEzOJqsV37BGB1RPiJHgyKJmlCIncrYYTEb9fpar4Gk9DKqncZNxgQiNx8kUeNG1bx61L-vWvL9zD9bMX1Jgb5rWcn9ElCfbJshrfLXoUyRnLoaXi3UMroIZrWnr_RXqA-M1DIE5RhEBmFgjVvkqnDfL7CIldjxv5m2Wv8NAvqYx0ld63qwwQO_EMmUIIk_sQH0lleGMtj3T9i18"
                    width={32}
                    height={32}
                    alt="Sarah J."
                    className="object-cover"
                  />
                </div>
                <span className="text-sm text-gray-400 font-medium">Sarah J., Product Manager</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
