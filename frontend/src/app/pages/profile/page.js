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
  }, [API_BASE_URL]);

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
  if (user.gmailEmail) {
    if (!user.gmailTokenExpiry) {
      gmailStatus = "expired";
    } else {
      const expiry = new Date(user.gmailTokenExpiry).getTime();
      const now = Date.now();
      if (expiry < now) {
        gmailStatus = "expired";
      } else if (expiry - now < 10 * 60 * 1000) {
        gmailStatus = "expiring_soon";
      } else {
        gmailStatus = "active";
      }
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0f0e] text-gray-200 font-['Inter'] selection:bg-green-500/30 selection:text-green-200">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onSelectSearch={() => { }} />

      <main className="max-w-[1240px] mx-auto px-6 pt-24 pb-16 transition-all duration-300">

        {/* --- PAGE HEADER --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Profile Dashboard
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Manage your account settings and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pages/userpanel"
              className="px-4 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all text-sm font-semibold flex items-center gap-2"
            >
              Dashboard View
            </Link>
            <button
              onClick={() => alert("Settings toggled")}
              className="p-2.5 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 hover:bg-green-500/10 transition-all"
            >
              <Info size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --- LEFT COLUMN (MAIN) --- */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. User Summary Card */}
            <div className="bg-[#0e1614] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all duration-700"></div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative">
                {/* Avatar Section */}
                <div className="relative group/avatar">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-green-500/20 bg-[#070c0b] shadow-xl relative">
                    {user.googlePicture ? (
                      <Image
                        src={user.googlePicture}
                        width={112}
                        height={112}
                        alt="Profile"
                        className="object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-gray-900 font-black text-4xl">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gray-900 border border-gray-800 text-green-400 hover:text-white hover:bg-green-500 transition-all cursor-pointer shadow-xl">
                    <Pencil size={14} />
                    <input type="file" accept="image/*" onChange={handleResumeUpload} className="hidden" />
                  </label>
                </div>

                {/* Name & Details */}
                <div className="flex-1 text-center md:text-left pt-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
                    {editingName ? (
                      <div className="flex items-center gap-2 w-full max-w-sm">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 bg-black/40 border border-green-500/30 px-3 py-1.5 rounded-xl text-lg text-white font-bold tracking-tight focus:outline-none focus:border-green-500"
                        />
                        <button onClick={handleNameSave} className="p-2 bg-green-500/10 text-green-400 rounded-lg"><CheckCircle2 size={18} /></button>
                        <button onClick={() => setEditingName(false)} className="p-2 bg-red-500/10 text-red-400 rounded-lg"><X size={18} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <h2 className="text-3xl font-bold text-white tracking-tight">{user.name}</h2>
                        <button onClick={() => setEditingName(true)} className="text-gray-600 hover:text-green-400 p-1 transition-colors">
                          <Pencil size={18} />
                        </button>
                      </div>
                    )}
                    <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase font-black tracking-widest self-center md:self-auto">
                      {user.isEnterprise ? "Enterprise Account" : "Pro Member"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Current Role</p>
                      <p className="text-sm text-gray-200 font-medium">{user.role || "Software Engineer"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Token Balance</p>
                      <p className="text-sm font-bold text-green-400">{credits} Credits</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Member Since</p>
                      <p className="text-sm text-gray-200 font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2024"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Gmail Section */}
            <div className="bg-[#0e1614] border border-white/5 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white">Gmail Integration</h3>
                  <p className="text-xs text-gray-500 mt-1">Automate your job applications via Gmail draft creation</p>
                </div>
                <div className={`p-3 rounded-2xl ${gmailStatus === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                  <CheckCircle2 size={24} />
                </div>
              </div>

              {!user.gmailEmail ? (
                <div className="bg-black/20 rounded-2xl p-6 border border-dashed border-gray-800 text-center">
                  <p className="text-sm text-gray-400 mb-6">Your Gmail is not connected. Connect now to start automating applications.</p>
                  <button
                    onClick={() => (window.location.href = `${API_BASE_URL}/auth/gmail/connect`)}
                    className="px-8 py-3 rounded-xl bg-green-500 text-black font-black hover:bg-green-400 transition-all shadow-lg shadow-green-500/10"
                  >
                    Connect Gmail Account
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Linked Account</div>
                    <div className="text-lg font-bold text-white mb-2">{user.gmailEmail}</div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${gmailStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
                      <span className={`text-xs font-bold uppercase tracking-widest ${gmailStatus === 'active' ? 'text-green-500' : 'text-orange-500'}`}>
                        Token {gmailStatus}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => (window.location.href = `${API_BASE_URL}/auth/gmail/connect`)}
                    className="px-6 py-3 rounded-xl bg-gray-800/80 text-white font-bold text-sm hover:bg-gray-700 transition-all border border-white/5"
                  >
                    {gmailStatus === 'active' ? "Change Account" : "Reconnect Gmail"}
                  </button>
                </div>
              )}
            </div>

            {/* 3. Social & Resume Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Social Profiles */}
              <div className="bg-[#0e1614] border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">Social Profiles</h3>
                <div className="space-y-6">
                  {["github", "linkedin"].map((platform) => (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{platform}</label>
                        {saveStatus?.platform === platform && saveStatus.success && (
                          <span className="text-[10px] text-green-400 font-bold">Saved!</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={socialLinks[platform]}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, [platform]: e.target.value }))}
                          className="flex-1 bg-black/40 border border-gray-800 px-4 py-2.5 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-green-500/50 transition-colors"
                          placeholder={`https://${platform}.com/username`}
                        />
                        <button
                          onClick={() => handleSaveLink(platform, socialLinks[platform])}
                          disabled={savingLink === platform}
                          className="px-4 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 hover:bg-green-500/10 transition-all flex items-center justify-center min-w-[60px]"
                        >
                          {savingLink === platform ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume Section */}
              <div className="bg-[#0e1614] border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">Resume Asset</h3>
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4 shadow-inner">
                    <Info size={32} />
                  </div>
                  <p className="text-sm font-bold text-white mb-1 truncate w-full">Current_Resume_2024.pdf</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-6">PDF / 1.2 MB</p>

                  <div className="flex gap-2 w-full">
                    <label className="flex-1 py-2.5 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 font-bold text-xs cursor-pointer hover:bg-green-500/10 transition-all text-center">
                      Upload
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                    </label>
                    <button className="flex-1 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 font-bold text-xs hover:bg-red-500/10 transition-all">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Preferences Section */}
            <div className="bg-[#0e1614] border border-white/5 rounded-3xl p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6">Job Application Preferences</h3>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">Target Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {["Frontend Developer", "Web Developer", "React Specialist", "UI Engineer"].map(role => (
                      <span key={role} className="px-4 py-2 rounded-xl bg-gray-900/60 border border-white/5 text-gray-300 text-xs font-semibold hover:border-green-500/30 transition-all cursor-default">
                        {role}
                      </span>
                    ))}
                    <button className="px-4 py-2 rounded-xl bg-green-500/5 border border-dashed border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/10 transition-all">
                      + Add Role
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5">
                  <div>
                    <h4 className="text-sm font-bold text-white">Auto-Apply Mode</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Allow our agent to automatically submit drafts for you</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN (UTILITIES) --- */}
          <div className="lg:col-span-4 space-y-8">

            {/* Account Summary */}
            <div className="bg-[#0e1614] border border-white/5 rounded-3xl p-8 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Account Summary</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Membership</p>
                    <p className="text-sm font-bold text-white">Premium Tier</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <button
                  onClick={() => router.push('/pages/price')}
                  className="w-full py-4 rounded-2xl bg-green-500 text-black font-black text-sm shadow-xl shadow-green-500/10 hover:bg-green-400 transition-all tracking-tight uppercase"
                >
                  Upgrade My Plan
                </button>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-[#0e1614] border border-white/5 rounded-3xl p-8 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Security</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">2FA Security</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <button className="w-full py-3 rounded-xl bg-gray-900 border border-gray-800 text-white font-bold text-xs hover:border-white/20 transition-all">
                  Update Password
                </button>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-[#0e1614] border border-white/5 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                  <Info size={16} />
                </div>
                <span className="font-bold">Need Help?</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">Our support team is always available to help you with your application setup.</p>
              <button className="w-full py-3 rounded-xl border border-gray-800 text-gray-400 font-bold text-xs hover:text-white transition-all">
                Contact Support
              </button>
            </div>

            {/* Save Changes Fixed-ish Bottom */}
            <div className="pt-4">
              <button
                onClick={() => alert("All changes saved successfully!")}
                className="w-full py-5 rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 text-[#001f15] font-black text-lg shadow-2xl shadow-green-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Save Changes
                <CheckCircle2 size={24} />
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-20 border-t border-white/5 pt-10 text-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} JobScraper AI &mdash; Advanced Agency Access
          </p>
        </div>

      </main>
    </div>
  );
}
