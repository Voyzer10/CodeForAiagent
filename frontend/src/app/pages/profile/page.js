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
  CheckCircle2
} from "lucide-react";

const LinkedInSVG = ({ size = 13, className = "" }) => (
  <svg width={size} height={(size / 13) * 14} viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_27_478)">
      <path d="M11.375 0.875H0.872266C0.391016 0.875 0 1.27148 0 1.7582V12.2418C0 12.7285 0.391016 13.125 0.872266 13.125H11.375C11.8562 13.125 12.25 12.7285 12.25 12.2418V1.7582C12.25 1.27148 11.8562 0.875 11.375 0.875ZM3.70234 11.375H1.88672V5.52891H3.70508V11.375H3.70234ZM2.79453 4.73047C2.21211 4.73047 1.7418 4.25742 1.7418 3.67773C1.7418 3.09805 2.21211 2.625 2.79453 2.625C3.37422 2.625 3.84727 3.09805 3.84727 3.67773C3.84727 4.26016 3.37695 4.73047 2.79453 4.73047ZM10.5082 11.375H8.69258V8.53125C8.69258 7.85313 8.67891 6.98086 7.74922 6.98086C6.80312 6.98086 6.6582 7.71914 6.6582 8.48203V11.375H4.84258V5.52891H6.58437V6.32734H6.60898C6.85234 5.86797 7.4457 5.38398 8.32891 5.38398C10.1664 5.38398 10.5082 6.59531 10.5082 8.17031V11.375Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_27_478">
        <path d="M0 0H12.25V14H0V0Z" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const GithubSVG = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_27_482)">
      <path d="M4.53633 10.8664C4.53633 10.9211 4.47344 10.9648 4.39414 10.9648C4.30391 10.973 4.24102 10.9293 4.24102 10.8664C4.24102 10.8117 4.30391 10.768 4.3832 10.768C4.46523 10.7598 4.53633 10.8035 4.53633 10.8664ZM3.68594 10.7434C3.6668 10.798 3.72148 10.8609 3.80352 10.8773C3.87461 10.9047 3.95664 10.8773 3.97305 10.8227C3.98945 10.768 3.9375 10.7051 3.85547 10.6805C3.78437 10.6613 3.70508 10.6887 3.68594 10.7434ZM4.89453 10.6969C4.81523 10.716 4.76055 10.768 4.76875 10.8309C4.77695 10.8855 4.84805 10.9211 4.93008 10.902C5.00938 10.8828 5.06406 10.8309 5.05586 10.7762C5.04766 10.7242 4.97383 10.6887 4.89453 10.6969ZM6.69375 0.21875C2.90117 0.21875 0 3.09805 0 6.89062C0 9.92305 1.90859 12.518 4.63477 13.4313C4.98477 13.4941 5.10781 13.2781 5.10781 13.1004C5.10781 12.9309 5.09961 11.9957 5.09961 11.4215C5.09961 11.4215 3.18555 11.8316 2.78359 10.6066C2.78359 10.6066 2.47187 9.81094 2.02344 9.60586C2.02344 9.60586 1.39727 9.17656 2.06719 9.18477C2.06719 9.18477 2.74805 9.23945 3.12266 9.89023C3.72148 10.9457 4.725 10.6422 5.11602 10.4617C5.17891 10.0242 5.35664 9.7207 5.55352 9.54023C4.025 9.3707 2.48281 9.14922 2.48281 6.51875C2.48281 5.7668 2.69062 5.38945 3.12812 4.9082C3.05703 4.73047 2.82461 3.99766 3.19922 3.05156C3.7707 2.87383 5.08594 3.78984 5.08594 3.78984C5.63281 3.63672 6.2207 3.55742 6.80312 3.55742C7.38555 3.55742 7.97344 3.63672 8.52031 3.78984C8.52031 3.78984 9.83555 2.87109 10.407 3.05156C10.7816 4.00039 10.5492 4.73047 10.4781 4.9082C10.9156 5.39219 11.1836 5.76953 11.1836 6.51875C11.1836 9.15742 9.57305 9.36797 8.04453 9.54023C8.29609 9.75625 8.50938 10.1664 8.50938 10.809C8.50938 11.7305 8.50117 12.8707 8.50117 13.0949C8.50117 13.2727 8.62695 13.4887 8.97422 13.4258C11.7086 12.518 13.5625 9.92305 13.5625 6.89062C13.5625 3.09805 10.4863 0.21875 6.69375 0.21875ZM2.65781 9.64961C2.62227 9.67695 2.63047 9.73984 2.67695 9.7918C2.7207 9.83555 2.78359 9.85469 2.81914 9.81914C2.85469 9.7918 2.84648 9.72891 2.8 9.67695C2.75625 9.6332 2.69336 9.61406 2.65781 9.64961ZM2.3625 9.42812C2.34336 9.46367 2.3707 9.50742 2.42539 9.53477C2.46914 9.56211 2.52383 9.55391 2.54297 9.51562C2.56211 9.48008 2.53477 9.43633 2.48008 9.40898C2.42539 9.39258 2.38164 9.40078 2.3625 9.42812ZM3.24844 10.4016C3.20469 10.4371 3.22109 10.5191 3.28398 10.5711C3.34687 10.634 3.42617 10.6422 3.46172 10.5984C3.49727 10.5629 3.48086 10.4809 3.42617 10.4289C3.36602 10.366 3.28398 10.3578 3.24844 10.4016ZM2.93672 9.99961C2.89297 10.027 2.89297 10.098 2.93672 10.1609C2.98047 10.2238 3.0543 10.2512 3.08984 10.2238C3.13359 10.1883 3.13359 10.1172 3.08984 10.0543C3.05156 9.99141 2.98047 9.96406 2.93672 9.99961Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_27_482">
        <path d="M0 0H13.5625V14H0V0Z" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserNavbar from "../userpanel/Navbar";
import Sidebar from "../userpanel/Sidebar";

const ProfileSkeleton = () => (
  <div className="min-h-screen w-full bg-[#0a0f0e] text-gray-200 animate-pulse">
    <div className="max-w-[1240px] mx-auto px-6 pt-24 pb-16">
      {/* Header Skeleton */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="h-10 w-64 bg-gray-800/50 rounded-xl mb-3"></div>
          <div className="h-4 w-48 bg-gray-800/30 rounded-lg"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-gray-800/40 rounded-xl"></div>
          <div className="h-10 w-10 bg-gray-800/40 rounded-xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Summary Card Skeleton */}
          <div className="h-48 bg-[#0e1614] border border-white/5 rounded-3xl p-8">
            <div className="flex gap-8">
              <div className="w-28 h-28 rounded-3xl bg-gray-800/40"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 w-1/3 bg-gray-800/50 rounded-lg"></div>
                <div className="h-20 bg-gray-800/20 rounded-xl"></div>
              </div>
            </div>
          </div>
          {/* Gmail Card Skeleton */}
          <div className="h-40 bg-[#0e1614] border border-white/5 rounded-3xl p-8"></div>
          {/* Social Row Skeletons */}
          <div className="grid grid-cols-2 gap-8">
            <div className="h-48 bg-[#0e1614] border border-white/5 rounded-3xl"></div>
            <div className="h-48 bg-[#0e1614] border border-white/5 rounded-3xl"></div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-8">
          <div className="h-48 bg-[#0e1614] border border-white/5 rounded-3xl"></div>
          <div className="h-32 bg-[#0e1614] border border-white/5 rounded-3xl"></div>
          <div className="h-20 bg-green-500/10 rounded-3xl border border-green-500/20"></div>
        </div>
      </div>
    </div>
  </div>
);

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
  const [preferredJobTitles, setPreferredJobTitles] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
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

        setPreferredJobTitles(data.user.preferredJobTitles || []);
        setPreferredLocations(data.user.preferredLocations || []);

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

  const updatePreferencesOnServer = async (titles, locations) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/update-preferences`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredJobTitles: titles,
          preferredLocations: locations
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update preferences");
      }
    } catch (err) {
      console.error("Error updating preferences:", err);
    }
  };

  const handleAddTitle = async () => {
    if (!newTitle.trim()) return;
    const updated = [...preferredJobTitles, newTitle.trim()];
    setPreferredJobTitles(updated);
    setNewTitle("");
    await updatePreferencesOnServer(updated, preferredLocations);
  };

  const handleRemoveTitle = async (titleToRemove) => {
    const updated = preferredJobTitles.filter(t => t !== titleToRemove);
    setPreferredJobTitles(updated);
    await updatePreferencesOnServer(updated, preferredLocations);
  };

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;
    if (preferredLocations.length >= 6) {
      alert("You can add a maximum of 6 locations");
      return;
    }
    const updated = [...preferredLocations, newLocation.trim()];
    setPreferredLocations(updated);
    setNewLocation("");
    await updatePreferencesOnServer(preferredJobTitles, updated);
  };

  const handleRemoveLocation = async (locationToRemove) => {
    const updated = preferredLocations.filter(l => l !== locationToRemove);
    setPreferredLocations(updated);
    await updatePreferencesOnServer(preferredJobTitles, updated);
  };

  if (loading) return <ProfileSkeleton />;

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
    <div className="min-h-screen w-full bg-[#0a0f0e] text-gray-200 selection:bg-green-500/30 selection:text-green-200">
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
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                          {platform === "linkedin" ? <LinkedInSVG className="text-[#4ADE80]" /> : <GithubSVG className="text-[#4ADE80]" />}
                          {platform}
                        </label>
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
                {/* Job Titles */}
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">Your Preferred Job titles</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {preferredJobTitles.map(role => (
                      <span key={role} className="group px-4 py-2 rounded-xl bg-gray-900/60 border border-white/5 text-gray-300 text-xs font-semibold hover:border-green-500/30 transition-all cursor-default flex items-center gap-2">
                        {role}
                        <button onClick={() => handleRemoveTitle(role)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTitle()}
                      placeholder="Add preferred job title..."
                      className="flex-1 bg-black/40 border border-gray-800 px-4 py-2 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-green-500/50 transition-colors"
                    />
                    <button
                      onClick={handleAddTitle}
                      className="px-4 py-2 rounded-xl bg-green-500/5 border border-dashed border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/10 transition-all"
                    >
                      + Add Title
                    </button>
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Your Preferable Locations</p>
                    <span className="text-[10px] text-gray-600 font-medium">{preferredLocations.length}/6 Locations</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {preferredLocations.map(loc => (
                      <span key={loc} className="group px-4 py-2 rounded-xl bg-gray-900/60 border border-white/5 text-gray-300 text-xs font-semibold hover:border-green-500/30 transition-all cursor-default flex items-center gap-2">
                        {loc}
                        <button onClick={() => handleRemoveLocation(loc)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                      placeholder="Add preferred location (e.g. Remote, New York)..."
                      className="flex-1 bg-black/40 border border-gray-800 px-4 py-2 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-green-500/50 transition-colors"
                      disabled={preferredLocations.length >= 6}
                    />
                    <button
                      onClick={handleAddLocation}
                      disabled={preferredLocations.length >= 6}
                      className={`px-4 py-2 rounded-xl border border-dashed text-xs font-bold transition-all ${preferredLocations.length >= 6 ? 'bg-gray-900/40 border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-green-500/5 border-green-500/20 text-green-400 hover:bg-green-500/10'}`}
                    >
                      + Add Location
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
