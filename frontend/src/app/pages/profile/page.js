'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { useRouter } from "next/navigation";
import UserNavbar from "../userpanel/Navbar";
import Sidebar from "../userpanel/Sidebar";

/**
 * NOTE: using the uploaded local avatar path (tool will transform to a URL):
 * /mnt/data/4935fa87-22b3-4720-ac28-0ebfffa1bcb8.png
 *
 * This component preserves your original fetch / save behavior and handlers.
 */

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
  const router = useRouter();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
  while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

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
      <div className="flex items-center justify-center h-screen text-gray-400 bg-[#09110f]">
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
    <div className="min-h-screen w-full bg-[#09110f] text-white font-['Inter']">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onSelectSearch={() => { }} />

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        {/* Card wrapper */}
        <div className="bg-[#0b1512] border border-[#11221b] rounded-2xl shadow-[0_0_30px_rgba(0,255,153,0.06)] p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-white mb-2">Profile Dashboard</h1>
              <p className="text-[#9ca3af]">Manage your account and preferences</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#061a15] border border-[#113126] text-[#aeeed1]"
                title="Notifications"
              >
                <Info className="w-4 h-4" />
                Notifications
              </button>

              <div className="w-[92px] h-[92px] bg-gradient-to-br from-[#002b1f] to-[#083126] rounded-xl flex items-center justify-center p-1">
                {/* Avatar using Google profile picture */}
                <div className="rounded-lg overflow-hidden w-[84px] h-[84px]">
                  {user.googlePicture ? (
                    <Image
                      src={user.googlePicture}
                      width={84}
                      height={84}
                      alt="avatar"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00fa92] to-[#4ade80] flex items-center justify-center text-[#030604] font-bold text-3xl">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* layout: left column main content, right column card */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: main forms and sections (span 2) */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Info Section */}
              <section className="bg-[#08120f] border border-[#11221b] rounded-xl p-5">
                <h2 className="text-lg font-semibold text-green-300 mb-3">User Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Name block */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between bg-[#07130f] rounded-md p-3 border border-[#13221b]">
                      <div>
                        <div className="text-sm text-gray-400">Full Name</div>
                        <div className="text-white font-medium">{user.name}</div>
                      </div>

                      <div>
                        {editingName ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="bg-transparent border border-[#1b2b27] px-2 py-1 rounded-md text-sm text-green-300"
                            />
                            <button onClick={handleNameSave} className="text-green-400">
                              <CheckCircle2 size={18} />
                            </button>
                            <button onClick={() => setEditingName(false)} className="text-red-400">
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-green-300 font-medium">{user.name}</span>
                            <Pencil size={16} className="text-gray-400 cursor-pointer" onClick={() => setEditingName(true)} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-[#07130f] border border-[#13221b] rounded-md p-3">
                        <div className="text-xs text-gray-400">Role</div>
                        <div className="text-green-300 font-medium">{user.role || "—"}</div>
                      </div>
                      <div className="bg-[#07130f] border border-[#13221b] rounded-md p-3">
                        <div className="text-xs text-gray-400">Total Tokens</div>
                        <div className="text-green-300 font-medium">{credits}</div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar + change photo on right of this section (small) */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#113126]">
                      {user.googlePicture ? (
                        <Image
                          src={user.googlePicture}
                          alt="avatar"
                          width={80}
                          height={80}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#00fa92] to-[#4ade80] flex items-center justify-center text-[#030604] font-bold text-2xl">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-[#063022] cursor-pointer">
                      Change Photo
                      <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => handleResumeUpload(e)} className="hidden" />
                    </label>
                  </div>
                </div>
              </section>

              {/* Gmail Integration */}
              <section className="bg-[#08120f] border border-[#11221b] rounded-xl p-5">
                <h2 className="text-lg font-semibold text-green-300 mb-3">Gmail Integration</h2>

                {!user.gmailEmail ? (
                  <button
                    onClick={() =>
                      (window.location.href = `${API_BASE_URL}/auth/gmail/connect`)
                    }
                    className="px-4 py-2 rounded-md bg-[#0a5a3f] text-white"
                  >
                    Connect Gmail
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-[#07130f] border border-[#13221b] rounded-md p-3">
                        <div className="text-xs text-gray-400">Connected Email</div>
                        <div className="text-white font-medium">{user.gmailEmail}</div>
                      </div>
                      <div className="bg-[#07130f] border border-[#13221b] rounded-md p-3">
                        <div className="text-xs text-gray-400">Token Status</div>
                        <div className={`font-medium ${gmailStatus === 'active' ? 'text-green-300' : gmailStatus === 'expired' ? 'text-red-400' : 'text-yellow-300'}`}>
                          {gmailStatus}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => (window.location.href = `${API_BASE_URL}/auth/gmail/connect`)}
                        className="px-3 py-2 rounded-md bg-[#043d2e] text-[#aeeed1]"
                      >
                        Reconnect Gmail
                      </button>

                      {gmailStatus === 'active' && <div className="text-green-300 text-sm">Connection active ✔</div>}
                    </div>
                  </div>
                )}
              </section>

              {/* Social Profiles */}
              <section className="bg-[#08120f] border border-[#11221b] rounded-xl p-5">
                <h2 className="text-lg font-semibold text-green-300 mb-3">Social Profiles</h2>

                <div className="space-y-3">
                  {["github", "linkedin"].map((platform) => (
                    <div key={platform} className="flex items-center gap-3">
                      <div className="w-12 text-sm text-gray-400 capitalize">{platform}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="url"
                          value={socialLinks[platform]}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, [platform]: e.target.value }))}
                          className="bg-transparent border border-[#1b2b27] px-3 py-2 rounded-md text-green-200 text-sm w-full"
                          placeholder={`Enter ${platform} URL`}
                        />
                        <button
                          onClick={() => handleSaveLink(platform, socialLinks[platform])}
                          disabled={savingLink === platform}
                          className="px-3 py-2 rounded-md text-sm font-semibold"
                          style={{
                            background: savingLink === platform ? "#0b2f22" : "linear-gradient(90deg,#00fa92 0%, #4ade80 100%)",
                            color: savingLink === platform ? "#9ca3af" : "#030604"
                          }}
                        >
                          {savingLink === platform ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Resume Upload / Save */}
              <section className="bg-[#08120f] border border-[#11221b] rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-400">Resume</div>
                  <div className="text-white font-medium">John_Anderson_Resume.pdf</div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-md bg-[#063022] text-sm cursor-pointer">
                    Upload New
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                  </label>
                  <button className="px-4 py-2 rounded-md bg-[#2b0b0a] text-white">Remove</button>
                </div>
              </section>

              {/* Job Application Preferences (Placeholder UI - not changing behavior) */}
              <section className="bg-[#08120f] border border-[#11221b] rounded-xl p-5">
                <h2 className="text-lg font-semibold text-green-300 mb-3">Job Application Preferences</h2>

                <div className="space-y-3">
                  <div className="text-sm text-gray-400">Preferred Roles</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-2 rounded-full bg-[#062a23] text-sm text-green-200">Frontend Developer</span>
                    <span className="px-3 py-2 rounded-full bg-[#062a23] text-sm text-green-200">UI/UX Designer</span>
                    <span className="px-3 py-2 rounded-full bg-[#062a23] text-sm text-green-200">Product Manager</span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-400">Auto-Apply</div>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="accent-[#00fa92] w-5 h-5" />
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT: compact card with summary and actions */}
            <aside className="space-y-5">
              <div className="bg-[#07130f] border border-[#11221b] rounded-xl p-4">
                <h3 className="text-sm text-gray-400 mb-2">Account</h3>
                <div className="bg-[#06120f] border border-[#103022] p-3 rounded-md flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Member</div>
                    <div className="text-green-300 font-semibold">Premium</div>
                  </div>
                  <button
                    onClick={() => router.push('/pages/price')}
                    className="px-3 py-1 rounded-md text-sm" style={{ background: "linear-gradient(90deg,#00fa92 0%, #4ade80 100%)", color: "#030604" }}>
                    Upgrade
                  </button>
                </div>
              </div>

              <div className="bg-[#07130f] border border-[#11221b] rounded-xl p-4">
                <h3 className="text-sm text-gray-400 mb-2">Security</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-[#06120f] p-3 rounded-md border border-[#103022]">
                    <div className="text-sm text-gray-300">Two-Factor Authentication</div>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="accent-[#00fa92] w-5 h-5" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between bg-[#06120f] p-3 rounded-md border border-[#103022]">
                    <div className="text-sm text-gray-300">Change Password</div>
                    <button className="px-3 py-1 text-sm rounded-md bg-transparent border border-[#1b2b27]">Update</button>
                  </div>
                </div>
              </div>

              <div className="bg-[#07130f] border border-[#11221b] rounded-xl p-4">
                <h3 className="text-sm text-gray-400 mb-2">Help</h3>
                <div className="text-sm text-gray-300">Support & docs</div>
              </div>

              {/* Save changes (big neon button) */}
              <div>
                <button
                  onClick={() => alert("Saved (placeholder)")}
                  className="w-full py-3 rounded-full font-semibold"
                  style={{
                    background: "linear-gradient(90deg,#00fa92 0%, #4ade80 100%)",
                    color: "#030604",
                    boxShadow: "0 12px 30px rgba(0,250,146,0.14)",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </aside>
          </div>

          {/* Footer / small note */}
          <div className="mt-6 text-center text-xs text-[#7b8f86]">
            © {new Date().getFullYear()} JobScraper AI — Powered by automation
          </div>
        </div>
      </main>
    </div>
  );
}
