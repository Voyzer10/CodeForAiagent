// src/app/components/CTA.jsx
'use client';
import React from "react";


export default function CTA() {
  const steps = [
    {
      icon: "/images/img_search.svg",
      title: "1. Smart Scanning",
      description:
        "AI continuously scans LinkedIn for new opportunities matching your criteria",
    },
    {
      icon: "/images/img_div_black_900_01.svg",
      title: "2. Intelligent Filter",
      description:
        "Advanced algorithms filter and rank jobs based on your preferences and history",
    },
    {
      icon: "/images/img_i_black_900_01.svg",
      title: "3. Instant Alerts",
      description:
        "Get notified immediately when perfect opportunities are discovered",
    },
  ];

  return (
    <section id="demo" className="w-full py-12 sm:py-16 lg:py-20 bg-[#050807]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12 lg:mb-16">
          <h2
            className="text-[24px] sm:text-[36px] lg:text-[48px] font-black leading-[30px] sm:leading-[44px] lg:leading-[48px] font-['Inter'] mb-3"
          >
            <span className="text-[#ffffff]">See It</span>
            <span className="text-[#00fa92]"> In Action</span>
          </h2>

          <p
            className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[20px] sm:leading-[26px] lg:leading-[28px] text-[#d1d5db] text-center font-['Inter'] max-w-4xl mx-auto"
          >
            Watch how our AI transforms your job search from manual browsing to automated success
          </p>
        </div>

        {/* Panel */}
        <div
          className="relative bg-[#0b1b17] border rounded-[16px] p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          style={{
            borderColor: "#00fa924c",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* subtle green glow behind the panel (pure CSS) */}
          <div className="pointer-events-none absolute inset-0 rounded-[16px] -z-10">
            <div
              className="absolute inset-0 rounded-[16px]"
              style={{
                boxShadow: "0 0 60px rgba(0,250,146,0.08) inset, 0 20px 60px rgba(0,0,0,0.6)",
              }}
            />
          </div>

          {/* optional decorative image (local path provided) */}
          <img
            src="/mnt/data/daa79b64-6ea5-474e-9455-a10ad7d8cf73.png"
            alt="decorative demo"
            className="hidden md:block absolute right-[36px] top-[-44px] w-[240px] h-auto opacity-10 pointer-events-none rounded-lg"
          />

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-24 mb-8 lg:mb-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center px-4">
                <div
                  className="w-[72px] h-[72px] rounded-[40px] flex items-center justify-center mx-auto mb-5"
                  style={{
                    background:
                      "linear-gradient(90deg,#00fa92 0%, #4ade80 100%)",
                  }}
                >
                  {/* use user icons if present; fallback to a simple SVG if not */}
                  <img
                    src={step.icon}
                    alt=""
                    className="w-6 h-8"
                    onError={(e) => {
                      // fallback SVG icon if image not found
                      // convert to a data-URI SVG by injecting into DOM (simple fallback)
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* fallback circle with magnifier for first item when icon unavailable */}
                  {!step.icon && (
                    <svg
                      className="w-6 h-6 text-[#030604]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M21 21l-4.35-4.35" stroke="#030604" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="11" cy="11" r="6" stroke="#030604" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                <h3 className="text-[18px] sm:text-[20px] font-bold leading-[22px] sm:leading-[25px] text-[#ffffff] font-['Inter'] mb-4">
                  {step.title}
                </h3>

                <p className="text-[14px] sm:text-[16px] font-normal leading-[20px] sm:leading-[24px] text-[#9ca3af] font-['Inter']">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              type="button"
              className="inline-flex items-center gap-3 justify-center rounded-[30px] px-[32px] py-[16px] font-semibold text-[18px] leading-[22px]"
              style={{
                background: "linear-gradient(90deg,#00fa92 0%, #4ade80 100%)",
                color: "#030604",
                boxShadow: "0 12px 30px rgba(0,250,146,0.14)",
              }}
            >
              {/* small play icon */}
              <svg
                width="14"
                height="18"
                viewBox="0 0 14 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path d="M1 1L13 9L1 17V1Z" fill="#030604" />
              </svg>

              <span>Watch Full Demo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
