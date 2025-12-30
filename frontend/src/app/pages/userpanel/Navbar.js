"use client";

import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

export default function UserNavbar({ onSidebarToggle, className }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const router = useRouter();

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

                // Apply theme globally
                if (data.user.theme) {
                    const root = window.document.documentElement;
                    root.classList.remove('light', 'dark');
                    if (data.user.theme === 'system') {
                        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        root.classList.add(systemTheme);
                    } else {
                        root.classList.add(data.user.theme);
                    }
                }
            } catch (err) {
                console.error("Fetch user error:", err);
                setError(err.message);
            }
        };
        fetchUser();
    }, []);

    // 🔥 REAL LOGOUT FUNCTION
    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            setUser(null);
            router.push("/pages/logout");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <nav className={`flex justify-between fixed top-0 left-0 items-center w-full bg-[var(--background-mode)] border-b border-[var(--border-mode)] p-4 text-[var(--text-mode)] z-50 cursor-pointer ${className || ""}`}>
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

            <div className="flex items-center gap-4">
                {user && (
                    <>
                        <div className="text-right flex items-center">
                            <p className="text-xs sm:text-sm font-semibold text-green-400 mr-2 sm:mr-0">{user.name}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-green-500 shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                            {user.googlePicture ? (
                                <Image
                                    src={user.googlePicture}
                                    alt="User"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#00fa92] to-[#16A34A] flex items-center justify-center text-black font-bold">
                                    {user.name?.charAt(0) || "U"}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
