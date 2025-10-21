"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);



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
            } catch (err) {
                console.error("Fetch user error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // const handleSaveLink = async (type, url) => {
    //     if (!url) return;
    //     try {
    //         await fetch("http://localhost:5000/api/user/update-links", {
    //             method: "PUT",
    //             credentials: "include",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ type, url }),
    //         });
    //         setUser((prev) => ({ ...prev, [type]: url }));
    //     } catch (err) {
    //         console.error("Failed to save link:", err);
    //     }
    // };
    if (loading)
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <Loader2 className="animate-spin w-6 h-6 mr-2" />
                Loading profile...
            </div>
        );

    if (error)
        return (
            <div className="text-center text-red-500 mt-10">
                Failed to load profile: {error}
            </div>
        );

    if (!user)
        return (
            <div className="text-center text-gray-400 mt-10">No user data found.</div>
        );

    const { name, email, role, plan } = user;

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#0b1110] text-white">
            <div className="w-full max-w-md bg-[#0e1513] border border-[#1b2b27] rounded-2xl shadow-[0_0_20px_#00ff9d22] p-6">
                <h2 className="text-2xl font-semibold text-green-400 mb-6 text-center">
                    👤 User Profile
                </h2>

                <div className="space-y-3">
                    <ProfileItem label="Name" value={name} />
                    <ProfileItem label="Email" value={email} />
                    <ProfileItem label="Role" value={role} />
                </div>

                <hr className="my-5 border-[#1b2b27]" />

                <h3 className="text-lg font-semibold text-green-300 mb-3">
                    💎 Plan Information
                </h3>

                {plan && plan.type ? (
                    <div className="space-y-3">
                        {/* 🌟 Plan Type + Upgrade */}
                        <div className="flex items-center justify-between bg-[#131d1a] px-4 py-2 rounded-lg border border-[#1b2b27]">
                            <span className="text-gray-400">
                                Plan Type:{" "}
                                <span className="text-green-300 font-medium capitalize">
                                    {plan.type || "No Plan"}
                                </span>
                            </span>
                            <Link href="/pages/price">
                                <span className="text-sm text-red-400 hover:text-red-300 underline">
                                    *Upgrade
                                </span>
                            </Link>
                        </div>

                        {/* 🧾 Remaining Career Cards */}
                        <ProfileItem
                            label="Remaining Career Cards"
                            value={plan.remainingJobs ?? 0}
                        />

                        {/* 📅 Purchase & Expiry */}
                        {plan.purchasedAt && (
                            <ProfileItem
                                label="Purchased On"
                                value={new Date(plan.purchasedAt).toLocaleDateString()}
                            />
                        )}
                        {plan.expiresAt && (
                            <ProfileItem
                                label="Expires On"
                                value={new Date(plan.expiresAt).toLocaleDateString()}
                            />
                        )}

                        {/* 📊 Total Jobs Generated */}
                        <ProfileItem
                            label="Total Jobs Generated"
                            // value={totalJobs ?? "Loading..."}
                        />

                        <hr className="my-5 border-[#1b2b27]" />

                        {/* 🌐 Social Links Section */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-green-300">
                                Social Profiles
                            </h3>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between bg-[#131d1a] px-4 py-2 rounded-lg border border-[#1b2b27]">
                                    <span className="text-gray-400">GitHub:</span>
                                    {user.github ? (
                                        <a
                                            href={user.github}
                                            target="_blank"
                                            className="text-blue-400 hover:underline truncate max-w-[60%] text-right"
                                        >
                                            {user.github}
                                        </a>
                                    ) : (
                                        <input
                                            type="url"
                                            placeholder="Add GitHub URL"
                                            className="bg-transparent border border-[#1b2b27] px-2 py-1 rounded-lg text-sm w-2/3 text-gray-200"
                                            onBlur={(e) => handleSaveLink("github", e.target.value)}
                                        />
                                    )}
                                </div>

                                <div className="flex items-center justify-between bg-[#131d1a] px-4 py-2 rounded-lg border border-[#1b2b27]">
                                    <span className="text-gray-400">LinkedIn:</span>
                                    {user.linkedin ? (
                                        <a
                                            href={user.linkedin}
                                            target="_blank"
                                            className="text-blue-400 hover:underline truncate max-w-[60%] text-right"
                                        >
                                            {user.linkedin}
                                        </a>
                                    ) : (
                                        <input
                                            type="url"
                                            placeholder="Add LinkedIn URL"
                                            className="bg-transparent border border-[#1b2b27] px-2 py-1 rounded-lg text-sm w-2/3 text-gray-200"
                                            onBlur={(e) => handleSaveLink("linkedin", e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No active plan</p>
                )}

            </div>
        </div>
    );
}

// 🔹 Reusable small component for display rows
function ProfileItem({ label, value }) {
    return (
        <div className="flex justify-between items-center bg-[#131d1a] px-4 py-2 rounded-lg border border-[#1b2b27]">
            <span className="text-gray-400">{label}</span>
            <span className="font-medium text-green-300">{value || "—"}</span>
        </div>
    );
}
