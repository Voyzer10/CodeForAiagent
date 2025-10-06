// components/UserNavbar.js
"use client"; // For Next.js 13+ app directory

import { useState } from "react";


export default function UserNavbar({ onSidebarToggle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="flex  min-w-full justify-between bg-[#0a0f0d] p-4 text-white shadow-md">
            {/* Left: Hamburger */}
            <button
                onClick={onSidebarToggle}
                className="text-2xl focus:outline-none"
            >
                <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_27_361)">
                        <path d="M0 4.25C0 3.55859 0.558594 3 1.25 3H16.25C16.9414 3 17.5 3.55859 17.5 4.25C17.5 4.94141 16.9414 5.5 16.25 5.5H1.25C0.558594 5.5 0 4.94141 0 4.25ZM0 10.5C0 9.80859 0.558594 9.25 1.25 9.25H16.25C16.9414 9.25 17.5 9.80859 17.5 10.5C17.5 11.1914 16.9414 11.75 16.25 11.75H1.25C0.558594 11.75 0 11.1914 0 10.5ZM17.5 16.75C17.5 17.4414 16.9414 18 16.25 18H1.25C0.558594 18 0 17.4414 0 16.75C0 16.0586 0.558594 15.5 1.25 15.5H16.25C16.9414 15.5 17.5 16.0586 17.5 16.75Z" fill="#4ADE80" />
                    </g>
                    <defs>
                        <clipPath id="clip0_27_361">
                            <path d="M0 0.5H17.5V20.5H0V0.5Z" fill="white" />
                        </clipPath>
                    </defs>
                </svg>

            </button>



            {/* Right: User Circle */}
            <div className="relative">
                <button
                    onClick={toggleDropdown}
                    className="focus:outline-none text-2xl rounded-full  p-1"
                >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20C0 8.95431 8.95431 0 20 0Z" fill="url(#paint0_linear_27_311)" />
                        <path d="M20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20C0 8.95431 8.95431 0 20 0Z" />
                        <defs>
                            <linearGradient id="paint0_linear_27_311" x1="0" y1="20" x2="40" y2="20" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#4ADE80" />
                                <stop offset="1" stop-color="#16A34A" />
                            </linearGradient>
                        </defs>
                    </svg>

                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1F2937] text-green-500  items-center rounded-md shadow-lg z-50">
                        <button className="block w-full text-left px-4 py-3 hover:from-green-400 hover:to-green-300">
                            Profile
                        </button>
                        <button className="block w-full text-left px-4 py-3 hover:from-green-400 hover:to-green-300">
                            Settings
                        </button>
                        <button className="block w-full text-left px-4 py-3 hover:from-green-400 hover:to-green-300">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
