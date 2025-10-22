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

  // 🔹 Save GitHub / LinkedIn via API
  const handleSaveLink = async (platform) => {
    const value = socialLinks[platform].trim();
    if (!value) return;

    setSavingLink(platform);
    setSaveStatus(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-socials", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [platform]: value }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      setUser((prev) => ({ ...prev, [platform]: value }));
      setSaveStatus({ platform, success: true });
    } catch (err) {
      setSaveStatus({ platform, success: false });
    } finally {
      setSavingLink("");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  // 🔹 Save Edited Name
  const handleNameSave = () => {
    if (newName.trim()) {
      setUser((prev) => ({ ...prev, name: newName.trim() }));
      setEditingName(false);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) alert(`Uploaded file: ${file.name}`);
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
      <div className="text-center text-gray-400 mt-10">No user data found.</div>
    );

  const { email, role, plan } = user;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#09110f] text-white p-6 font-[Inter]">
      <div className="w-full max-w-4xl bg-[#0e1513] border border-[#1b2b27] rounded-2xl shadow-[0_0_30px_#00ff9d33] p-8 transition-all duration-300 hover:shadow-[0_0_45px_#00ff9d55]">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-green-400 tracking-wide">
            👤 Profile Dashboard
          </h2>
          <Info
            className="text-green-400 cursor-pointer hover:text-green-300 transition"
            size={22}
            onClick={() => setShowHelp(true)}
          />
        </div>

        {/* Editable Name */}
        <div className="flex justify-between items-center bg-[#131d1a] px-4 py-3 rounded-lg border border-[#1b2b27]">
          <span className="text-gray-400 text-sm">Name:</span>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-transparent border border-[#1b2b27] px-2 py-1 rounded-lg text-sm text-green-300 focus:outline-none"
              />
              <button
                onClick={handleNameSave}
                className="text-green-400 hover:text-green-300 transition"
              >
                <CheckCircle2 size={18} />
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="text-red-400 hover:text-red-300 transition"
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

        <ProfileItem label="Email" value={email} />
        <ProfileItem label="Role" value={role} />

        <hr className="my-6 border-[#1b2b27]" />

        {/* Plan Info */}
        <h3 className="text-xl font-semibold text-green-300 mb-3">💎 Plan Details</h3>
        {plan && plan.type ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#131d1a] px-4 py-3 rounded-lg border border-[#1b2b27]">
              <span className="text-gray-400">
                Plan Type:{" "}
                <span className="text-green-300 font-medium capitalize">
                  {plan.type}
                </span>
              </span>
              <Link href="/pages/price">
                <span className="text-sm text-red-400 hover:text-red-300 underline">
                  *Upgrade
                </span>
              </Link>
            </div>
            <ProfileItem label="Remaining Tokens" value={plan.remainingJobs ?? "—"} />
          </div>
        ) : (
          <p className="text-gray-500">No active plan</p>
        )}

        <hr className="my-6 border-[#1b2b27]" />

        {/* Resume Upload */}
        <h3 className="text-xl font-semibold text-green-300 mb-3">📄 Resume / CV</h3>
        <div className="bg-[#131d1a] px-4 py-4 rounded-lg border border-[#1b2b27] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-gray-400 text-sm">Upload your resume:</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:opacity-90"
            onChange={handleResumeUpload}
          />
        </div>

        <hr className="my-6 border-[#1b2b27]" />

        {/* Social Links */}
        <h3 className="text-xl font-semibold text-green-300 mb-3">🌐 Social Profiles</h3>
        <div className="space-y-3">
          {[
            { platform: "github", icon: <Github size={20} className="text-gray-300" /> },
            { platform: "linkedin", icon: <Linkedin size={20} className="text-blue-400" /> },
          ].map(({ platform, icon }) => (
            <div
              key={platform}
              className="flex items-center justify-between bg-[#131d1a] px-4 py-3 rounded-lg border border-[#1b2b27] hover:border-green-700 transition"
            >
              <div className="flex items-center gap-2">
                {icon}
                <span className="capitalize text-gray-400 text-sm">{platform}:</span>
              </div>

              <div className="flex items-center gap-2 w-2/3">
                <input
                  type="url"
                  value={socialLinks[platform]}
                  onChange={(e) =>
                    setSocialLinks((prev) => ({
                      ...prev,
                      [platform]: e.target.value,
                    }))
                  }
                  placeholder={`Add ${platform} URL`}
                  className="bg-transparent border border-[#1b2b27] px-2 py-1 rounded-lg text-sm text-gray-200 w-full focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={() => handleSaveLink(platform)}
                  disabled={savingLink === platform}
                  className="bg-green-500 text-black px-3 py-1 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {savingLink === platform
                    ? "Saving..."
                    : saveStatus?.platform === platform
                    ? saveStatus.success
                      ? "Saved ✓"
                      : "Error"
                    : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0e1513] border border-[#1b2b27] p-6 rounded-xl w-full max-w-lg text-gray-200 relative">
            <h3 className="text-2xl font-semibold text-green-400 mb-4">
              How to Generate Client ID & Secret
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-300 text-sm">
              <li>Go to your developer portal (e.g., LinkedIn, GitHub, Google).</li>
              <li>Create a new OAuth App or API Application.</li>
              <li>Enter your website’s redirect URL (e.g., http://localhost:3000/auth/callback).</li>
              <li>Copy your <span className="text-green-400">Client ID</span> & <span className="text-green-400">Client Secret</span>.</li>
            </ol>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 bg-green-500 text-black px-4 py-2 rounded-lg font-medium hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔹 Reusable Row Component
function ProfileItem({ label, value }) {
  return (
    <div className="flex justify-between items-center bg-[#131d1a] px-4 py-2 rounded-lg border border-[#1b2b27]">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="font-medium text-green-300 text-sm">{value || "—"}</span>
    </div>
  );
}
