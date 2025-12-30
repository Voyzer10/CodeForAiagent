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
    LogOut,
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
import { useTranslation } from "react-i18next";
import moment from "moment-timezone";

/* ==============================
   REUSABLE UI COMPONENTS
============================== */

const SettingsSection = ({ title, children, description, badge }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="pb-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-mode)]">{title}</h2>
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
    <div className={`bg-[var(--surface-mode)] border border-[var(--border-mode)] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group ${className}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all duration-700"></div>
        {(title || Icon) && (
            <div className="flex flex-col mb-6 relative">
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} className="text-green-400" />}
                    <h3 className="text-sm font-black text-[var(--text-mode)] uppercase tracking-widest">{title}</h3>
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
                <p className={`text-sm font-bold ${danger ? 'text-red-400' : '[var(--text-mode)]'}`}>{label}</p>
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
            <div className="bg-[var(--surface-mode)] border border-[var(--border-mode)] rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-[var(--text-mode)] italic tracking-tight">{title}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="mb-8 text-[var(--text-mode)]">
                        {children}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 py-3 text-sm font-black text-gray-500 uppercase tracking-widest hover:text-[var(--text-mode)] border border-[var(--border-mode)] rounded-2xl transition-all">
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

let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const [activeCategory, setActiveCategory] = useState("account");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Dynamic Data
    const [sessions, setSessions] = useState([]);
    const [credits, setCredits] = useState(1500); // Prominent 1500

    // Form states
    const [name, setName] = useState("");
    const [theme, setTheme] = useState('dark');
    const [timezone, setTimezone] = useState(moment.tz.guess());
    const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
    const [supportForm, setSupportForm] = useState({ subject: '', category: 'automation', message: '' });

    // Modals
    const [modal, setModal] = useState({ type: null, isOpen: false });

    const router = useRouter();
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);


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
            if (res.ok) setSessions(data.sessions || []);
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                setName(data.user.name);
                setTheme(data.user.theme || 'dark');
                // Persist theme to localStorage if not there
                if (!localStorage.getItem('theme')) localStorage.setItem('theme', data.user.theme || 'dark');
            }
        } catch (err) {
            console.error("Failed to fetch settings data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        refreshSessions();
    }, [fetchData, refreshSessions]);

    /* --- THEME SYNC --- */

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        localStorage.setItem('theme', theme);
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
                showToast('success', 'Configuration synchronized.');
                setUser(data.user);
            } else {
                showToast('error', data.error || 'Sync failed.');
            }
        } catch (err) {
            showToast('error', 'Network failure.');
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
                showToast('success', 'Security update successful.');
                setTimeout(() => window.location.href = '/pages/auth/login', 1500);
            } else {
                showToast('error', data.message || 'Verification failed.');
            }
        } catch (err) {
            showToast('error', 'Infrastructure error.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogoutAll = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/logout-all`, { method: 'POST', credentials: "include" });
            if (res.ok) {
                window.location.href = '/pages/auth/login';
            } else {
                showToast('error', 'Session termination failed.');
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
                showToast('success', 'Node access revoked.');
                refreshSessions();
            }
        } catch (err) {
            showToast('error', 'Revocation failed.');
        }
    };

    const handleDisconnectGmail = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/gmail/disconnect`, {
                method: 'POST',
                credentials: "include"
            });
            if (res.ok) {
                showToast('success', 'Infrastructure sink decoupled.');
                fetchData();
            } else {
                showToast('error', 'Decoupling failed.');
            }
        } catch (err) {
            showToast('error', 'Network failure.');
        } finally {
            setActionLoading(false);
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
                showToast('success', 'Intelligence transmitted. Ticket generated.');
                setSupportForm({ subject: '', category: 'automation', message: '' });
            } else {
                showToast('error', 'Transmission error.');
            }
        } catch (err) {
            showToast('error', 'Operational halt.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background-mode)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
            </div>
        );
    }

    /* --- SECTION RENDERING --- */

    const renderAccount = () => (
        <SettingsSection title="Account & Identity" description="Configure your public profile and regional parameters.">
            <SettingsCard>
                <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-white/5 mb-8">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[#070c0b] border-2 border-green-500/20 shadow-2xl relative">
                            {user?.googlePicture ? (
                                <Image src={user.googlePicture} alt="Profile" width={96} height={96} className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-gray-900 text-3xl font-black">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl font-black text-[var(--text-mode)] tracking-tight uppercase italic">{user?.name}</h3>
                        <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase italic">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Identity Node (Name)</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-[var(--text-mode)] focus:border-green-500/50 outline-none font-semibold transition-all"
                                />
                                <button onClick={() => handleUpdateProfile({ name })} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-green-500"><Save size={18} /></button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Primary Email Node</label>
                            <div className="relative">
                                <input readOnly value={user?.email} className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm text-gray-500 cursor-not-allowed outline-none font-semibold" />
                                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Temporal Alignment (Timezone)</label>
                            <div className="relative">
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-[var(--text-mode)] focus:border-green-500/50 outline-none appearance-none font-semibold"
                                >
                                    {moment.tz.names().map(tz => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Protocol Dialect (Language)</label>
                            <div className="relative">
                                <select
                                    value={i18n.language}
                                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-[var(--text-mode)] focus:border-green-500/50 outline-none appearance-none font-semibold uppercase tracking-widest"
                                >
                                    <option value="en">EN-US (Global)</option>
                                    <option value="es">ES-ES (Español)</option>
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
        <SettingsSection title="Security Operations" description="Maintain your cryptographic infrastructure and active tokens.">
            <SettingsCard title="Credential Integrity" icon={ShieldCheck}>
                <SettingsRow icon={Lock} label="Access Key" description="Rotate your primary authentication password regularly to ensure node security.">
                    <button onClick={() => setModal({ type: 'password', isOpen: true })} className="px-6 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Rotate Key</button>
                </SettingsRow>
                <SettingsRow icon={LogOut} label="Decouple Sessions" description="Immediately invalidate every active JWT payload across all external devices." danger>
                    <button onClick={() => setModal({ type: 'logoutAll', isOpen: true })} className="px-6 py-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">Purge All</button>
                </SettingsRow>
            </SettingsCard>

            <SettingsCard title="Infrastructure Sinks" icon={Activity} className="mt-8">
                <div className="bg-[#070c0b] rounded-3xl p-6 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-xl">
                            <Mail size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white italic uppercase tracking-tight">{user?.gmailEmail ? 'Workspace Sync' : 'Sink Inactive'}</p>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{user?.gmailEmail || 'No Email Linked'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.href = `${API_BASE_URL}/auth/gmail/connect`} className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
                            {user?.gmailEmail ? 'Rotate Sink' : 'Initialize Sink'}
                        </button>
                        {user?.gmailEmail && (
                            <button
                                onClick={handleDisconnectGmail}
                                disabled={actionLoading}
                                className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={20} />}
                            </button>
                        )}
                    </div>
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderBilling = () => (
        <SettingsSection title="Computational Economy" description="Manage credits and planetary billing cycle.">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <SettingsCard className="lg:col-span-8">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Operational Tier</p>
                            <h3 className="text-5xl font-black text-[var(--text-mode)] italic tracking-tighter uppercase">Premium Plan<span className="text-green-500">.</span></h3>
                        </div>
                        <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black shadow-2xl border border-white/10">
                            <CreditCard size={36} />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Credit Balance</p>
                                <p className="text-4xl font-black text-[var(--text-mode)] italic tabular-nums">{credits.toLocaleString()} <span className="text-sm text-gray-700 italic">CREDITs</span></p>
                            </div>
                            <button onClick={() => router.push('/pages/price')} className="px-6 py-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">Top Up</button>
                        </div>
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-green-500 shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all duration-1000" style={{ width: `${(credits / 1500) * 100}%` }} />
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Billing Pipeline历史</p>
                            <span className="text-[10px] text-green-500 font-bold uppercase italic tracking-widest bg-green-500/5 px-3 py-1 rounded-md border border-green-500/10">Validated</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: "TXN-8291", type: "PREMIUM RENEWAL", amount: "$25.00", date: "Dec 12, 2025" },
                                { id: "TXN-7402", type: "PREMIUM RENEWAL", amount: "$25.00", date: "Nov 12, 2025" }
                            ].map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 hover:border-green-500/20 transition-all group">
                                    <div className="flex items-center gap-8">
                                        <span className="font-mono text-[10px] text-gray-700">{tx.id}</span>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase italic">{tx.type}</p>
                                            <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">{tx.date}</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-black text-white italic tracking-tight">{tx.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SettingsCard>

                <div className="lg:col-span-4 space-y-8">
                    <SettingsCard className="bg-green-500/[0.02]">
                        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 italic">Economic Metrics</h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-4xl font-black text-white italic tracking-tighter">$1,250<span className="text-sm text-gray-700 font-black">.00</span></p>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Calculated ROI</p>
                            </div>
                            <button disabled className="w-full py-4 bg-white/5 border border-white/5 text-gray-800 text-[10px] font-black uppercase tracking-widest rounded-2xl cursor-not-allowed">
                                Download Protocol (Locked)
                            </button>
                        </div>
                    </SettingsCard>

                    <div className="p-8 bg-[#0e1614] border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Payment Node</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gray-900 border border-white/10 rounded-lg flex items-center justify-center text-[8px] font-black italic tracking-widest text-gray-600">VISA</div>
                            <p className="text-sm font-black text-white tracking-widest italic">•••• 4242</p>
                        </div>
                        <button className="mt-8 text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-widest underline underline-offset-4">Update Processor</button>
                    </div>
                </div>
            </div>
        </SettingsSection>
    );

    const renderAppearance = () => (
        <SettingsSection title="Visual Appearance" description="Adjust the luminosity and color spectrum of the dashboard.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Optimized for high-latitude low light nodes.' },
                    { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Maximum luminosity for solar environments.' },
                    { id: 'system', label: 'System Default', icon: Monitor, desc: 'Sync interface with the OS kernel.' }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={`p-10 rounded-[3rem] border-2 transition-all duration-500 flex flex-col items-center group ${theme === opt.id ? 'bg-green-500/10 border-green-500/20 shadow-xl' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${theme === opt.id ? 'bg-green-500 text-black shadow-green-500/40 rotate-[12deg]' : 'bg-gray-900 text-gray-700'}`}>
                            <opt.icon size={32} />
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 ${theme === opt.id ? 'text-white' : 'text-gray-600'}`}>{opt.label}</span>
                        <p className="text-[10px] text-gray-500 font-medium italic opacity-60 text-center">{opt.desc}</p>
                    </button>
                ))}
            </div>
        </SettingsSection>
    );

    const renderSupport = () => (
        <SettingsSection title="Support & Intelligence" description="Direct communication channel to our technicians.">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <SettingsCard className="md:col-span-12">
                    <form onSubmit={handleSubmitSupport} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] ml-1">Protocol Subject</label>
                                <input value={supportForm.subject} onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-green-500/50 outline-none font-semibold" placeholder="EX: CRITICAL SYNC LATENCY" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] ml-1">Fault Category</label>
                                <div className="relative">
                                    <select value={supportForm.category} onChange={e => setSupportForm({ ...supportForm, category: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-green-500/50 outline-none appearance-none font-semibold uppercase tracking-widest italic">
                                        <option value="automation">Automation Node Fail</option>
                                        <option value="billing">Credit/Billing Protocol</option>
                                        <option value="security">Auth/Encryption Anomalies</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] ml-1">Intelligence Logs / Feedback</label>
                                <textarea rows={6} value={supportForm.message} onChange={e => setSupportForm({ ...supportForm, message: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-green-500/50 outline-none font-semibold resize-none" placeholder="Provide detailed operational telemetry..." />
                            </div>
                            <button type="submit" disabled={actionLoading} className="w-full py-5 bg-green-500 text-black text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-green-500/20 hover:bg-green-400 transition-all active:scale-95 flex items-center justify-center gap-3">
                                {actionLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                Transmit Protocol
                            </button>
                        </div>
                    </form>
                </SettingsCard>
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
        <div className="min-h-screen w-full bg-[var(--background-mode)] text-[var(--text-mode)] font-['Outfit'] selection:bg-green-500 selection:text-black">
            <UserNavbar onSidebarToggle={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} onSelectSearch={() => { }} />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-md" onClick={toggleSidebar} />
            )}

            {/* --- NOTIFICATIONS --- */}
            {saveStatus && (
                <div className="fixed bottom-12 right-12 z-[300] animate-in slide-in-from-right-10 duration-500">
                    <div className={`glass-panel border ${saveStatus.type === 'error' ? 'border-red-500/30' : 'border-green-500/30'} rounded-[2.5rem] p-6 shadow-2xl flex items-center gap-6 min-w-[360px]`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${saveStatus.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                            {saveStatus.type === 'error' ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-[0.2em] italic">{saveStatus.type === 'error' ? 'Operational Halt' : 'Sync Success'}</p>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{saveStatus.message}</p>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 pt-32 pb-24">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* --- CATEGORY SELECTOR --- */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="sticky top-32 space-y-10">
                            <div>
                                <h1 className="text-4xl font-black italic tracking-tighter uppercase">Settings<span className="text-green-500">.</span></h1>
                                <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.5em] mt-1 ml-1 opacity-60 italic">Node Control Interface v2.4</p>
                            </div>

                            <nav className="space-y-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden ${activeCategory === cat.id
                                            ? 'bg-green-500 text-black font-black shadow-xl shadow-green-500/10'
                                            : 'bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                                            }`}
                                    >
                                        <cat.icon size={20} className={activeCategory === cat.id ? 'text-black' : 'group-hover:text-green-400 transition-colors'} />
                                        <span className="text-xs uppercase tracking-widest italic">{cat.label}</span>
                                        {activeCategory === cat.id && (
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-l-full" />
                                        )}
                                    </button>
                                ))}
                            </nav>

                            <div className="pt-10 border-t border-white/5 space-y-6">
                                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl group cursor-pointer hover:bg-red-500/10 transition-all" onClick={() => setModal({ type: 'logout', isOpen: true })}>
                                    <div className="flex items-center gap-4 text-red-500">
                                        <LogOut size={20} />
                                        <span className="text-xs font-black uppercase tracking-widest italic">Terminate Auth</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN CONTENT --- */}
                    <div className="flex-1 max-w-4xl">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* --- MODALS --- */}
            <Modal
                isOpen={modal.isOpen && modal.type === 'password'}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title="Rotate Access Key"
                actionLabel="Synchronize Key"
                onAction={handleChangePassword}
                loading={actionLoading}
            >
                <div className="space-y-6">
                    <p className="text-sm text-gray-500 font-medium italic">Updating your master key will decouple all current session proxies.</p>
                    <div className="space-y-4">
                        <input type="password" placeholder="Current Node Key" value={passwordData.current} onChange={e => setPasswordData({ ...passwordData, current: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-green-500 outline-none" />
                        <input type="password" placeholder="New Protocol Key" value={passwordData.next} onChange={e => setPasswordData({ ...passwordData, next: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-green-500 outline-none" />
                        <input type="password" placeholder="Confirm Protocol Key" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-green-500 outline-none" />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modal.isOpen && modal.type === 'logoutAll'}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title="Global Node Decoupling"
                actionLabel="Execute Purge"
                onAction={handleLogoutAll}
                danger
                loading={actionLoading}
            >
                <p className="text-sm text-gray-500 font-medium leading-relaxed italic">You are about to terminate every active session node associated with this identity. This action is instantaneous and force-redirects all secondary clients to the auth portal.</p>
            </Modal>

            <Modal
                isOpen={modal.isOpen && modal.type === 'logout'}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title="Terminate Session"
                actionLabel="Confirm Logout"
                onAction={() => window.location.href = '/pages/auth/login'}
                danger
            >
                <p className="text-sm text-gray-500 font-medium italic leading-relaxed">Ensure all operational telemetry has been synchronized before decoupling from this terminal.</p>
            </Modal>
        </div>
    );
}
