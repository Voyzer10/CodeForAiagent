// src/app/components/Footer.js
'use client';

import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full bg-[#050807] px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-[1440px] mx-auto py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 ">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6 mx-10">
                        <div className="flex items-center gap-3">
                            {/* Logo */}
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center p-2"
                                style={{
                                    background: 'linear-gradient(90deg,#00fa92 0%,#4ade80 100%)',
                                    boxShadow: '0 8px 30px rgba(0,250,146,0.12)',
                                }}
                            >
                                <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M32 0C36.4183 0 40 3.58172 40 8V32C40 36.4183 36.4183 40 32 40H8C3.58172 40 0 36.4183 0 32V8C0 3.58172 3.58172 0 8 0H32Z"
                                        fill="url(#paint0_linear_5_634)"
                                    />
                                    <path
                                        d="M32 0C36.4183 0 40 3.58172 40 8V32C40 36.4183 36.4183 40 32 40H8C3.58172 40 0 36.4183 0 32V8C0 3.58172 3.58172 0 8 0H32Z"
                                        stroke="#E5E7EB"
                                    />
                                    <path d="M29 34H11V6H29V34Z" stroke="#E5E7EB" />
                                    <g clipPath="url(#clip0_5_634)">
                                        <path
                                            d="M17.4688 10.25C18.5551 10.25 19.4375 11.1324 19.4375 12.2188V26.2812C19.4375 27.3676 18.5551 28.25 17.4688 28.25C16.4527 28.25 15.616 27.4801 15.5105 26.4887C15.3277 26.5379 15.1344 26.5625 14.9375 26.5625C13.6965 26.5625 12.6875 25.5535 12.6875 24.3125C12.6875 24.0523 12.7332 23.7992 12.8141 23.5672C11.7523 23.1664 11 22.1398 11 20.9375C11 19.816 11.6574 18.8457 12.6102 18.3957C12.3043 18.0125 12.125 17.5273 12.125 17C12.125 15.9207 12.8844 15.0207 13.8969 14.7992C13.8406 14.6059 13.8125 14.3984 13.8125 14.1875C13.8125 13.1363 14.5367 12.2504 15.5105 12.0043C15.616 11.0199 16.4527 10.25 17.4688 10.25ZM22.5312 10.25C23.5473 10.25 24.3805 11.0199 24.4895 12.0043C25.4668 12.2504 26.1875 13.1328 26.1875 14.1875C26.1875 14.3984 26.1594 14.6059 26.1031 14.7992C27.1156 15.0172 27.875 15.9207 27.875 17C27.875 17.5273 27.6957 18.0125 27.3898 18.3957C28.3426 18.8457 29 19.816 29 20.9375C29 22.1398 28.2477 23.1664 27.1859 23.5672C27.2668 23.7992 27.3125 24.0523 27.3125 24.3125C27.3125 25.5535 26.3035 26.5625 25.0625 26.5625C24.8656 26.5625 24.6723 26.5379 24.4895 26.4887C24.384 27.4801 23.5473 28.25 22.5312 28.25C21.4449 28.25 20.5625 27.3676 20.5625 26.2812V12.2188C20.5625 11.1324 21.4449 10.25 22.5312 10.25Z"
                                            fill="#030604"
                                        />
                                    </g>
                                    <defs>
                                        <linearGradient
                                            id="paint0_linear_5_634"
                                            x1="0"
                                            y1="20"
                                            x2="40"
                                            y2="20"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop stopColor="#00FA92" />
                                            <stop offset="1" stopColor="white" />
                                        </linearGradient>
                                        <clipPath id="clip0_5_634">
                                            <path d="M11 10.25H29V28.25H11V10.25Z" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-white font-['Inter'] leading-tight lg:leading-[30px]">
                                JobScraper AI
                            </h2>
                        </div>
                        <p className="text-base text-[#9ca3af] font-['Inter'] leading-6 max-w-md">
                            Revolutionizing job search with intelligent automation and AI-powered insights.
                        </p>
                        <div className="flex gap-4">
                            {/* Twitter */}
                            <button
                                className="w-10 h-10 bg-[#ffffff0c] border border-[#ffffff19] rounded-[20px] flex items-center justify-center hover:bg-[#ffffff1a] transition-colors"
                                aria-label="Follow us on Twitter"
                                title="Twitter"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M16 16H0V0H16V16Z"  />
                                    <path
                                        d="M14.3553 4.741C14.3655 4.88313 14.3655 5.02529 14.3655 5.16741C14.3655 9.50241 11.066 14.4973 5.03553 14.4973C3.17766 14.4973 1.45178 13.9593 0 13.0253C0.263969 13.0557 0.51775 13.0659 0.791875 13.0659C2.32484 13.0659 3.73603 12.5481 4.86294 11.6649C3.42131 11.6344 2.21319 10.6903 1.79694 9.39075C2 9.42119 2.20303 9.4415 2.41625 9.4415C2.71066 9.4415 3.00509 9.40088 3.27919 9.32985C1.77666 9.02525 0.649719 7.70547 0.649719 6.11157V6.07097C1.08625 6.31463 1.59391 6.46691 2.13194 6.48719C1.24869 5.89835 0.670031 4.89329 0.670031 3.75622C0.670031 3.1471 0.832438 2.58872 1.11672 2.10141C2.73094 4.09125 5.15734 5.39072 7.87813 5.53288C7.82738 5.28922 7.79691 5.03544 7.79691 4.78163C7.79691 2.9745 9.25884 1.50244 11.0761 1.50244C12.0203 1.50244 12.873 1.89838 13.472 2.53797C14.2131 2.39585 14.9238 2.12172 15.5533 1.7461C15.3096 2.50754 14.7918 3.14713 14.1116 3.55319C14.7715 3.48216 15.4111 3.29938 15.9999 3.0456C15.5533 3.69532 14.9949 4.27397 14.3553 4.741Z"
                                        fill="#00FA92"
                                    />
                                </svg>
                            </button>
                            {/* LinkedIn */}
                            <button
                                className="w-10 h-10 bg-[#ffffff0c] border border-[#ffffff19] rounded-[20px] flex items-center justify-center hover:bg-[#ffffff1a] transition-colors"
                                aria-label="Follow us on LinkedIn"
                                title="LinkedIn"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 14 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M14 16H0V0H14V16Z" />
                                    <path
                                        d="M13 1H0.996875C0.446875 1 0 1.45313 0 2.00938V13.9906C0 14.5469 0.446875 15 0.996875 15H13C13.55 15 14 14.5469 14 13.9906V2.00938C14 1.45313 13.55 1 13 1ZM4.23125 13H2.15625V6.31875H4.23438V13H4.23125ZM3.19375 5.40625C2.52812 5.40625 1.99063 4.86562 1.99063 4.20312C1.99063 3.54063 2.52812 3 3.19375 3C3.85625 3 4.39687 3.54063 4.39687 4.20312C4.39687 4.86875 3.85938 5.40625 3.19375 5.40625ZM12.0094 13H9.93437V9.75C9.93437 8.975 9.91875 7.97813 8.85625 7.97813C7.775 7.97813 7.60938 8.82188 7.60938 9.69375V13H5.53438V6.31875H7.525V7.23125H7.55312C7.83125 6.70625 8.50938 6.15312 9.51875 6.15312C11.6187 6.15312 12.0094 7.5375 12.0094 9.3375V13Z"
                                        fill="#00FA92"
                                    />
                                </svg>
                            </button>
                            {/* GitHub */}
                            <button
                                className="w-10 h-10 bg-[#ffffff0c] border border-[#ffffff19] rounded-[20px] flex items-center justify-center hover:bg-[#ffffff1a] transition-colors"
                                aria-label="Follow us on GitHub"
                                title="GitHub"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clipPath="url(#clip0_5_890)">
                                        <path
                                            d="M5.18437 12.4187C5.18437 12.4812 5.1125 12.5312 5.02187 12.5312C4.91875 12.5406 4.84688 12.4906 4.84688 12.4187C4.84688 12.3562 4.91875 12.3062 5.00938 12.3062C5.10313 12.2969 5.18437 12.3469 5.18437 12.4187ZM4.2125 12.2781C4.19063 12.3406 4.25313 12.4125 4.34688 12.4312C4.42813 12.4625 4.52187 12.4312 4.54063 12.3687C4.55938 12.3062 4.5 12.2344 4.40625 12.2063C4.325 12.1844 4.23438 12.2156 4.2125 12.2781ZM5.59375 12.225C5.50313 12.2469 5.44062 12.3063 5.45 12.3781C5.45937 12.4406 5.54063 12.4813 5.63438 12.4594C5.725 12.4375 5.7875 12.3781 5.77812 12.3156C5.76875 12.2563 5.68437 12.2156 5.59375 12.225ZM7.65 0.25C3.31563 0.25 0 3.54063 0 7.875C0 11.3406 2.18125 14.3063 5.29688 15.35C5.69688 15.4219 5.8375 15.175 5.8375 14.9719C5.8375 14.7781 5.82812 13.7094 5.82812 13.0531C5.82812 13.0531 3.64062 13.5219 3.18125 12.1219C3.18125 12.1219 2.825 11.2125 2.3125 10.9781C2.3125 10.9781 1.59687 10.4875 2.3625 10.4969C2.3625 10.4969 3.14062 10.5594 3.56875 11.3031C4.25312 12.5094 5.4 12.1625 5.84688 11.9563C5.91875 11.4563 6.12188 11.1094 6.34688 10.9031C4.6 10.7094 2.8375 10.4562 2.8375 7.45C2.8375 6.59062 3.075 6.15938 3.575 5.60938C3.49375 5.40625 3.22813 4.56875 3.65625 3.4875C4.30937 3.28437 5.8125 4.33125 5.8125 4.33125C6.4375 4.15625 7.10938 4.06563 7.775 4.06563C8.44063 4.06563 9.1125 4.15625 9.7375 4.33125C9.7375 4.33125 11.2406 3.28125 11.8938 3.4875C12.3219 4.57188 12.0563 5.40625 11.975 5.60938C12.475 6.1625 12.7812 6.59375 12.7812 7.45C12.7812 10.4656 10.9406 10.7063 9.19375 10.9031C9.48125 11.15 9.725 11.6187 9.725 12.3531C9.725 13.4062 9.71562 14.7094 9.71562 14.9656C9.71562 15.1687 9.85938 15.4156 10.2563 15.3438C13.3813 14.3062 15.5 11.3406 15.5 7.875C15.5 3.54063 11.9844 0.25 7.65 0.25ZM3.0375 11.0281C2.99687 11.0594 3.00625 11.1313 3.05938 11.1906C3.10938 11.2406 3.18125 11.2625 3.22187 11.2219C3.2625 11.1906 3.25312 11.1187 3.2 11.0594C3.15 11.0094 3.07812 10.9875 3.0375 11.0281ZM2.7 10.775C2.67813 10.8156 2.70937 10.8656 2.77187 10.8969C2.82187 10.9281 2.88438 10.9187 2.90625 10.875C2.92812 10.8344 2.89687 10.7844 2.83437 10.7531C2.77187 10.7344 2.72187 10.7437 2.7 10.775ZM3.7125 11.8875C3.6625 11.9281 3.68125 12.0219 3.75312 12.0813C3.825 12.1531 3.91562 12.1625 3.95625 12.1125C3.99688 12.0719 3.97813 11.9781 3.91563 11.9187C3.84688 11.8469 3.75313 11.8375 3.7125 11.8875ZM3.35625 11.4281C3.30625 11.4594 3.30625 11.5406 3.35625 11.6125C3.40625 11.6844 3.49062 11.7156 3.53125 11.6844C3.58125 11.6438 3.58125 11.5625 3.53125 11.4906C3.4875 11.4188 3.40625 11.3875 3.35625 11.4281Z"
                                            fill="#00FA92"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_5_890">
                                            <path d="M0 0H15.5V16H0V0Z" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12  space-x-16">
                        {/* Product Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white font-['Inter'] leading-tight">Product</h3>
                            <ul className="space-y-3">
                                <li><a href="#features" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Features</a></li>
                                <li><a href="#pricing" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Pricing</a></li>
                                <li><a href="#demo" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Demo</a></li>
                                <li><a href="/api" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">API</a></li>
                            </ul>
                        </div>
                        {/* Company Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white font-['Inter'] leading-tight">Company</h3>
                            <ul className="space-y-3">
                                <li><a href="/about" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">About</a></li>
                                <li><a href="/blog" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Blog</a></li>
                                <li><a href="/careers" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Careers</a></li>
                                <li><a href="#contact" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Contact</a></li>
                            </ul>
                        </div>
                        {/* Support Links */}
                        <div className="space-y-4  space-x-18">
                            <h3 className="text-lg font-bold text-white font-['Inter'] leading-tight">Support</h3>
                            <ul className="space-y-3">
                                <li><a href="/help" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Help Center</a></li>
                                <li><a href="/docs" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Documentation</a></li>
                                <li><a href="/privacy" className="`text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Privacy Policy</a></li>
                                <li><a href="/terms" className="text-base text-[#9ca3af] hover:text-[#00fa92] transition-colors font-['Inter'] leading-5">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Copyright */}
                <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-[#ffffff19]">
                    <p className="text-center text-base text-[#9ca3af] font-['Inter'] leading-5">
                        © 2025 JobScraper AI. All rights reserved. Powered by intelligent automation.
                    </p>
                </div>
            </div>
        </footer>
    );
}
