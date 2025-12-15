"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import { Cpu, HardDrive, Wifi } from 'lucide-react';

export default function ResourceMonitor() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiFetch('/admin/resources');
                setStats(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!stats) return <div className="p-6 bg-white rounded-xl border shadow-sm animate-pulse h-64 flex items-center justify-center text-gray-400">Loading Resources...</div>;

    const ProgressBar = ({ label, percent, value, colorClass = "bg-blue-600" }) => (
        <div className="mb-5">
            <div className="flex justify-between mb-1.5 align-bottom">
                <span className="text-sm font-semibold text-gray-600">{label}</span>
                <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">{value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorClass}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                ></div>
            </div>
        </div>
    );

    const cpuColor = stats.cpu.usage > 80 ? 'bg-red-500' : stats.cpu.usage > 50 ? 'bg-yellow-500' : 'bg-blue-500';
    const memColor = stats.memory.percentage > 85 ? 'bg-red-500' : stats.memory.percentage > 60 ? 'bg-purple-500' : 'bg-purple-400';

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Cpu className="text-purple-500" />
                Server Resources
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* CPU & Memory */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Computation</h3>
                    <ProgressBar
                        label={`CPU Usage (${stats.cpu.cores} Cores)`}
                        percent={stats.cpu.usage}
                        value={`${stats.cpu.usage}%`}
                        colorClass={cpuColor}
                    />
                    <ProgressBar
                        label="RAM Usage"
                        percent={stats.memory.percentage}
                        value={`${stats.memory.used} / ${stats.memory.total}`}
                        colorClass={memColor}
                    />
                </div>

                {/* Disk & Network */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Storage & I/O</h3>
                    {stats.disk && stats.disk[0] ? (
                        <ProgressBar
                            label={`Disk (${stats.disk[0].fs})`}
                            percent={stats.disk[0].percent}
                            value={`${stats.disk[0].used} / ${stats.disk[0].size}`}
                            colorClass="bg-emerald-500"
                        />
                    ) : (
                        <div className="text-sm text-gray-400 italic">Disk info unavailable</div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-col items-center">
                            <span className="text-xs text-blue-400 font-semibold uppercase mb-1 flex items-center gap-1">
                                <Wifi size={12} /> Down
                            </span>
                            <span className="text-lg font-bold text-blue-700">{stats.network[0]?.rx || "0 KB/s"}</span>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex flex-col items-center">
                            <span className="text-xs text-green-500 font-semibold uppercase mb-1 flex items-center gap-1">
                                <Wifi size={12} className="rotate-180" /> Up
                            </span>
                            <span className="text-lg font-bold text-green-700">{stats.network[0]?.tx || "0 KB/s"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
