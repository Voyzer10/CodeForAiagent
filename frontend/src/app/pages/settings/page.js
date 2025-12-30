'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User,
    ShieldCheck,
    Zap,
    Link as LinkIcon,
    CreditCard,
    Bell,
    LifeBuoy,
    Code,
    Info,
    Pencil,
    CheckCircle2,
    X,
    Loader2,
    LogOut,
    ChevronRight,
    Globe,
    Clock,
    Trash2,
    Mail,
    RefreshCw,
    ExternalLink,
    MessageSquare,
    Bug,
    FileText,
    Lock,
    Smartphone,
    Tally5,
    Eye,
    Activity,
    ArrowRight,
    ShieldAlert,
    Save,
    ChevronDown
} from "lucide-react";
import UserNavbar from "../userpanel/Navbar";
import Sidebar from "../userpanel/Sidebar";

/* ==============================
   REUSABLE UI COMPONENTS
============================== */

const SettingsSection = ({ title, children, description }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="pb-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h2>
            {description && <p className="text-gray-500 text-sm mt-1 font-medium">{description}</p>}
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const SettingsCard = ({ title, children, className = "", icon: Icon }) => (
    <div className={`bg-[#0e1614] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group ${className}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all duration-700"></div>
        {title && (
            <div className="flex items-center gap-3 mb-6 relative">
                {Icon && <Icon size={18} className="text-green-400" />}
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
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

const Toggle = ({ enabled, onChange, disabled = false }) => (
    <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${enabled ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-800'
            } ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
    >
        <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
        />
    </button>
);

/* ==============================
   MAIN PAGE COMPONENT
============================== */

export default function SettingsPage() {
    const [activeCategory, setActiveCategory] = useState("account");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', null
    const [credits, setCredits] = useState(0);

    // Form states
    const [name, setName] = useState("");
    const [autoApply, setAutoApply] = useState(true);
    const [notifications, setNotifications] = useState({
        jobFound: true,
        applySuccess: true,
        security: true
    });

    const router = useRouter();
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
    while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

    const categories = [
        { id: "account", label: "Account & Profile", icon: User },
        { id: "security", label: "Security & Privacy", icon: ShieldCheck },
        { id: "automation", label: "Automation Preferences", icon: Zap },
        { id: "integrations", label: "Integrations", icon: LinkIcon },
        { id: "billing", label: "Billing & Payments", icon: CreditCard },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "support", label: "Help & Support", icon: LifeBuoy },
        { id: "advanced", label: "Advanced", icon: Code },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
                const data = await res.json();
                if (res.ok) {
                    setUser(data.user);
                    setName(data.user.name);
                    // Fetch credits
                    const creditRes = await fetch(`${API_BASE_URL}/credits/check?userId=${data.user.userId}`, { credentials: "include" });
                    const creditData = await creditRes.json();
                    if (creditRes.ok) setCredits(creditData.credits);
                }
            } catch (err) {
                console.error("Failed to fetch settings data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [API_BASE_URL]);

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 3000);
        }, 1000);
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
        <SettingsSection title="Account & Profile" description="Manage your public identity and account metadata.">
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
                        <h3 className="text-2xl font-black text-white tracking-tight">{user?.name}</h3>
                        <p className="text-gray-500 font-medium">{user?.email}</p>
                        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                                PRO Member
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Level 4 Agent
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-green-500/50 focus:bg-black/60 transition-all outline-none font-semibold shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email (Read Only)</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    readOnly
                                    value={user?.email}
                                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-gray-500 cursor-not-allowed outline-none font-semibold"
                                />
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Regional Timezone</label>
                            <div className="relative">
                                <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-green-500/50 transition-all outline-none appearance-none font-semibold shadow-inner">
                                    <option>UTC-05:00 Eastern Time (US & Canada)</option>
                                    <option>UTC+00:00 London (GMT)</option>
                                    <option>UTC+05:30 Kolkata (IST)</option>
                                    <option>UTC+09:00 Tokyo (JST)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Interface Language</label>
                            <div className="relative">
                                <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-green-500/50 transition-all outline-none appearance-none font-semibold shadow-inner">
                                    <option>English (Universal)</option>
                                    <option>Spanish (Español)</option>
                                    <option>French (Français)</option>
                                    <option>German (Deutsch)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row justify-end gap-4">
                    <button className="px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest">Reset Changes</button>
                    <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className="px-10 py-3.5 bg-green-500 text-black text-sm font-black rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {saveStatus === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                        Save Account
                    </button>
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderSecurity = () => (
        <SettingsSection title="Security & Privacy" description="Manage your digital fortress and data privacy controls.">
            <SettingsCard title="Security Protocols" icon={ShieldCheck}>
                <SettingsRow
                    icon={Lock}
                    label="Password Maintenance"
                    description="We recommend changing your password every 90 days to maintain optimal security."
                >
                    <button className="px-6 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-gray-300 hover:border-white/20 hover:text-white transition-all shadow-lg active:scale-95">
                        Reset Now
                    </button>
                </SettingsRow>
                <SettingsRow
                    icon={Smartphone}
                    label="2-Factor Authentication (2FA)"
                    description="Secure your account using an authenticator app (Google, Authy) or SMS verification."
                >
                    <Toggle enabled={true} onChange={() => { }} />
                </SettingsRow>
            </SettingsCard>

            <SettingsCard title="Infrastructure Access" icon={Activity} className="mt-8">
                <div className="space-y-4">
                    {[
                        { device: "MacBook Pro M3", location: "Mumbai, India", status: "Primary Device", active: true, time: "Now" },
                        { device: "iPhone 15 Pro", location: "Mumbai, India", status: "Mobile App", active: false, time: "42 mins ago" },
                    ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all group shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-gray-500 group-hover:text-green-400 transition-colors">
                                    {session.device.includes("iPhone") ? <Smartphone size={20} /> : <Code size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-gray-200">{session.device}</p>
                                        {session.active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium">{session.location} • <span className="text-gray-600">{session.time}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="hidden sm:block text-[10px] font-black text-gray-600 uppercase tracking-widest">{session.status}</span>
                                {!session.active && (
                                    <button className="p-2 text-gray-700 hover:text-red-400 transition-all">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button className="w-full mt-4 py-3 text-xs font-black text-red-500/50 hover:text-red-500 uppercase tracking-[0.2em] transition-all">
                        Inhibit all active sessions
                    </button>
                </div>
            </SettingsCard>

            <SettingsCard title="Privacy Settings" icon={Eye} className="mt-8">
                <SettingsRow
                    label="Job Search Anonymity"
                    description="Hide your profile from recruiters in the global search directory."
                >
                    <Toggle enabled={false} onChange={() => { }} />
                </SettingsRow>
                <SettingsRow
                    label="Data Retention"
                    description="Automatically purge application logs after 30 days."
                >
                    <Toggle enabled={true} onChange={() => { }} />
                </SettingsRow>
            </SettingsCard>

            <SettingsCard className="border-red-500/20 bg-red-500/5 mt-8">
                <div className="flex items-center gap-3 mb-4">
                    <ShieldAlert size={18} className="text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]" />
                    <h3 className="text-sm font-black text-red-400 uppercase tracking-widest">Decommission Account</h3>
                </div>
                <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">Decommissioning your account is permanent. All automation nodes, credit balances, and historical application data will be purged from our servers within 72 hours.</p>
                <button className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95">
                    Confirm Deletion
                </button>
            </SettingsCard>
        </SettingsSection>
    );

    const renderAutomation = () => (
        <SettingsSection title="Automation Preferences" description="Fine-tune the behavior of your job-seeking algorithms.">
            <SettingsCard>
                <SettingsRow
                    icon={Zap}
                    label="Master Agent Switch"
                    description="Enable or disable all background search and application threads instantly."
                >
                    <Toggle enabled={autoApply} onChange={setAutoApply} />
                </SettingsRow>

                <div className="py-8 border-b border-white/5 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-200">Daily Submission Threshold</p>
                                <p className="text-xs text-gray-500 font-medium">Auto-pause once this limit is reached in 24h</p>
                            </div>
                            <span className="text-xl font-black text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]">25</span>
                        </div>
                        <div className="relative pt-2">
                            <input
                                type="range"
                                min="1"
                                max="100"
                                defaultValue="25"
                                className="w-full accent-green-500 h-2 bg-gray-900 rounded-full appearance-none cursor-pointer border border-white/5 active:scale-x-[1.01] transition-transform"
                            />
                            <div className="flex justify-between mt-3 px-1">
                                <span className="text-[10px] font-black text-gray-700">1 SUB</span>
                                <span className="text-[10px] font-black text-gray-700">100 SUBS</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-200">Algorithmic Delay</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-0.5">Mimic human behavior</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['FAST', 'STEADY', 'HUMAN'].map((mode) => (
                                <button
                                    key={mode}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${mode === 'STEADY'
                                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-gray-900 text-gray-600 hover:text-gray-300'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <SettingsRow
                    icon={ArrowRight}
                    label="Auto-Bookmark Intelligence"
                    description="Automatically archive all relevant job findings to your 'Saved Jobs' index."
                >
                    <Toggle enabled={true} onChange={() => { }} />
                </SettingsRow>

                <SettingsRow
                    icon={Info}
                    label="Ignore Low Match Scores"
                    description="Filter out jobs where our AI predicts less than a 75% application relevancy."
                >
                    <Toggle enabled={true} onChange={() => { }} />
                </SettingsRow>

                <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-8 py-3 bg-green-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-green-400 transition-all shadow-xl">
                        Update Logic
                    </button>
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderIntegrations = () => (
        <SettingsSection title="System Integrations" description="Connect your communication channels and external nodes.">
            <SettingsCard title="Authorized Pipelines" icon={LinkIcon}>
                <div className="flex items-center justify-between p-6 bg-[#070c0b] rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/[0.02] group-hover:bg-red-500/[0.04] transition-all" />
                    <div className="flex items-center gap-6 relative">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl border border-red-500/20">
                            <Mail size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white tracking-tight">Google Workspace</p>
                            <p className="text-xs text-gray-500 font-medium">{user?.gmailEmail || "Not authenticated"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        {user?.gmailEmail ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active Sink</span>
                                </div>
                                <button className="w-10 h-10 flex items-center justify-center bg-gray-900 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all shadow-lg"><RefreshCw size={16} /></button>
                                <button className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"><X size={16} /></button>
                            </>
                        ) : (
                            <button
                                onClick={() => window.location.href = `${API_BASE_URL}/auth/gmail/connect`}
                                className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all shadow-xl active:scale-95"
                            >
                                Connect Sink
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-12 space-y-6">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Proposed Pipelines</p>
                    {[
                        { name: "LinkedIn API v2", icon: Tally5, color: "blue" },
                        { name: "Slack Notifications", icon: MessageSquare, color: "purple" },
                        { name: "Calendly Node", icon: Clock, color: "blue" },
                        { name: "Discord Webhook", icon: Activity, color: "indigo" },
                    ].map((app, i) => (
                        <div key={i} className="flex items-center justify-between p-5 border border-white/5 rounded-2xl opacity-40 grayscale cursor-not-allowed hover:opacity-50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-[1rem] bg-gray-800 flex items-center justify-center text-gray-500`}>
                                    <app.icon size={20} />
                                </div>
                                <p className="text-sm font-bold text-gray-500 tracking-tight">{app.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest border border-white/5 px-2.5 py-1 rounded-lg">Waitlist</span>
                                <ArrowRight size={14} className="text-gray-800" />
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderBilling = () => (
        <SettingsSection title="Billing & Credits" description="Manage your computational resources and subscription tier.">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <SettingsCard className="lg:col-span-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Current Tier</p>
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Enterprise Elite</h3>
                        </div>
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                            <CreditCard size={32} />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Compute Credits</p>
                                <p className="text-2xl font-black text-white">{credits.toLocaleString()} <span className="text-sm text-gray-600 font-medium">/ 5,000 UNITs</span></p>
                            </div>
                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 shadow-inner">Health: 98%</span>
                        </div>
                        <div className="w-full h-3 bg-[#070c0b] rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                                style={{ width: `${(credits / 5000) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-gray-600" />
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Auto-Renewal in 16 days</p>
                            </div>
                            <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-widest">Update Plan</button>
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard className="bg-green-500/5 border-green-500/10 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-green-500/50 uppercase tracking-[0.3em] mb-2">Automation ROI</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter mb-2">$1,240<span className="text-sm text-gray-600">.00</span></h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">Estimated market value of time saved by autonomous application threads this month.</p>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5">
                        <button className="w-full py-3.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-green-500 hover:text-black transition-all shadow-lg active:scale-95">
                            Download Report
                        </button>
                    </div>
                </SettingsCard>
            </div>

            <SettingsCard title="Financial Settlement" icon={FileText}>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#070c0b] rounded-3xl border border-white/5 shadow-2xl group hover:border-green-500/20 transition-all">
                        <div className="flex items-center gap-6 mb-4 sm:mb-0">
                            <div className="w-14 h-10 bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/10 blur-xl" />
                                <span className="text-[10px] font-black text-white tracking-widest">VISA</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-200 tracking-tight">•••• •••• •••• 4242</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-0.5">Primary Card • Exp 12/26</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">Edit Card</button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6 ml-1">Ledger History</h4>
                        <div className="space-y-3">
                            {[
                                { id: "TX-4820", date: "Dec 15, 2025", tier: "Elite", amount: "$49.00", status: "Success" },
                                { id: "TX-3195", date: "Nov 15, 2025", tier: "Elite", amount: "$49.00", status: "Success" },
                            ].map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-transparent hover:border-white/5 transition-all text-sm group">
                                    <div className="flex items-center gap-8">
                                        <span className="text-gray-500 font-mono text-[10px]">{tx.id}</span>
                                        <span className="text-gray-300 font-bold hidden sm:block">{tx.date}</span>
                                        <span className="text-gray-500 font-medium">Plan: {tx.tier}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-white font-black">{tx.amount}</span>
                                        <button className="p-2 text-gray-700 hover:text-white transition-all"><FileText size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderNotifications = () => (
        <SettingsSection title="Notification Nodes" description="Configure your real-time alert architecture.">
            <SettingsCard title="Infrastructure Events" icon={Bell}>
                <div className="space-y-4">
                    <SettingsRow
                        label="Job Discovery"
                        description="Trigger alert when our agent detects a high-value job match."
                        icon={Search}
                    >
                        <Toggle enabled={notifications.jobFound} onChange={(v) => setNotifications({ ...notifications, jobFound: v })} />
                    </SettingsRow>
                    <SettingsRow
                        label="Submisssion Success"
                        description="Operational confirmation for every successful application."
                    >
                        <Toggle enabled={notifications.applySuccess} onChange={(v) => setNotifications({ ...notifications, applySuccess: v })} />
                    </SettingsRow>
                    <SettingsRow
                        label="System Failure / Action Required"
                        description="Urgent notifications if an automation thread crashes or requires manual captcha."
                        danger
                    >
                        <Toggle enabled={true} onChange={() => { }} disabled />
                    </SettingsRow>
                </div>
            </SettingsCard>

            <SettingsCard title="Delivery Channels" icon={Mail} className="mt-8">
                <SettingsRow label="Electronic Mail (SMTP)" description="Deliver reports to your synchronized Gmail address.">
                    <Toggle enabled={true} onChange={() => { }} />
                </SettingsRow>
                <SettingsRow label="Browser Persistent Layer" description="Enable desktop push notifications (Web Standard).">
                    <Toggle enabled={false} onChange={() => { }} />
                </SettingsRow>
                <SettingsRow label="In-App Toast Overlay" description="Display contextual micro-alerts within the dashboard.">
                    <Toggle enabled={true} onChange={() => { }} />
                </SettingsRow>
            </SettingsCard>
        </SettingsSection>
    );

    const renderSupport = () => (
        <SettingsSection title="Intelligence Ops & Support" description="Access our specialized response team and documentation.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button className="flex flex-col items-center text-center p-12 bg-[#0e1614] border border-white/5 rounded-[2.5rem] shadow-2xl hover:border-green-500/30 transition-all group relative overflow-hidden active:scale-[0.98]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-20 h-20 rounded-[1.5rem] bg-green-500/10 flex items-center justify-center text-green-400 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-green-500/20">
                        <MessageSquare size={36} />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-2 uppercase">L1 Support Chat</h3>
                    <p className="text-sm text-gray-500 font-medium">Avg. response 8.5m</p>
                </button>

                <button className="flex flex-col items-center text-center p-12 bg-[#0e1614] border border-white/5 rounded-[2.5rem] shadow-2xl hover:border-blue-500/30 transition-all group relative overflow-hidden active:scale-[0.98]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-20 h-20 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-400 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-blue-500/20">
                        <FileText size={36} />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-2 uppercase">Core Wiki</h3>
                    <p className="text-sm text-gray-500 font-medium">84 Articles</p>
                </button>
            </div>

            <div className="mt-8 space-y-3">
                {[
                    { label: "Community Command Center", icon: Globe, action: "Join Forum" },
                    { label: "Submit Intelligence Bug", icon: Bug, action: "Open Ticket" },
                    { label: "Logical Frameworks (FAQ)", icon: Info, action: "View" },
                    { label: "End-User License Agreement", icon: ShieldAlert, action: "Read" },
                    { label: "Data Architecture Privacy", icon: Lock, action: "Read" },
                ].map((item, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-6 bg-[#0e1614] border border-white/5 rounded-3xl hover:bg-[#15201d] transition-all group shadow-xl">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-gray-600 group-hover:text-green-400 transition-all shadow-inner">
                                <item.icon size={22} />
                            </div>
                            <span className="font-black text-gray-300 group-hover:text-white uppercase tracking-widest text-xs">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest hidden sm:block">{item.action}</span>
                            <ExternalLink size={16} className="text-gray-700 group-hover:text-gray-400 move-up-right transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
        </SettingsSection>
    );

    const renderAdvanced = () => (
        <SettingsSection title="Advanced Diagnostics" description="Specialized controls for power users and developers.">
            <SettingsCard title="System Kernel" icon={Code}>
                <div className="space-y-6">
                    <SettingsRow
                        label="Verbose Telemetry"
                        description="Mirror all backend API logs to your browser console for debugging."
                        icon={Activity}
                    >
                        <Toggle enabled={false} onChange={() => { }} />
                    </SettingsRow>

                    <div className="p-6 bg-[#000d07] rounded-3xl border border-green-500/10 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/[0.03] blur-2xl" />
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">Node Status</p>
                            <span className="flex items-center gap-2 text-[10px] text-green-500 font-black shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" /> KERNEL ONLINE
                            </span>
                        </div>
                        <div className="text-[11px] text-gray-400 space-y-2 font-mono leading-relaxed lining-nums">
                            <p className="flex justify-between border-b border-white/[0.03] pb-1"><span className="text-gray-600">CORE_VERSION</span> <span className="text-white font-bold">2.4.92-STABLE</span></p>
                            <p className="flex justify-between border-b border-white/[0.03] pb-1"><span className="text-gray-600">SESSION_ID</span> <span className="text-white font-bold">{Math.random().toString(36).substring(7).toUpperCase()}</span></p>
                            <p className="flex justify-between border-b border-white/[0.03] pb-1"><span className="text-gray-600">AUTH_STRAT</span> <span className="text-green-500 font-bold uppercase tracking-widest">JWT-HMAC-256</span></p>
                            <p className="flex justify-between"><span className="text-gray-600">UPTIME</span> <span className="text-white font-bold">142h 12m 04s</span></p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <button className="w-full flex items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-3xl hover:bg-red-500 hover:text-white transition-all group shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-500/5 group-hover:opacity-0 transition-opacity" />
                            <div className="flex items-center gap-6 relative">
                                <RefreshCw size={24} className="text-red-400 group-hover:text-white group-hover:rotate-180 transition-all duration-700" />
                                <div className="text-left">
                                    <p className="font-black text-red-400 group-hover:text-white uppercase tracking-widest text-xs">Purge Local cache</p>
                                    <p className="text-[10px] text-red-500/60 group-hover:text-white/60 font-medium">Reset your interface preferences without affecting server data.</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-red-900 group-hover:text-white relative" />
                        </button>

                        <button className="w-full flex items-center justify-between p-6 bg-gray-900/40 border border-white/5 rounded-3xl hover:bg-white/5 transition-all group shadow-xl grayscale hover:grayscale-0">
                            <div className="flex items-center gap-6">
                                <Eye size={24} className="text-gray-600 group-hover:text-white transition-colors" />
                                <div className="text-left">
                                    <p className="font-black text-gray-400 group-hover:text-white uppercase tracking-widest text-xs">Alpha Features</p>
                                    <p className="text-[10px] text-gray-700 font-medium">Enable experimental autonomous workflows.</p>
                                </div>
                            </div>
                            <span className="text-[8px] font-black text-white bg-indigo-500 px-2 py-1 rounded shadow-lg shadow-indigo-500/20">LOCKED</span>
                        </button>
                    </div>
                </div>
            </SettingsCard>
        </SettingsSection>
    );

    const renderContent = () => {
        switch (activeCategory) {
            case "account": return renderAccount();
            case "security": return renderSecurity();
            case "automation": return renderAutomation();
            case "integrations": return renderIntegrations();
            case "billing": return renderBilling();
            case "notifications": return renderNotifications();
            case "support": return renderSupport();
            case "advanced": return renderAdvanced();
            default: return renderAccount();
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a110a] text-gray-200 font-['Outfit'] selection:bg-green-500 selection:text-black">
            <UserNavbar onSidebarToggle={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} onSelectSearch={() => { }} />

            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md" onClick={toggleSidebar} />
            )}

            {/* Persistent Save Toast */}
            {saveStatus === 'saved' && (
                <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-[#0e1614] border border-green-500/30 rounded-2xl px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-black">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-widest">Settings Synchronized</p>
                            <p className="text-gray-500 text-xs font-medium">All local and cloud parameters updated.</p>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 pt-28 pb-20">

                {/* Header (Optional, port from Profile) */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter shadow-green-500/5 drop-shadow-2xl">
                            Control Center<span className="text-green-500">.</span>
                        </h1>
                        <p className="text-gray-600 font-bold uppercase tracking-[0.4em] text-[10px]">Autonomous Environment Configuration</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/pages/userpanel"
                            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                        >
                            Return to Bridge
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 min-h-[800px]">

                    {/* --- SETTINGS SIDEBAR --- */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="sticky top-28 space-y-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-300 group relative overflow-hidden ${activeCategory === cat.id
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_15px_30px_rgba(0,0,0,0.3)]'
                                            : 'text-gray-600 hover:bg-white/[0.03] hover:text-gray-300 border border-transparent'
                                        }`}
                                >
                                    {activeCategory === cat.id && (
                                        <div className="absolute left-0 top-0 w-1.5 h-full bg-green-500 shadow-[2px_0_15px_rgba(34,197,94,0.4)]" />
                                    )}
                                    <cat.icon size={20} className={`${activeCategory === cat.id ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-gray-700 group-hover:text-gray-400'} transition-all duration-300`} />
                                    <span className={`text-sm tracking-tight ${activeCategory === cat.id ? 'font-black uppercase tracking-widest' : 'font-bold'}`}>{cat.label}</span>
                                    {activeCategory === cat.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                                </button>
                            ))}

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="bg-[#0e1614] rounded-3xl p-6 border border-white/5 shadow-inner">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">System Load</p>
                                    <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                                        <div className="w-[12%] h-full bg-green-500 animate-pulse transition-all duration-1000" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CONTENT AREA --- */}
                    <div className="flex-1 lg:max-w-4xl">
                        <div className="pb-20">
                            {renderContent()}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-20 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
                        &copy; {new Date().getFullYear()} JobScraper AI &mdash; Advanced Agency Access v2.4
                    </p>
                    <div className="flex gap-8">
                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">End-to-End Encrypted</span>
                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">PCI-DSS Compliant</span>
                    </div>
                </div>
            </main>

            {/* Hide scrollbar styles */}
            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-bottom { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .move-up-right:hover { transform: translate(2px, -2px); }
      `}</style>
        </div>
    );
}

// Mock Search icon for notifications
const Search = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);
