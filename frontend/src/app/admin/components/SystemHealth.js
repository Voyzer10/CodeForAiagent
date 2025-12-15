"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import { Activity, Server, Database, Clock } from 'lucide-react';

export default function SystemHealth() {
    const [health, setHealth] = useState(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await apiFetch('/admin/health');
                setHealth(data);
            } catch (err) {
                console.error("Health fetch failed", err);
            }
        };
        fetchHealth();
        const interval = setInterval(fetchHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!health) return <div className="p-6 bg-white rounded-xl border shadow-sm animate-pulse h-32 flex items-center justify-center text-gray-400">Loading System Health...</div>;

    const StatusBadge = ({ label, status, icon: Icon }) => {
        const isGood = status === 'Online' || status === 'Connected' || status === 'Healthy';
        const color = isGood ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200';
        return (
            <div className={`flex flex-col items-center p-4 rounded-xl border ${color} shadow-sm transition-all duration-300`}>
                {Icon && <Icon size={20} className="mb-2 opacity-80" />}
                <span className="text-xs uppercase font-bold tracking-wider opacity-70">{label}</span>
                <span className="mt-1 text-base font-extrabold">{status}</span>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="text-blue-500" />
                    System Health Overview
                </h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                    Updated: {new Date(health.timestamp).toLocaleTimeString()}
                </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusBadge label="Server Status" status={health.serverStatus} icon={Server} />
                <StatusBadge label="API Gateway" status={health.apiStatus} icon={Activity} />
                <StatusBadge label="Database" status={health.dbStatus} icon={Database} />
                <div className="col-span-1 flex flex-col items-center p-4 rounded-xl border bg-gray-50 border-gray-200 shadow-sm text-gray-700">
                    <Clock size={20} className="mb-2 text-gray-500" />
                    <span className="text-xs uppercase font-bold tracking-wider text-gray-500">Uptime</span>
                    <span className="mt-1 text-base font-extrabold font-mono">{health.uptime}</span>
                </div>
            </div>
        </div>
    );
}
