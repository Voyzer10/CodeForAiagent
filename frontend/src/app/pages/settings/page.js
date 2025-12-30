'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User,
    ShieldCheck,
    CreditCard,
    LifeBuoy,
    Info,
    Pencil,
    CheckCircle2,
    X,
    Loader2,
    Globe,
    Clock,
    Mail,
    RefreshCw,
    ExternalLink,
    MessageSquare,
    Bug,
    FileText,
    Lock,
    Smartphone,
    Eye,
    Activity,
    ShieldAlert,
    Save,
    ChevronDown,
    Moon,
    Sun,
    Monitor,
    ChevronRight,
    Search as SearchIcon,
    AlertCircle
} from "lucide-react";
import UserNavbar from "../userpanel/Navbar";
import Sidebar from "../userpanel/Sidebar";

/* ==============================
   REUSABLE UI COMPONENTS
============================== */

const SettingsSection = ({ title, children, description, badge }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="pb-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h2>
                {badge && (
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                        {badge}
                    </span>
                )}
            </div>
            {description && <p className="text-gray-500 text-sm mt-1 font-medium italic">{description}</p>}
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const SettingsCard = ({ title, children, className = "", icon: Icon, description }) => (
    <div className={`bg-[#0e1614] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group ${className}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all duration-700"></div>
        {(title || Icon) && (
            <div className="flex flex-col mb-6 relative">
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} className="text-green-400" />}
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
                </div>
                {description && <p className="text-xs text-gray-500 mt-1 font-medium">{description}</p>}
            </div>
        )}
        <div className="relative">
            {children}
        </div>
    </div>
);

const SettingsRow = ({ icon: Icon, label, description, children, danger = false }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-white/5 last:border-0 gap-4">
        <div className="flex items-start gap-4">
            {Icon && (
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${danger ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400 shadow-inner'}`}>
                    <Icon size={18} />
                </div>
            )}
            <div>
                <p className={`text-sm font-bold ${danger ? 'text-red-400' : 'text-gray-200'}`}>{label}</p>
                {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed font-medium max-w-sm">{description}</p>}
            </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
            {children}
        </div>
    </div>
);

const Modal = ({ isOpen, onClose, title, children, actionLabel, onAction, danger = false, loading = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-[#0e1614] border border-white/10 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white italic tracking-tight">{title}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="mb-8">
                        {children}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 py-3 text-sm font-black text-gray-500 uppercase tracking-widest hover:text-white border border-white/5 rounded-2xl transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={onAction}
                            disabled={loading}
                            className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all ${danger ? 'bg-red-500 text-white hover:bg-red-400 shadow-red-500/20' : 'bg-green-500 text-black hover:bg-green-400 shadow-green-500/20'
                                } shadow-xl disabled:opacity-50`}
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ==============================
   MAIN PAGE COMPONENT
============================== */

export default function SettingsPage() {
    const [activeCategory, setActiveCategory] = useState("account");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // { type: 'success'|'error', message: string }
    const [actionLoading, setActionLoading] = useState(false);

    // Dynamic Data
    const [sessions, setSessions] = useState([]);
    const [credits, setCredits] = useState(1500); // Production requirement: Show 1500

    // Form states
    const [name, setName] = useState("");
    const [theme, setTheme] = useState('dark');
    const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
    const [supportForm, setSupportForm] = useState({ subject: '', category: 'automation', message: '' });

    // Modals
    const [modal, setModal] = useState({ type: null, isOpen: false });

    const router = useRouter();
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
    while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

    const categories = [
        { id: "account", label: "Account & Profile", icon: User },
        { id: "security", label: "Security & Infrastructure", icon: ShieldCheck },
        { id: "billing", label: "Billing & Payments", icon: CreditCard },
        { id: "appearance", label: "Appearance", icon: Sun },
        { id: "support", label: "Help & Support", icon: LifeBuoy },
    ];

    /* --- DATA FETCHING --- */

    const refreshSessions = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/sessions`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) setSessions(data.sessions);
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    }, [API_BASE_URL]);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                setName(data.user.name);
                setTheme(data.user.theme || 'dark');
            }
        } catch (err) {
            console.error("Failed to fetch settings data", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchData();
        refreshSessions();
    }, [fetchData, refreshSessions]);

    /* --- THEME SYNC --- */

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    /* --- ACTIONS --- */

    const showToast = (type, message) => {
        setSaveStatus({ type, message });
        setTimeout(() => setSaveStatus(null), 5000);
    };

    const handleUpdateProfile = async (updates) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                showToast('success', 'Profile configuration synchronized.');
                setUser(data.user);
            } else {
                showToast('error', data.error || 'Failed to update profile.');
            }
        } catch (err) {
            showToast('error', 'Network failure during synchronization.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.next !== passwordData.confirm) {
            showToast('error', 'New passwords do not match.');
            return;
        }
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.next }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                showToast('success', 'Password updated. Sign-out initiated.');
                setTimeout(() => window.location.href = '/', 2000);
            } else {
                showToast('error', data.message || 'Verification failed.');
            }
        } catch (err) {
            showToast('error', 'Security node unresponsive.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogoutAll = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/logout-all`, { method: 'POST', credentials: "include" });
            if (res.ok) {
                window.location.href = '/';
            } else {
                showToast('error', 'Failed to terminate global sessions.');
            }
        } catch (err) {
            showToast('error', 'Network failure.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeSession = async (requestId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/sessions/${requestId}`, {
                method: 'DELETE',
                credentials: "include"
            });
            if (res.ok) {
                showToast('success', 'Session access revoked.');
                refreshSessions();
            }
        } catch (err) {
            showToast('error', 'Revocation failed.');
        }
    };

    const handleSubmitSupport = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/support-ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supportForm),
                credentials: "include"
            });
            if (res.ok) {
                showToast('success', 'Support ticket transmitted. Tracking ID generated.');
                setSupportForm({ subject: '', category: 'automation', message: '' });
            } else {
                showToast('error', 'Transmission failure.');
            }
        } catch (err) {
            showToast('error', 'Infrastructure error.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f0e] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Control Center...</p>
                </div>
            </div>
        );
    }

    /* --- SECTION RENDERING --- */

    const renderAccount = () => (
        <SettingsSection title="Account & Profile" description="Manage your public identity and profile metadata.">
            <SettingsCard>
                <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-white/5 mb-8">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-[#070c0b] border-2 border-green-500/20 group-hover:border-green-500/50 transition-all duration-500 shadow-2xl relative">
                            {user?.googlePicture ? (
                                <Image src={user.googlePicture} alt="Profile" width={96} height={96} className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-gray-900 text-3xl font-black">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Pencil size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center border-4 border-[#0e1614] shadow-lg">
                            <CheckCircle2 size={12} className="text-black" />
                        </div>
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl font-black text-white tracking-tight italic uppercase">{user?.name}</h3>
                        <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase">{user?.email}</p>
                        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] bg-green-500/10 text-green-400 border border-green-500/20">
                                PRO Member
                            </span>
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 text-gray-500 border border-white/10">
                                ID: #USR-{user?.userId}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Legal Identity (Name)</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 focus:bg-black/60 transition-all outline-none font-semibold shadow-inner"
                                />
                                <button
                                    onClick={() => handleUpdateProfile({ name })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-green-500 transition-all"
                                >
                                    <Save size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Email Interface (Read-only)</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    readOnly
                                    value={user?.email}
                                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm text-gray-500 cursor-not-allowed outline-none font-semibold"
                                />
                                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Temporal Alignment (Timezone)</label>
                            <div className="relative">
                                <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 transition-all outline-none appearance-none font-semibold shadow-inner">
                                    <option>UTC-05:00 Eastern Time (US & Canada)</option>
                                    <option>UTC+00:00 London (GMT)</option>
                                    <option>UTC+05:30 Kolkata (IST)</option>
                                    <option>UTC+09:00 Tokyo (JST)</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Dialect Protocol (Language)</label>
                            <div className="relative">
                                <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 transition-all outline-none appearance-none font-semibold shadow-inner font-mono uppercase tracking-widest">
                                    <option>EN-US (Universal)</option>
                                    <option>ES-ES (Español)</option>
                                    <option>FR-FR (Français)</option>
                                    <option>DE-DE (Deutsch)</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderSecurity = () => (
        <SettingsSection title="Security & Infrastructure" description="Realtime monitoring of your digital footprint and access nodes.">
            <SettingsCard title="Cryptographic Maintenance" icon={ShieldCheck}>
                <SettingsRow
                    icon={Lock}
                    label="Master Password"
                    description="Last synchronized: 14 days ago. New passwords must exceed 8 characters."
                >
                    <button
                        onClick={() => setModal({ type: 'password', isOpen: true })}
                        className="px-6 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:border-white/20 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        Initiate Change
                    </button>
                </SettingsRow>
                <SettingsRow
                    icon={LogOut}
                    label="Session Decoupling"
                    description="Immediately terminate all active JWT payloads across all secondary devices."
                >
                    <button
                        onClick={() => setModal({ type: 'logoutAll', isOpen: true })}
                        className="px-6 py-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        Sign Out All
                    </button>
                </SettingsRow>
            </SettingsCard>

            <SettingsCard title="Integrated Infrastructure Access" icon={Activity} className="mt-8">
                <div className="p-6 bg-[#070c0b] rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/[0.02] group-hover:bg-red-500/[0.04] transition-all" />
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl border border-red-500/20">
                                <Mail size={32} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-white tracking-tight uppercase italic">{user?.gmailEmail ? 'Google Workspace' : 'Infrastructure Idle'}</p>
                                <p className="text-xs text-gray-500 font-bold tracking-widest">{user?.gmailEmail || "No Sink Connected"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {user?.gmailEmail ? (
                                <>
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Linked</span>
                                    </div>
                                    <button
                                        onClick={() => window.location.href = `${API_BASE_URL}/auth/gmail/connect`}
                                        className="w-11 h-11 flex items-center justify-center bg-gray-900 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button
                                        className="w-11 h-11 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <X size={18} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => window.location.href = `${API_BASE_URL}/auth/gmail/connect`}
                                    className="px-8 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all shadow-xl active:scale-95"
                                >
                                    Enable Sink
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="Active Network Sessions" icon={Smartphone} className="mt-8">
                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                    {sessions.length > 0 ? sessions.map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-black/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all group shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-gray-600 group-hover:text-green-400 transition-colors border border-white/5 shadow-inner">
                                    {session.deviceType === 'mobile' ? <Smartphone size={20} /> : <Activity size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-gray-200 uppercase tracking-widest">{session.deviceType || 'Unknown Device'}</p>
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Active Stream" />
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{session.ipAddressMasked} • <span className="text-gray-700">{new Date(session.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRevokeSession(session.requestId)}
                                className="p-3 text-gray-700 hover:text-red-400 transition-all hover:bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/20"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )) : (
                        <div className="py-12 flex flex-col items-center gap-4 text-center">
                            <AlertCircle size={32} className="text-gray-800" />
                            <p className="text-xs font-black text-gray-700 uppercase tracking-widest">No secondary sessions detected</p>
                        </div>
                    )}
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderBilling = () => (
        <SettingsSection title="Billing & Payments" description="Manage your computational economy and ledger.">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <SettingsCard className="lg:col-span-2 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-green-500/10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-2">Current Tier</p>
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Enterprise Elite</h3>
                        </div>
                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black shadow-[0_0_40px_rgba(74,222,128,0.25)] border border-green-400/30">
                            <CreditCard size={38} />
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="flex justify-between items-end">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Computational Credits Available</p>
                                <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{credits.toLocaleString()} <span className="text-sm text-gray-700 font-black uppercase tracking-widest">UNITs</span></p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 shadow-inner">Health: Stable</span>
                            </div>
                        </div>
                        <div className="w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-white/[0.03] p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-[2000ms] shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                                style={{ width: `${(credits / 5000) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center bg-black/40 p-5 rounded-[1.5rem] border border-white/5 shadow-inner">
                            <div className="flex items-center gap-4">
                                <Clock size={16} className="text-orange-500" />
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Next Cycle Synchronization in <span className="text-white">16 Days</span></p>
                            </div>
                            <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-[0.2em] italic underline underline-offset-4">Refill Now</button>
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard className="bg-green-500/[0.03] border-green-500/10 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-green-500/40 uppercase tracking-[0.4em] mb-3">Algorithmic ROI</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter mb-4">$1,240<span className="text-sm text-gray-700 font-bold">.00</span></h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed italic opacity-60">Calculated value of time salvaged via autonomous application nodes this financial quarter.</p>
                    </div>
                    <div className="mt-12 pt-6 border-t border-white/5">
                        <button disabled className="w-full py-4 bg-white/5 border border-white/5 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-2xl cursor-not-allowed">
                            Report Data Syncing...
                        </button>
                    </div>
                </SettingsCard>
            </div>

            <SettingsCard title="Ledger & Financial Protocol" icon={FileText}>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#070c0b] rounded-[1.5rem] border border-white/5 shadow-2xl group hover:border-green-500/20 transition-all">
                        <div className="flex items-center gap-6 mb-4 sm:mb-0">
                            <div className="w-14 h-10 bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner">
                                <div className="absolute inset-0 bg-blue-500/5" />
                                <span className="text-[10px] font-black text-gray-300 tracking-[0.3em]">VISA</span>
                            </div>
                            <div>
                                <p className="text-md font-black text-gray-200 tracking-tighter">•••• •••• •••• 4242</p>
                                <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] font-black mt-0.5">Primary Ledger • Exp 12/26</p>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-xl transition-all border border-white/5 active:scale-95">Modify Node</button>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6 ml-1">Transaction Pipeline</h4>
                        <div className="space-y-3">
                            {[
                                { id: "LDR-4820", date: "Dec 15, 2025", type: "Elite Tier", amount: "$49.00", status: "Validated" },
                                { id: "LDR-3195", date: "Nov 15, 2025", type: "Elite Tier", amount: "$49.00", status: "Validated" },
                            ].map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-transparent hover:border-white/5 transition-all group">
                                    <div className="flex items-center gap-10">
                                        <span className="text-gray-600 font-mono text-[10px] tracking-widest">{tx.id}</span>
                                        <div className="hidden sm:block">
                                            <p className="text-white font-black text-xs uppercase tracking-widest">{tx.type}</p>
                                            <p className="text-[9px] text-gray-700 font-bold uppercase tracking-[0.2em]">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className="text-white font-black italic tracking-tighter text-lg">{tx.amount}</span>
                                        <span className="px-2 py-1 bg-green-500/5 text-green-500/50 text-[9px] font-black uppercase tracking-widest border border-green-500/10 rounded-md">{tx.status}</span>
                                        <button className="p-2 text-gray-700 hover:text-white transition-all"><FileText size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderAppearance = () => (
        <SettingsSection title="Appearance" description="Configure the visual frequency of your interface.">
            <SettingsCard>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Optimized for low-light environments.' },
                        { id: 'light', label: 'Light Mode', icon: Sun, desc: 'High contrast for day utilization.' },
                        { id: 'system', label: 'System Default', icon: Monitor, desc: 'Auto-sync with OS kernel.' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => {
                                setTheme(opt.id);
                                handleUpdateProfile({ theme: opt.id });
                            }}
                            className={`flex flex-col items-center p-8 rounded-[2rem] border-2 transition-all duration-300 group ${theme === opt.id
                                ? 'bg-green-500/10 border-green-500/40 shadow-xl shadow-green-500/5'
                                : 'bg-black/20 border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${theme === opt.id
                                ? 'bg-green-500 text-black shadow-lg shadow-green-500/40 rotate-[10deg]'
                                : 'bg-gray-900 text-gray-600 group-hover:text-gray-300'
                                }`}>
                                <opt.icon size={32} />
                            </div>
                            <span className={`text-sm font-black uppercase tracking-widest mb-2 ${theme === opt.id ? 'text-white' : 'text-gray-500'}`}>{opt.label}</span>
                            <p className="text-[10px] text-gray-700 font-bold text-center leading-relaxed">{opt.desc}</p>
                        </button>
                    ))}
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderSupport = () => (
        <SettingsSection title="Intelligence Ops & Support" description="Direct communication node for technical assistance.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsCard title="Infrastructure Query" description="Submit an encrypted transmission to our technicians.">
                    <form onSubmit={handleSubmitSupport} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Transmission Subject</label>
                            <input
                                required
                                value={supportForm.subject}
                                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 outline-none font-semibold shadow-inner"
                                placeholder="EX: Pipeline Latency Audit"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Classification Category</label>
                            <div className="relative">
                                <select
                                    value={supportForm.category}
                                    onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 outline-none appearance-none font-semibold shadow-inner font-mono uppercase tracking-widest"
                                >
                                    <option value="automation">Automation Fault</option>
                                    <option value="billing">Ledger Discrepancy</option>
                                    <option value="security">Encryption / Auth</option>
                                    <option value="bug">Alpha Node Error (Bug)</option>
                                    <option value="other">General Protocol</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Telemetry / Details</label>
                            <textarea
                                required
                                rows={5}
                                value={supportForm.message}
                                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 outline-none font-semibold shadow-inner resize-none"
                                placeholder="Describe the operational anomaly..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full py-4 bg-green-500 text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Transmit Intelligence
                        </button>
                    </form>
                </SettingsCard>

                <div className="space-y-6">
                    <SettingsCard title="Intelligence Database" icon={Info}>
                        <div className="space-y-4">
                            {[
                                { q: "How to recalibrate node speed?", a: "Navigate to Preferences and adjust the Algorithmic Delay slider." },
                                { q: "Can I connect multiple Gmail sinks?", a: "Current stability protocols only support one primary sink per user." },
                                { q: "Ledger syncing delay?", a: "Financial settlements take up to 300s to reflect in the UI." }
                            ].map((faq, i) => (
                                <details key={i} className="group cursor-pointer">
                                    <summary className="text-[11px] font-black text-white uppercase tracking-widest list-none flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group-open:border-green-500/20 group-open:bg-green-500/5 transition-all">
                                        {faq.q}
                                        <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <p className="p-5 text-[11px] text-gray-500 font-medium leading-relaxed italic border-x border-b border-white/5 rounded-b-xl">{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </SettingsCard>

                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-5 bg-[#0e1614] border border-white/5 rounded-3xl hover:bg-[#15201d] transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center text-gray-700 group-hover:text-white transition-all">
                                    <ShieldAlert size={18} />
                                </div>
                                <span className="font-black text-gray-400 group-hover:text-white uppercase tracking-[0.2em] text-[10px]">End-User Logic Agreement</span>
                            </div>
                            <ExternalLink size={16} className="text-gray-800" />
                        </button>
                        <button className="w-full flex items-center justify-between p-5 bg-[#0e1614] border border-white/5 rounded-3xl hover:bg-[#15201d] transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center text-gray-700 group-hover:text-white transition-all">
                                    <Lock size={18} />
                                </div>
                                <span className="font-black text-gray-400 group-hover:text-white uppercase tracking-[0.2em] text-[10px]">Data Architecture Privacy</span>
                            </div>
                            <ExternalLink size={16} className="text-gray-800" />
                        </button>
                    </div>
                </div>
            </div>
        </SettingsSection>
    );

    const renderContent = () => {
        switch (activeCategory) {
            case "account": return renderAccount();
            case "security": return renderSecurity();
            case "billing": return renderBilling();
            case "appearance": return renderAppearance();
            case "support": return renderSupport();
            default: return renderAccount();
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a110a] text-gray-200 font-['Outfit'] selection:bg-green-500 selection:text-black">
            <UserNavbar onSidebarToggle={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} onSelectSearch={() => { }} />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/80 z-[140] lg:hidden backdrop-blur-md" onClick={toggleSidebar} />
            )}

            {/* --- MODALS --- */}

            <Modal
                isOpen={modal.type === 'password' && modal.isOpen}
                onClose={() => setModal({ type: null, isOpen: false })}
                title="Synchronize Core Password"
                actionLabel="Update Security"
                loading={actionLoading}
                onAction={handleChangePassword}
            >
                <div className="space-y-4">
                    <p className="text-xs text-gray-500 font-medium italic mb-4">You will be required to log in again after changing your password.</p>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Current Authentication Key</label>
                        <input
                            type="password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 outline-none font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">New Authentication Key</label>
                        <input
                            type="password"
                            value={passwordData.next}
                            onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 outline-none font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Verify New Key</label>
                        <input
                            type="password"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-green-500/50 outline-none font-mono"
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modal.type === 'logoutAll' && modal.isOpen}
                onClose={() => setModal({ type: null, isOpen: false })}
                title="Terminate Global Sessions"
                actionLabel="Terminate All"
                danger
                loading={actionLoading}
                onAction={handleLogoutAll}
            >
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    This action will immediately invalidate all existing JWT payloads across all devices. You will be signed out of this session as well.
                </p>
            </Modal>

            {/* --- NOTIFICATION TOAST --- */}
            {saveStatus && (
                <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 duration-500">
                    <div className={`bg-[#0e1614] border ${saveStatus.type === 'error' ? 'border-red-500/30' : 'border-green-500/30'} rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.7)] flex items-center gap-5 min-w-[320px]`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${saveStatus.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                            {saveStatus.type === 'error' ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
                        </div>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-widest italic">{saveStatus.type === 'error' ? 'Operational Halt' : 'Sync Success'}</p>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{saveStatus.message}</p>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 pt-32 pb-24">

                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-10 bg-green-500 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.4)]" />
                            <h1 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter shadow-green-500/5 drop-shadow-2xl uppercase">
                                Control Center<span className="text-green-500">.</span>
                            </h1>
                        </div>
                        <p className="text-gray-600 font-black uppercase tracking-[0.5em] text-[10px] ml-6">Autonomous Infrastructure Dashboard v4.2.0</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/pages/userpanel"
                            className="px-8 py-4 rounded-2xl bg-[#0e1614] border border-white/5 hover:border-green-500/30 text-gray-500 hover:text-green-500 transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-xl relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            Return to Bridge
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">

                    {/* --- CATEGORY SELECTOR --- */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="sticky top-32 space-y-3">
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] ml-2 mb-6">Neural Categories</p>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden active:scale-[0.98] ${activeCategory === cat.id
                                        ? 'bg-green-500/15 text-white border border-green-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
                                        : 'text-gray-600 hover:bg-white/[0.04] hover:text-gray-300 border border-transparent'
                                        }`}
                                >
                                    {activeCategory === cat.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-green-500 shadow-[2px_0_20px_rgba(34,197,94,0.6)] rounded-r-full" />
                                    )}
                                    <cat.icon size={22} className={`${activeCategory === cat.id ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.7)]' : 'text-gray-700 group-hover:text-gray-400'} transition-all duration-300`} />
                                    <span className={`text-sm tracking-tight font-black uppercase tracking-[0.1em]`}>{cat.label}</span>
                                    {activeCategory === cat.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                                </button>
                            ))}

                            <div className="mt-12 pt-12 border-t border-white/5">
                                <div className="bg-[#0e1614] rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 blur-2xl" />
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Activity size={12} className="text-green-500 animate-pulse" /> Infrastructure Load
                                    </p>
                                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                        <div className="w-[18%] h-full bg-green-500 group-hover:w-[22%] transition-all duration-1000 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                    </div>
                                    <p className="text-[9px] text-gray-700 font-black uppercase mt-3 tracking-widest text-right">0.82ms Latency</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- WORKSPACE AREA --- */}
                    <div className="flex-1 lg:max-w-[880px]">
                        <div className="pb-32">
                            {renderContent()}
                        </div>
                    </div>

                </div>

                {/* --- FOOTER PERIPHERY --- */}
                <div className="mt-32 border-t border-white/5 pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] italic">
                            &copy; {new Date().getFullYear()} JobScraper AI &mdash; Advanced Agency Infrastructure
                        </p>
                        <p className="text-[9px] text-gray-800 font-bold uppercase tracking-widest ml-1">E2E-ENC (AES-256-GCM) • VERB_PROTO_v4.2</p>
                    </div>
                    <div className="flex gap-12">
                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-white/5 pb-1">
                            Quantum-Safe
                        </span>
                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-white/5 pb-1">
                            ISO-27001 Compliant
                        </span>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @font-face { font-family: 'Outfit'; src: url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap'); }
                input::placeholder, textarea::placeholder { color: #333; font-style: italic; }
            `}</style>
        </div>
    );
}
