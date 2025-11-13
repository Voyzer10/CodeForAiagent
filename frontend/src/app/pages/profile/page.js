"use client";

import { useEffect, useState } from "react";
import { Loader2, Info, Pencil, X, Github, Linkedin, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const [showHelp, setShowHelp] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [savingLink, setSavingLink] = useState("");

    const [socialLinks, setSocialLinks] = useState({
        github: "",
        linkedin: "",
    });

    const [clientData, setClientData] = useState({
        clientId: "",
        clientSecret: "",
    });

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Fetch user
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
                setNewName(data.user.name);

                setSocialLinks({
                    github: data.user.github || "",
                    linkedin: data.user.linkedin || "",
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // SAVE social links
    const handleSaveLink = async (platform, value) => {
        if (!value.trim()) return;

        setSavingLink(platform);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/update-socials`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [platform]: value }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setUser((prev) => ({ ...prev, [platform]: value }));
            setSaveStatus({ platform, success: true });
        } catch {
            setSaveStatus({ platform, success: false });
        } finally {
            setSavingLink("");
        }
    };

    // SAVE API keys
    const handleSaveClientData = async () => {
        setSavingLink("client");

        try {
            const res = await fetch(`${API_BASE_URL}/auth/update-client`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clientData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setSaveStatus({ platform: "client", success: true });
        } catch {
            setSaveStatus({ platform: "client", success: false });
        } finally {
            setSavingLink("");
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen text-gray-400">
                <Loader2 className="animate-spin w-6 h-6 mr-2" />
                Loading profile...
            </div>
        );

    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

    if (!user) return <div className="text-center text-gray-400 mt-10">No user found.</div>;

    const { email, role, plan } = user;

    return (
        <div className="flex flex-col items-center min-h-screen w-full bg-[#09110f] text-white p-6 font-[Inter]">
            <div className="w-full max-w-4xl bg-[#0e1513] border border-[#1b2b27] rounded-2xl p-8 shadow-xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-semibold text-green-400">👤 Profile Dashboard</h2>
                    <Info
                        size={22}
                        className="text-green-400 cursor-pointer hover:text-green-300"
                        onClick={() => setShowHelp(true)}
                    />
                </div>

                {/* NAME */}
                <div className="flex justify-between items-center bg-[#131d1a] px-4 py-3 rounded-lg border border-[#1b2b27]">
                    <span className="text-gray-400 text-sm">Name:</span>

                    {editingName ? (
                        <div className="flex gap-2 items-center">
                            <input
                                className="bg-transparent border border-[#1b2b27] px-2 py-1 rounded-lg text-sm text-green-300"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <button onClick={() => { setUser({ ...user, name: newName }); setEditingName(false); }}>
                                <CheckCircle2 size={18} className="text-green-400" />
                            </button>
                            <button onClick={() => setEditingName(false)}>
                                <X size={18} className="text-red-400" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <span className="text-green-300">{user.name}</span>
                            <Pencil size={18} className="cursor-pointer text-gray-400" onClick={() => setEditingName(true)} />
                        </div>
                    )}
                </div>

                <ProfileItem label="Email" value={email} />
                <ProfileItem label="Role" value={role} />

                <hr className="my-6 border-[#1b2b27]" />

                {/* SOCIAL LINKS */}
                <h3 className="text-xl font-semibold text-green-300 mb-3">🌐 Social Profiles</h3>
                <div className="space-y-3">
                    {[
                        { platform: "github", icon: <Github size={20} /> },
                        { platform: "linkedin", icon: <Linkedin size={20} /> },
                    ].map(({ platform, icon }) => (
                        <div key={platform} className="flex justify-between items-center bg-[#131d1a] px-4 py-3 rounded-lg border border-[#1b2b27]">
                            <div className="flex gap-2 items-center text-gray-300">
                                {icon} {platform}
                            </div>

                            <input
                                defaultValue={socialLinks[platform]}
                                className="bg-transparent border border-[#1b2b27] px-2 py-1 text-sm rounded-lg text-gray-200 w-2/3"
                                onBlur={(e) => handleSaveLink(platform, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
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
