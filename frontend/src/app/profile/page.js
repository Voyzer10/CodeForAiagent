'use client';

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Loader2,
  Info,
  Pencil,
  X,
  Github,
  Linkedin,
  CheckCircle2,
  FileText,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  Save,
  Globe,
  MapPin,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserNavbar from "../userpanel/Navbar";
import Sidebar from "../userpanel/Sidebar";
import imageCompression from 'browser-image-compression';

const LinkedInSVG = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.5 15.5v-5.3a2.7 2.7 0 0 0-5.4 0v5.3h-2.6v-8.5h2.6v1.2a2.7 2.7 0 0 1 4.4-.7c.6.6 1 1.4 1 2.3v5.7h-2.6zM8.1 18.5v-8.5H5.5v8.5h2.6zM6.8 8.9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor" />
  </svg>
);

const GithubSVG = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
  </svg>
);

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'resume', 'info', etc.
  const [saveStatus, setSaveStatus] = useState(null);

  // Social Links
  const [socialLinks, setSocialLinks] = useState({ github: "", linkedin: "" });

  // Preferences
  const [preferredJobTitles, setPreferredJobTitles] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const router = useRouter();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
  while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSocialLinks({
          github: data.user.github || "",
          linkedin: data.user.linkedin || ""
        });
        setPreferredJobTitles(data.user.preferredJobTitles || []);
        setPreferredLocations(data.user.preferredLocations || []);
      } else {
        setError(data.message || "Failed to load profile.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const showToast = (type, message) => {
    setSaveStatus({ type, message });
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Constraints: 3MB limit
    if (file.size > 3 * 1024 * 1024) {
      showToast('error', 'Resume exceeds 3MB limit.');
      return;
    }

    setActionLoading('resume');
    try {
      // Simulate/Implement Upload (In production, upload to S3/Cloudinary and get URL)
      // Here we simulate the URL since we don't have a storage provider configured
      // But we will save the metadata to the backend.

      const res = await fetch(`${API_BASE_URL}/auth/update-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `https://storage.placeholder.com/resumes/${file.name}`, // Mock Link
          filename: file.name,
          size: file.size
        }),
        credentials: "include"
      });

      if (res.ok) {
        showToast('success', 'Resume synchronized successfully.');
        fetchUser();
      } else {
        showToast('error', 'Failed to update resume metadata.');
      }
    } catch (err) {
      showToast('error', 'Infrastructure error.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveResume = async () => {
    setActionLoading('resume');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/remove-resume`, {
        method: 'POST',
        credentials: "include"
      });
      if (res.ok) {
        showToast('success', 'Resume detached.');
        fetchUser();
      }
    } catch (err) {
      showToast('error', 'Failed to remove resume.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSocials = async () => {
    setActionLoading('social');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/update-socials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialLinks),
        credentials: "include"
      });
      if (res.ok) {
        showToast('success', 'Social handles synchronized.');
      } else {
        showToast('error', 'Synchronization failed.');
      }
    } catch (err) {
      showToast('error', 'Network error.');
    } finally {
      setActionLoading(null);
    }
  };

  const updatePreferences = async (titles, locations) => {
    try {
      await fetch(`${API_BASE_URL}/auth/update-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredJobTitles: titles, preferredLocations: locations }),
        credentials: "include"
      });
    } catch (e) { console.error(e); }
  };

  const handleAddTitle = () => {
    if (!newTitle.trim()) return;
    const updated = [...preferredJobTitles, newTitle.trim()];
    setPreferredJobTitles(updated);
    setNewTitle("");
    updatePreferences(updated, preferredLocations);
  };

  const handleAddLocation = () => {
    if (!newLocation.trim() || preferredLocations.length >= 6) return;
    const updated = [...preferredLocations, newLocation.trim()];
    setPreferredLocations(updated);
    setNewLocation("");
    updatePreferences(preferredJobTitles, updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-mode)] flex items-center justify-center">
        <Loader2 className="animate-spin text-green-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-mode)] text-[var(--text-mode)] font-['Outfit'] selection:bg-green-500/30 selection:text-green-200">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onSelectSearch={() => { }} />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-md" onClick={toggleSidebar} />
      )}

      {/* --- NOTIFICATION TOAST --- */}
      {saveStatus && (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 duration-500">
          <div className={`glass-panel border ${saveStatus.type === 'error' ? 'border-red-500/30' : 'border-green-500/30'} rounded-3xl p-5 shadow-2xl flex items-center gap-5 min-w-[320px]`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${saveStatus.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
              {saveStatus.type === 'error' ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest italic">{saveStatus.type === 'error' ? 'Operational Halt' : 'Sync Success'}</p>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{saveStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 pt-32 pb-24">

        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-green-500 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.4)]" />
              <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase">
                Profile<span className="text-green-500">.</span>
              </h1>
            </div>
            <p className="text-gray-600 font-black uppercase tracking-[0.5em] text-[10px] ml-6 italic">Identity & Resource Configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-8 space-y-12">

            {/* 1. Identity Card */}
            <div className="bg-[#0e1614] border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/[0.03] blur-[100px] -mr-32 -mt-32" />

              <div className="flex flex-col md:flex-row items-center gap-12 relative">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[3rem] overflow-hidden border-2 border-green-500/20 bg-[#070c0b] shadow-2xl relative">
                    {user?.googlePicture ? (
                      <Image src={user.googlePicture} width={160} height={160} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-gray-900 font-black text-5xl italic">{user?.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center border-4 border-[#0e1614] shadow-xl">
                    <CheckCircle2 size={16} className="text-black" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase">{user?.name}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <span className="px-4 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest">{user?.plan?.type || 'PRO MEMBER'}</span>
                    <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest">ID: #USR-{user?.userId}</span>
                  </div>
                  <p className="text-gray-500 font-medium italic text-sm">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* 2. Resume Management */}
            <div className="bg-[#0e1614] border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h3 className="text-xl font-black italic uppercase italic tracking-tight">Resume Asset</h3>
                  <p className="text-xs text-gray-500 font-bold tracking-widest">Infrastructure for autonomous submissions</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                  <FileText size={24} className="text-green-500" />
                </div>
              </div>

              {user?.resume?.url ? (
                <div className="bg-black/40 rounded-[2rem] p-8 border border-white/5 group hover:border-green-500/20 transition-all">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center text-gray-600 border border-white/5">
                        <FileText size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-white italic truncate max-w-[200px] sm:max-w-md">{user.resume.filename}</p>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                          Uploaded: {new Date(user.resume.uploadDate).toLocaleDateString()} • {(user.resume.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleRemoveResume} className="p-3 bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/10 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center bg-black/40 border-2 border-dashed border-white/5 rounded-[2.5rem] p-16 hover:border-green-500/30 hover:bg-green-500/[0.02] cursor-pointer transition-all group">
                  <Upload size={48} className="text-gray-700 group-hover:text-green-500 group-hover:scale-110 transition-all duration-500" />
                  <p className="mt-6 text-sm font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-white">Initialize Upload</p>
                  <p className="mt-2 text-[10px] text-gray-700 font-bold uppercase tracking-widest">PDF / DOCX (MAX 3MB)</p>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={actionLoading === 'resume'} />
                  {actionLoading === 'resume' && <Loader2 className="animate-spin text-green-500 mt-4" />}
                </label>
              )}
            </div>

            {/* 3. Social Integration */}
            <div className="bg-[#0e1614] border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {['github', 'linkedin'].map(platform => (
                  <div key={platform} className="space-y-4">
                    <label className="flex items-center gap-3 text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">
                      {platform === 'github' ? <GithubSVG className="text-green-500" /> : <LinkedInSVG className="text-green-500" />}
                      {platform} Protocol
                    </label>
                    <input
                      type="url"
                      value={socialLinks[platform]}
                      onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-green-500/50 outline-none font-semibold transition-all"
                      placeholder={`https://${platform}.com/username`}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveSocials}
                disabled={actionLoading === 'social'}
                className="mt-12 w-full py-5 bg-green-500 text-black text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3"
              >
                {actionLoading === 'social' ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Synchronize Social Nodes
              </button>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-4 space-y-12">

            {/* Preferences Card */}
            <div className="bg-[#0e1614] border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-10">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] border-b border-white/5 pb-6">Preference Matrix</h3>

              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={12} className="text-green-500" /> Target Roles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preferredJobTitles.map(t => (
                      <div key={t} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase flex items-center gap-2 group hover:border-red-500/30 transition-all">
                        {t}
                        <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => {
                          const updated = preferredJobTitles.filter(x => x !== t);
                          setPreferredJobTitles(updated);
                          updatePreferences(updated, preferredLocations);
                        }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddTitle()} className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-[11px] text-white focus:border-green-500/50 outline-none" placeholder="Add Role..." />
                    <button onClick={handleAddTitle} className="p-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl hover:bg-green-500 hover:text-black transition-all"><Upload size={16} /></button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} className="text-green-500" /> Geographical Nodes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preferredLocations.map(l => (
                      <div key={l} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase flex items-center gap-2 group hover:border-red-500/30 transition-all">
                        {l}
                        <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => {
                          const updated = preferredLocations.filter(x => x !== l);
                          setPreferredLocations(updated);
                          updatePreferences(preferredJobTitles, updated);
                        }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddLocation()} className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-[11px] text-white focus:border-green-500/50 outline-none" placeholder="Add City..." />
                    <button onClick={handleAddLocation} className="p-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl hover:bg-green-500 hover:text-black transition-all"><Upload size={16} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-[#0e1614] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] blur-3xl" />
              <h4 className="font-black text-white italic tracking-tight uppercase mb-4 flex items-center gap-3">
                <Info size={18} className="text-blue-500" /> System Wiki
              </h4>
              <p className="text-[11px] text-gray-600 font-bold leading-relaxed uppercase tracking-widest mb-8 italic">Your localized profiles and preferences directly influence the autonomous scraping algorithms.</p>
              <Link href="/settings" className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-center block hover:bg-white hover:text-black transition-all mt-auto shadow-xl">
                Configure Settings
              </Link>
            </div>
          </div>

        </div>

        {/* Footer periphery */}
        <div className="mt-32 border-t border-white/5 pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-gray-800 uppercase tracking-[0.5em] italic">
            &copy; {new Date().getFullYear()} JobScraper AI &mdash; Advanced Agency Infrastructure
          </p>
          <div className="flex gap-8">
            <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">TLS-v1.3</span>
            <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">GCM-256-AUTHENTICATED</span>
          </div>
        </div>

      </main>

      <style jsx global>{`
          @font-face { font-family: 'Outfit'; src: url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap'); }
          input::placeholder { color: #333; font-style: italic; }
      `}</style>
    </div>
  );
}

