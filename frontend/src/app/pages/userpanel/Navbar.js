"use client";

import { useState } from "react";

export default function UserNavbar({ onSidebarToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="flex justify-between  fixed items-center w-full bg-[#0a0f0d] p-4 text-white  z-50">
      {/* Left: Hamburger */}
      <button
        onClick={onSidebarToggle}
        className="text-2xl focus:outline-none"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 5h18M2 11h18M2 17h18"
            stroke="#4ADE80"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Right: User Circle */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="focus:outline-none rounded-full p-1"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="20" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0" y1="20" x2="40" y2="20">
                <stop stopColor="#4ADE80" />
                <stop offset="1" stopColor="#16A34A" />
              </linearGradient>
            </defs>
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#1F2937] text-green-400 rounded-md shadow-lg z-50">
            <button className="block w-full text-left px-4 py-2 hover:bg-[#2e3b34]">
              Profile
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-[#2e3b34]">
              Settings
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-[#2e3b34] text-red-400">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
