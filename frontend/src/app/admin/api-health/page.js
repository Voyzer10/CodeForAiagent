"use client";
import { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Server
} from "lucide-react";

/**
 * Use environment variable for API URL or fallback to the known production domain.
 * This ensures the health check works in both local dev (if env set) and prod.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://techm.work.gd";

const API_ENDPOINTS = [
    { name: "Backend Root", url: `${BASE_URL}/api`, category: "Core" },
    { name: "Auth Service", url: `${BASE_URL}/api/auth`, category: "Auth" },
    { name: "User Jobs", url: `${BASE_URL}/api/userjobs`, category: "User" },
    { name: "Admin Service", url: `${BASE_URL}/api/admin`, category: "Admin" },
    { name: "Payment Gateway", url: `${BASE_URL}/api/payment`, category: "Finance" },
    { name: "Logs Service", url: `${BASE_URL}/api/logs`, category: "System" },
    { name: "Credits System", url: `${BASE_URL}/api/credits`, category: "Finance" },
    { name: "Progress Tracker", url: `${BASE_URL}/api/progress`, category: "System" },
    { name: "N8N Callback", url: `${BASE_URL}/api/n8n-callback`, category: "Integration" },
];

export default function ApiHealthPage() {
    const [statuses, setStatuses] = useState({});
    const [loading, setLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);
    const [filter, setFilter] = useState("all");

    const checkHealth = async () => {
        setLoading(true);
        const newStatuses = {};
        const timestamp = new Date();

        const checkPromises = API_ENDPOINTS.map(async (api) => {
            const start = performance.now();
            try {
                // We use GET. Even 401/404 means the server responded (Alive).
                // Only connection refused or timeout means Error.
                const res = await fetch(api.url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // Add a dummy token or rely on public access for reachability check 
                        // checks need not be authenticated to prove server is UP, just that it RESPONDS.
                    }
                });

                const end = performance.now();
                const latency = Math.round(end - start);

                // Determine status
                // 200-299: Healthy
                // 401/403: Healthy (Service protected but alive)
                // 404: Healthy (Service running but route not found - implies server is up)
                // 500+: Error
                let status = "healthy";
                let message = "Operational";

                if (res.status >= 500) {
                    status = "error";
                    message = "Server Error";
                } else if (latency > 1500) {
                    status = "slow";
                    message = "High Latency";
                } else if (res.status === 401 || res.status === 403) {
                    status = "healthy";
                    message = "Protected (Active)";
                } else if (res.status === 404) {
                    status = "healthy";
                    message = "Active (No Index)";
                }

                newStatuses[api.url] = {
                    status,
                    code: res.status,
                    latency,
                    message: res.statusText ? res.statusText : message,
                };
            } catch (error) {
                newStatuses[api.url] = {
                    status: "error",
                    code: 0,
                    latency: 0,
                    message: "Unreachable",
                };
            }
        });

        await Promise.all(checkPromises);
        setStatuses(newStatuses);
        setLastChecked(timestamp);
        setLoading(false);
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "healthy": return "text-green-600 bg-green-50 border-green-200";
            case "slow": return "text-amber-600 bg-amber-50 border-amber-200";
            case "error": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-slate-400 bg-slate-50 border-slate-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "healthy": return <CheckCircle className="h-5 w-5" />;
            case "slow": return <AlertTriangle className="h-5 w-5" />;
            case "error": return <XCircle className="h-5 w-5" />;
            default: return <Server className="h-5 w-5" />;
        }
    };

    const filteredApis = API_ENDPOINTS.filter(api => {
        if (filter === "all") return true;
        if (filter === "healthy") return statuses[api.url]?.status === "healthy";
        if (filter === "issues") return statuses[api.url]?.status === "error" || statuses[api.url]?.status === "slow";
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">API Health Monitor</h1>
                    <p className="text-slate-500">Real-time status of all system endpoints</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                        Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : "Never"}
                    </span>
                    <button
                        onClick={checkHealth}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
                {["all", "healthy", "issues"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${filter === f
                                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApis.map((api, idx) => {
                    const status = statuses[api.url] || { status: "pending" };
                    const colorClass = getStatusColor(status.status);

                    return (
                        <div
                            key={idx}
                            className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${status.status === 'error' ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-20`}>
                                        {getStatusIcon(status.status)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-sm md:text-base">{api.name}</h3>
                                        <span className="text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
                                            {api.category}
                                        </span>
                                    </div>
                                </div>
                                {status.latency > 0 && (
                                    <span className={`text-xs font-mono px-2 py-1 rounded border ${status.latency < 200 ? "bg-green-50 text-green-700 border-green-100" :
                                            status.latency < 1000 ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                "bg-red-50 text-red-700 border-red-100"
                                        }`}>
                                        {status.latency}ms
                                    </span>
                                )}
                            </div>

                            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Status</span>
                                    <span className={`font-medium ${status.status === 'healthy' ? 'text-green-600' :
                                            status.status === 'error' ? 'text-red-600' :
                                                status.status === 'slow' ? 'text-amber-600' : 'text-slate-600'
                                        }`}>
                                        {status.status === 'pending' ? 'Checking...' : status.message}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Code</span>
                                    <span className={`font-mono ${status.code >= 500 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                                        {status.code || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
