"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import { Shield, Lock, MapPin, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function SecurityWidget() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newIP, setNewIP] = useState("");
    const [activeTab, setActiveTab] = useState('history'); // history | whitelist | blacklist

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/admin/security');
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleUpdateIP = async (type, action, ip) => {
        try {
            await apiFetch('/admin/security', {
                method: 'POST',
                body: JSON.stringify({ type, action, ip })
            });
            fetchStats();
            setNewIP("");
        } catch (err) {
            alert("Failed to update security settings");
        }
    };

    const toggleWhitelistEnforcement = async (currentVal) => {
        try {
            await apiFetch('/admin/security', {
                method: 'POST',
                body: JSON.stringify({ settings: { restrictToWhitelist: !currentVal } })
            });
            fetchStats();
        } catch (err) {
            console.error(err);
        }
    }

    if (!stats && loading) return <div className="h-64 bg-white rounded-xl border shadow-sm animate-pulse m-4"></div>;
    if (!stats) return null;

    return (
        <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="text-emerald-600" size={18} />
                    Security & Access
                </h2>
                <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                    >Login History</button>
                    <button
                        onClick={() => setActiveTab('whitelist')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'whitelist' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
                    >Whitelist</button>
                    <button
                        onClick={() => setActiveTab('blacklist')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'blacklist' ? 'bg-red-100 text-red-700' : 'text-gray-500'}`}
                    >Blacklist</button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 overflow-auto min-h-[300px]">

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                    <table className="w-full text-xs text-left">
                        <thead className="text-gray-400 font-medium uppercase border-b">
                            <tr>
                                <th className="py-2">Time</th>
                                <th className="py-2">IP Addr</th>
                                <th className="py-2">Device</th>
                                <th className="py-2 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {stats.loginHistory.map((log, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="py-2 text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="py-2 font-mono text-gray-700">{log.ip}</td>
                                    <td className="py-2 text-gray-500 truncate max-w-[100px]" title={log.device}>{log.device?.split('/')[0]}</td>
                                    <td className="py-2 text-right">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {stats.loginHistory.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-gray-400">No login history available.</td></tr>}
                        </tbody>
                    </table>
                )}

                {/* WHITELIST TAB */}
                {activeTab === 'whitelist' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Lock size={16} className="text-blue-600" />
                                <span className="text-sm font-semibold text-blue-900">Enforce Whitelist Only</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={stats.securitySettings.restrictToWhitelist} onChange={() => toggleWhitelistEnforcement(stats.securitySettings.restrictToWhitelist)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newIP}
                                onChange={(e) => setNewIP(e.target.value)}
                                placeholder="Enter IP Address (e.g. 192.168.1.1)"
                                className="flex-1 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button
                                onClick={() => handleUpdateIP('whitelist', 'add', newIP)}
                                disabled={!newIP}
                                className="bg-green-600 text-white px-3 rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <ul className="space-y-2">
                            {stats.whitelistedIPs.map(ip => (
                                <li key={ip} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-green-600" />
                                        <span className="text-sm font-mono font-medium">{ip}</span>
                                    </div>
                                    <button onClick={() => handleUpdateIP('whitelist', 'remove', ip)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                            {stats.whitelistedIPs.length === 0 && <p className="text-xs text-center text-gray-400 italic mt-4">No IPs whitelisted.</p>}
                        </ul>
                    </div>
                )}

                {/* BLACKLIST TAB */}
                {activeTab === 'blacklist' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 flex gap-2">
                            <AlertCircle size={16} />
                            Blocked IPs will be instantly rejected during login.
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newIP}
                                onChange={(e) => setNewIP(e.target.value)}
                                placeholder="Enter IP to Block"
                                className="flex-1 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-red-400"
                            />
                            <button
                                onClick={() => handleUpdateIP('blacklist', 'add', newIP)}
                                disabled={!newIP}
                                className="bg-red-600 text-white px-3 rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <ul className="space-y-2">
                            {stats.blockedIPs.map(ip => (
                                <li key={ip} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-red-600" />
                                        <span className="text-sm font-mono font-medium">{ip}</span>
                                    </div>
                                    <button onClick={() => handleUpdateIP('blacklist', 'remove', ip)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                            {stats.blockedIPs.length === 0 && <p className="text-xs text-center text-gray-400 italic mt-4">No IPs blocked.</p>}
                        </ul>
                    </div>
                )}

            </div>
        </div>
    );
}
