"use client";

import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserNavbar({ onSidebarToggle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const router = useRouter();

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");;

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch user");
                setUser(data.user);
            } catch (err) {
                console.error("Fetch user error:", err);
                setError(err.message);
            }
        };
        fetchUser();
    }, []);

    return (
        <nav className="flex justify-between fixed items-center w-full bg-[#0a0f0d] p-4 text-white z-50 cursor-pointer">
            {/* Hamburger */}
            <button
                onClick={onSidebarToggle}
                className="text-2xl focus:outline-none cursor-pointer py-3"
            >
                <svg width="22" height="22" fill="none">
                    <path
                        d="M2 5h18M2 11h18M2 17h18"
                        stroke="#4ADE80"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            {/* User Avatar */}
            <div className="relative cursor-pointer">
                <button
                    onClick={toggleDropdown}
                    className="focus:outline-none rounded-full p-1 cursor-pointer"
                >
                    <svg width="40" height="40" fill="none">
                        <circle cx="20" cy="20" r="20" fill="url(#grad)" />
                        <defs>
                            <linearGradient id="grad" x1="0" y1="20" x2="40" y2="20">
                                <stop stopColor="#4ADE80" />
                                <stop offset="1" stopColor="#16A34A" />
                            </linearGradient>
                        </defs>
                    </svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1F2937] text-green-400 rounded-md shadow-lg z-50 cursor-pointer border-2 border-white">
                        {user && (
                            <div className="px-4 py-3 border-b border-white">
                                <p className="text-green-400 font-semibold">{user.name}</p>
                                <p className="text-green-400 text-sm">{user.id}</p>
                            </div>
                        )}

                        <button
                            onClick={() => router.push("/pages/profile")}
                            className="block w-full text-left px-4 py-3 hover:bg-[#2e3b34]"
                        >
                            Profile
                        </button>

                        <button className="block w-full text-left px-4 py-3 hover:bg-[#2e3b34]">
                            Settings
                        </button>

                        <button
                            onClick={() => router.push("/")}
                            className="flex w-full text-left px-4 py-3 hover:bg-[#2e3b34] text-red-400"
                        >
                            <LogOut className="mr-2" /> Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
