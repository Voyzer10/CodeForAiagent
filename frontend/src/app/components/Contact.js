'use client';
import { useState } from 'react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const contactOptions = [
    {
      icon: "/images/img_vector.svg",
      title: "Email Us",
      description: "hello@jobscraperai.com"
    },
    {
      icon: "/images/img_div_black_900_01_48x48.svg",
      title: "Book a Demo",
      description: "Schedule a personalized walkthrough"
    },
    {
      icon: "/images/img_div_48x48.svg",
      title: "24/7 Support",
      description: "We're here when you need us"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    // handle submission logic here (API call / form handler)
    console.log('submit', formData);
  };

  return (
    <section id="contact" className="w-full py-12 sm:py-16 lg:py-20 bg-[#050807]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12 lg:mb-16">
          <h2
            className="text-[24px] sm:text-[36px] lg:text-[48px] font-bold leading-[30px] sm:leading-[44px] lg:leading-[59px] text-[#ffffff] font-['Inter'] mb-4"
          >
            Ready to Transform Your Career?
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[20px] sm:leading-[23px] lg:leading-[25px] text-[#9ca3af] text-center font-['Inter']">
            Get in touch and let&apos;s discuss how AI can accelerate your job search
          </p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Decorative faint green glow (uses uploaded local file path for transform) */}
          <img
            src="/mnt/data/67db632c-c81a-4c9c-93b4-80f77be2160f.png"
            alt="decor"
            className="hidden lg:block absolute -left-24 -top-24 w-[420px] h-auto opacity-5 pointer-events-none"
          />

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#ffffff0c] border border-[#00fa924c] rounded-[16px] p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,250,146,0.06) inset' }}
          >
            <div className="space-y-6">
              {/* Name */}
              <div className="border-b border-[#4b5563] pb-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-[16px] font-normal leading-[20px] text-[#adaebc] placeholder-[#adaebc] border-none outline-none font-['Inter']"
                />
              </div>

              {/* Email */}
              <div className="border-b border-[#4b5563] pb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-[16px] font-normal leading-[20px] text-[#adaebc] placeholder-[#adaebc] border-none outline-none font-['Inter']"
                />
              </div>

              {/* Company */}
              <div className="border-b border-[#4b5563] pb-3">
                <input
                  type="text"
                  name="company"
                  placeholder="Company (Optional)"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-[16px] font-normal leading-[20px] text-[#adaebc] placeholder-[#adaebc] border-none outline-none font-['Inter']"
                />
              </div>

              {/* Message */}
              <div className="pt-2">
                <textarea
                  name="message"
                  placeholder="Tell us about your job search goals..."
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full bg-transparent text-[16px] font-normal leading-[20px] text-[#adaebc] placeholder-[#adaebc] border-none outline-none resize-none font-['Inter']"
                />
              </div>

              {/* Send Button */}
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-3 rounded-[30px] px-[34px] py-[16px] font-semibold text-[18px] leading-[22px]"
                  style={{
                    background: 'linear-gradient(90deg,#00fa92 0%, #4ade80 100%)',
                    color: '#030604',
                    boxShadow: '0 12px 30px rgba(0,250,146,0.14)'
                  }}
                >
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M2 11L16 2L11 17L8 13L2 11Z" fill="#030604"/>
                  </svg>
                  Send Message
                </button>
              </div>
            </div>
          </form>

          {/* Contact Options */}
          <div className="space-y-6 lg:space-y-8">
            {contactOptions.map((option, index) => (
              <div
                key={index}
                className="bg-[#ffffff0c] border border-[#00fa924c] rounded-[12px] p-6 flex items-center gap-4 hover:border-[#00fa92] transition-all duration-200 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 20px rgba(0,250,146,0.06) inset' }}
                onClick={() => {
                  // Option click handler placeholder
                  if (option.title === 'Email Us') {
                    window.location.href = 'mailto:hello@jobscraperai.com';
                  }
                }}
              >
                <div
                  className="w-12 h-12 rounded-[24px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(90deg,#00fa92 0%,#4ade80 100%)' }}
                >
                  <img src={option.icon} alt="" className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-[16px] sm:text-[18px] font-bold leading-[20px] sm:leading-[22px] text-[#ffffff] font-['Inter'] mb-1">
                    {option.title}
                  </h3>
                  <p className="text-[14px] sm:text-[16px] font-normal leading-[18px] sm:leading-[20px] text-[#9ca3af] font-['Inter']">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
