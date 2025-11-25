// 'use client';

import Image from 'next/image';

export default function About() {
  const stats = [
    { number: "50K+", label: "Jobs Processed Daily" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "2.5x", label: "Faster Job Discovery" },
  ];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-[#050807]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-6 lg:space-y-8">
            <h2 className="text-[24px] sm:text-[36px] lg:text-[48px] font-extrabold leading-[30px] sm:leading-[44px] lg:leading-[48px] text-[#ffffff] font-['Inter']">
              Revolutionizing Job Search Automation
            </h2>
            <div className="space-y-6 lg:space-y-7">
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[26px] sm:leading-[30px] lg:leading-[33px] text-[#9ca3af] font-['Inter']">
                Born from the frustration of manual job searching, JobScraper AI was created to eliminate the tedious process of browsing through hundreds of irrelevant listings.
              </p>
              <p className="text-[16px] sm:text-[18px] font-normal leading-[24px] sm:leading-[26px] lg:leading-[30px] text-[#9ca3af] font-['Inter']">
                Our mission is simple: Let AI handle the searching while you focus on what matters most - preparing for your dream role and advancing your career.
              </p>
              {/* Stats */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 pt-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center sm:text-left">
                    <div className="text-[24px] sm:text-[30px] font-bold leading-[30px] sm:leading-[37px] text-[#ffffff] font-['Inter'] mb-1">
                      {stat.number}
                    </div>
                    <div className="text-[14px] sm:text-[16px] font-normal leading-[18px] sm:leading-[20px] text-[#9ca3af] font-['Inter']">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image Card */}
          <div
            className="bg-[#ffffff0c] border rounded-[16px] p-6 lg:p-8"
            style={{
              borderColor: "#00fa924c",
              boxShadow: "0px 0px 20px rgba(0, 250, 146, 0.1)",
            }}
          >
            <Image
              src="/about.png"
              alt="JobScraper AI Dashboard"
              width={800}
              height={600}
              className="w-full h-auto rounded-[12px] mb-6"
            />
            <h3 className="text-[20px] sm:text-[24px] font-bold leading-[24px] sm:leading-[30px] text-[#ffffff] font-['Inter'] text-center mb-4">
              Your Dream Job — Found by Automation
            </h3>
            <div className="space-y-2">
              <p className="text-[14px] sm:text-[16px] font-normal leading-[18px] sm:leading-[20px] text-[#9ca3af] font-['Inter']">
                Experience the future of career advancement with our cutting‑edge
              </p>
              <p className="text-[14px] sm:text-[16px] font-normal leading-[18px] sm:leading-[20px] text-[#9ca3af] font-['Inter']">
                AI technology that never sleeps, never misses an opportunity, and
              </p>
              <p className="text-[14px] sm:text-[16px] font-normal leading-[18px] sm:leading-[20px] text-[#9ca3af] font-['Inter']">
                always works in your favor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
