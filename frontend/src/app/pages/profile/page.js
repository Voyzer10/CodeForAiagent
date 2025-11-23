"use client";

import { useEffect, useState } from "react";
import {
    Loader2,
    Info,
    Pencil,
    X,
    Github,
    Linkedin,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import UserNavbar from "../userpanel/Navbar";
import Sidebar from "../userpanel/Sidebar";


export default function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const [showHelp, setShowHelp] = useState(false);
    const [socialLinks, setSocialLinks] = useState({ github: "", linkedin: "" });
    const [savingLink, setSavingLink] = useState("");
    const [saveStatus, setSaveStatus] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [credits, setCredits] = useState(0);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();
                if (!res.ok)
                    throw new Error(data.message || "Failed to fetch user");

                setUser(data.user);
                setNewName(data.user.name);

                setSocialLinks({
                    github: data.user.github || "",
                    linkedin: data.user.linkedin || "",
                });

                // Fetch credits
                try {
                    const creditRes = await fetch(`${API_BASE_URL}/credits/check?userId=${data.user.userId}`, { credentials: "include" });
                    const creditData = await creditRes.json();
                    if (creditRes.ok) setCredits(creditData.credits);
                } catch (e) {
                    console.error("Failed to fetch credits", e);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleSaveLink = async (platform, value) => {
        if (!value.trim()) return;
        setSavingLink(platform);
        setSaveStatus(null);

        try {
            const res = await fetch(
                `${API_BASE_URL}/auth/update-socials`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ [platform]: value }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update");

            setUser((prev) => ({ ...prev, [platform]: value }));
            setSaveStatus({ platform, success: true });
        } catch (err) {
            console.error("Save error:", err);
            setSaveStatus({ platform, success: false });
        } finally {
            setSavingLink("");
        }
    };

    const handleNameSave = () => {
        if (newName.trim()) {
            setUser((prev) => ({ ...prev, name: newName.trim() }));
            setEditingName(false);
        }
    };

    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (file) alert(`Uploaded: ${file.name}`);
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen text-gray-400">
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
            <div className="text-center text-gray-400 mt-10">
                No user data found.
            </div>
        );

    /* TOKEN EXPIRY CHECK */
    let gmailStatus = "not_connected";
    let tokenExpired = false;
    let tokenExpiringSoon = false;

    if (user.gmailEmail) {
        if (!user.gmailTokenExpiry) {
            gmailStatus = "expired";
        } else {
            const expiry = new Date(user.gmailTokenExpiry).getTime();
            const now = Date.now();

            if (expiry < now) {
                gmailStatus = "expired";
                tokenExpired = true;
            } else if (expiry - now < 10 * 60 * 1000) {
                gmailStatus = "expiring_soon";
                tokenExpiringSoon = true;
            } else {
                gmailStatus = "active";
            }
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#09110f] text-white p-6 font-[Inter]">
            <UserNavbar onSidebarToggle={toggleSidebar} className="top-0 " />
            <Sidebar isOpen={sidebarOpen} />
            <div className="w-full max-w-4xl bg-[#0e1513] border border-[#1b2b27] rounded-2xl shadow-[0_0_30px_#00ff9d33] p-8">

                {/* HEADER */}
                <div className="flex justify-between items-center mt-20 mb-8">
                    <h2 className="text-3xl font-semibold text-green-400">
                        👤 Profile Dashboard
                    </h2>
                    <Info
                        className="text-green-400 cursor-pointer hover:text-green-300 transition"
                        size={22}
                        onClick={() => setShowHelp(true)}
                    />
                </div>

                {/* NAME */}
                <div className="flex justify-between items-center bg-[#131d1a] px-4 py-3 rounded-lg border border-[#1b2b27]">
                    <span className="text-gray-400 text-sm">Name:</span>
                    {editingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="bg-transparent border border-[#1b2b27] px-2 py-1 rounded-lg text-sm text-green-300"
                            />
                            <button
                                onClick={handleNameSave}
                                className="text-green-400"
                            >
                                <CheckCircle2 size={18} />
                            </button>
                            <button
                                onClick={() => setEditingName(false)}
                                className="text-red-400"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-green-300 text-base">
                                {user.name}
                            </span>
                            <Pencil
                                size={18}
                                className="text-gray-400 cursor-pointer hover:text-green-300 transition"
                                onClick={() => setEditingName(true)}
                            />
                        </div>
                    )}
                </div>

                {/* TOKENS & UPGRADE */}
                <div className="flex justify-between items-center bg-[#131d1a] px-4 py-3 rounded-lg border border-[#1b2b27] mt-4 mb-4">
                    <span className="text-gray-400 text-sm">Total Tokens:</span>
                    <div className="flex items-center gap-4">
                        <span className="font-medium text-green-300 text-lg">{credits}</span>
                        <Link href="/pages/price">
                            <button className="bg-green-600 text-black px-3 py-1 rounded-md text-sm font-semibold hover:bg-green-500 transition">
                                ★ Upgrade
                            </button>
                        </Link>
                    </div>
                </div>

                <ProfileItem label="Email" value={user.email} />
                <ProfileItem label="Role" value={user.role} />

                <hr className="my-6 border-[#1b2b27]" />

                {/* GMAIL SECTION */}
                <h3 className="text-xl font-semibold text-green-300 mb-3">
                    📧 Gmail Account
                </h3>

                {!user.gmailEmail ? (
                    <button
                        onClick={() =>
                            (window.location.href = `${API_BASE_URL}/auth/gmail/connect`)
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        Connect Gmail
                    </button>
                ) : (
                    <div className="p-4 bg-[#131d1a] border border-[#1b2b27] rounded-lg">
                        <ProfileItem label="Connected Gmail" value={user.gmailEmail} />
                        <ProfileItem
                            label="Connected At"
                            value={new Date(user.gmailConnectedAt).toLocaleString()}
                        />
                        <ProfileItem
                            label="Token Expiry"
                            value={new Date(user.gmailTokenExpiry).toLocaleString()}
                        />

                        {gmailStatus === "expired" && (
                            <div className="mt-4">
                                <p className="text-red-400 text-sm mb-1">
                                    Your Gmail session has expired.
                                </p>
                                <button
                                    onClick={() =>
                                        (window.location.href = `${API_BASE_URL}/auth/gmail/connect`)
                                    }
                                    className="bg-red-600 px-4 py-2 rounded-lg"
                                >
                                    Reconnect Gmail
                                </button>
                            </div>
                        )}

                        {gmailStatus === "expiring_soon" && (
                            <div className="mt-4">
                                <p className="text-yellow-400 text-sm mb-1">
                                    Gmail token is expiring soon.
                                </p>
                                <button
                                    onClick={() =>
                                        (window.location.href = `${API_BASE_URL}/auth/gmail/connect`)
                                    }
                                    className="bg-yellow-500 text-black px-4 py-2 rounded-lg"
                                >
                                    Refresh Gmail Connection
                                </button>
                            </div>
                        )}

                        {gmailStatus === "active" && (
                            <p className="text-green-400 text-sm mt-4">
                                Gmail connection active ✔
                            </p>
                        )}
                    </div>
                )}

                <hr className="my-6 border-[#1b2b27]" />

                {/* SOCIAL LINKS */}
                <h3 className="text-xl font-semibold text-green-300 mb-3">
                    🌐 Social Profiles
                </h3>

                {["github", "linkedin"].map((platform) => (
                    <div
                        key={platform}
                        className="flex items-center justify-between bg-[#131d1a] px-4 py-3 rounded-lg border border-[#1b2b27] mb-3"
                    >
                        <span className="text-gray-400 capitalize w-24">{platform}</span>
                        <div className="flex flex-1 items-center gap-2">
                            <input
                                type="url"
                                value={socialLinks[platform]}
                                onChange={(e) => setSocialLinks(prev => ({ ...prev, [platform]: e.target.value }))}
                                className="bg-transparent flex-1 border border-[#1b2b27] px-2 py-1 rounded-lg text-green-300 text-sm focus:outline-none focus:border-green-500"
                                placeholder={`Enter ${platform} URL`}
                            />
                            <button
                                onClick={() => handleSaveLink(platform, socialLinks[platform])}
                                disabled={savingLink === platform}
                                className="bg-green-600/20 text-green-400 border border-green-600 px-3 py-1 rounded-md text-sm hover:bg-green-600 hover:text-black transition disabled:opacity-50"
                            >
                                {savingLink === platform ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProfileItem({ label, value }) {
    return (
        <div className="flex justify-between items-center bg-[#131d1a] px-4 py-2 rounded-lg border border-[#1b2b27]">
            <span className="text-gray-400 text-sm">{label}</span>
            <span className="font-medium text-green-300 text-sm">{value || "—"}</span>
        </div>
    );
}
