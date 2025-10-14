"use client";

import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

export default function UserNavbar({ onSidebarToggle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch user");
                setUser(data.user);

                // ✅ Fetch jobs for this user

            } catch (err) {
                console.error("Fetch user error:", err);
                setError(err.message);
            }
        };
        fetchUser();
    }, []);
    return (
        <nav className="flex justify-between  fixed items-center w-full bg-[#0a0f0d] p-4 text-white  z-50 cursor-pointer">
            {/* Left: Hamburger */}
            <button
                onClick={onSidebarToggle}
                className="text-2xl focus:outline-none cursor-pointer py-3"
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
            <div className="relative cursor-pointer">
                <button
                    onClick={toggleDropdown}
                    className="focus:outline-none rounded-full p-1 cursor-pointer"
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
                    <div className="absolute pu-2px-4 right-0 mt-2 w-48 bg-[#1F2937] text-green-400 rounded-md shadow-lg z-50 cursor-pointer border-2 border-white ">
                        {/* User Info */}
                        {user && (
                            <div className="block w-full text-left px-4 py-3 hover:bg-[#2e3b34] border-2 border-white">
                                <p>
                                    <strong className="text-green-400">{user.name}</strong>
                                </p>
                                <p>
                                    <strong className="text-green-400">{user.id}</strong>
                                </p>
                            </div>

                        )}
                        <button className="block w-full text-left px-4 py-3 hover:bg-[#2e3b34]">
                            Profile
                        </button>
                        <button className="block w-full text-left px-4 py-3 hover:bg-[#2e3b34]">
                            Settings
                        </button>
                        <button
                            onClick={() => (window.location.href = "/")}
                            className="flex w-full text-left px-4  py-3 hover:bg-[#2e3b34] text-red-400"
                        >
                            <LogOut className="mr-2" /> Logout
                        </button>

                    </div>
                )}
            </div>
        </nav>
    );
}
