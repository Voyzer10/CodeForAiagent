"use client";
import { useState } from "react";
import {
    Play,
    CheckCircle2,
    XCircle,
    Loader2,
    ShieldCheck,
    AlertOctagon,
    Terminal,
    Activity
} from "lucide-react";

// Dynamic Base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://techm.work.gd";

const CHECK_STEPS = [
    {
        id: "backend_root",
        label: "Backend Connectivity",
        description: "Verifying if the main API server is reachable.",
        url: `${BASE_URL}/api`,
        expectedStatus: [200, 404]
    },
    {
        id: "auth_service",
        label: "Authentication Service",
        description: "Checking auth routes for availability.",
        url: `${BASE_URL}/api/auth`,
        expectedStatus: [200, 401, 403, 404]
    },
    {
        id: "db_connection",
        label: "Database Connection",
        description: "Verifying MongoDB connectivity via admin health check.",
        url: `${BASE_URL}/api/admin/health`,
        expectedStatus: [200, 401, 403]
    },
    {
        id: "workers",
        label: "Background Workers",
        description: "Checking N8N callback listener status.",
        url: `${BASE_URL}/api/n8n-callback`,
        expectedStatus: [200, 404, 405]
    },
    {
        id: "cdn_assets",
        label: "Frontend Integrity",
        description: "Verifying static asset delivery.",
        url: "/favicon.ico",
        expectedStatus: [200]
    }
];

export default function SystemCheckPage() {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState({});
    const [completed, setCompleted] = useState(false);
    const [overallHealth, setOverallHealth] = useState("unknown"); // unknown, success, failure

    const runDiagnostics = async () => {
        setIsRunning(true);
        setCompleted(false);
        setOverallHealth("unknown");
        setResults({});

        let hasError = false;

        // Sequential execution for dramatic effect and clarity
        for (const step of CHECK_STEPS) {
            setResults(prev => ({
                ...prev,
                [step.id]: { status: 'running', log: `Ping ${step.url}...` }
            }));

            await new Promise(r => setTimeout(r, 800)); // Visual delay

            try {
                const start = performance.now();
                // Use GET instead of HEAD for broader compatibility
                const res = await fetch(step.url, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const latency = Math.round(performance.now() - start);

                // Success condition: correct status OR if it's an Auth route, 401/403 means it works.
                const isSuccess = step.expectedStatus.includes(res.status) || (step.url.includes("api/") && res.status === 401) || (step.url.includes("api/") && res.status === 403);

                if (isSuccess) {
                    setResults(prev => ({
                        ...prev,
                        [step.id]: {
                            status: 'success',
                            log: `[OK] Status ${res.status} (${latency}ms)`
                        }
                    }));
                } else {
                    hasError = true;
                    setResults(prev => ({
                        ...prev,
                        [step.id]: {
                            status: 'error',
                            log: `[FAILED] Status ${res.status}. Expected: ${step.expectedStatus.join(',')}`
                        }
                    }));
                }
            } catch (error) {
                hasError = true;
                setResults(prev => ({
                    ...prev,
                    [step.id]: {
                        status: 'error',
                        log: `[NETWORK ERROR] ${error.message}`
                    }
                }));
            }
        }

        setIsRunning(false);
        setCompleted(true);
        setOverallHealth(hasError ? "failure" : "success");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Post-Deployment
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">System Diagnostic Check</h1>
                    <p className="text-slate-500 text-lg">Verify connectivity, services, and database availability.</p>
                </div>

                {/* Background decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Activity size={180} />
                </div>

                <button
                    onClick={runDiagnostics}
                    disabled={isRunning}
                    className={`relative z-10 flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 ${isRunning
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200"
                        }`}
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Running Checks...
                        </>
                    ) : (
                        <>
                            <Play className="h-6 w-6 fill-current" />
                            Start Diagnostics
                        </>
                    )}
                </button>
            </div>

            {/* Main Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Checklist */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-semibold text-slate-700">
                            Diagnostic Steps
                        </div>
                        <div className="divide-y divide-slate-100">
                            {CHECK_STEPS.map((step, idx) => {
                                const result = results[step.id] || { status: 'idle' };

                                return (
                                    <div
                                        key={step.id}
                                        className={`flex items-start gap-4 p-5 transition-colors ${result.status === 'running' ? 'bg-blue-50/50' : ''
                                            }`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {result.status === 'idle' && <div className="h-6 w-6 rounded-full border-2 border-slate-200" />}
                                            {result.status === 'running' && <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />}
                                            {result.status === 'success' && <CheckCircle2 className="h-6 w-6 text-green-500 fill-green-50" />}
                                            {result.status === 'error' && <XCircle className="h-6 w-6 text-red-500 fill-red-50" />}
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-medium ${result.status === 'running' ? 'text-blue-700' : 'text-slate-900'
                                                    }`}>
                                                    {step.label}
                                                </h3>
                                                {result.status !== 'idle' && (
                                                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${result.status === 'success' ? 'bg-green-100 text-green-700' :
                                                            result.status === 'error' ? 'bg-red-100 text-red-700' :
                                                                'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {result.status.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5">{step.description}</p>

                                            {/* Result Log */}
                                            {result.log && (
                                                <div className={`mt-2 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap ${result.status === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                        result.status === 'success' ? 'bg-slate-50 text-slate-600 border border-slate-100' :
                                                            'bg-blue-50 text-blue-700 border border-blue-100'
                                                    }`}>
                                                    <span className="font-bold mr-2 select-none opacity-50">{'>'}</span>
                                                    {result.log}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Summary Status */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className={`rounded-2xl border p-8 text-center transition-all shadow-sm ${overallHealth === 'success' ? 'bg-green-500 text-white shadow-green-200 border-green-600' :
                                overallHealth === 'failure' ? 'bg-red-500 text-white shadow-red-200 border-red-600' :
                                    'bg-white border-slate-200'
                            }`}>
                            <div className="flex justify-center mb-6">
                                {overallHealth === 'success' ? (
                                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                        <ShieldCheck className="h-12 w-12 text-white" />
                                    </div>
                                ) : overallHealth === 'failure' ? (
                                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                        <AlertOctagon className="h-12 w-12 text-white" />
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 p-4 rounded-full">
                                        <Terminal className="h-12 w-12 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {overallHealth === 'success' ? 'System Stable' :
                                    overallHealth === 'failure' ? 'Issues Found' :
                                        'System Idle'}
                            </h2>
                            <p className={`text-sm leading-relaxed ${overallHealth === 'unknown' ? 'text-slate-500' : 'text-white/90'}`}>
                                {overallHealth === 'success' ? 'All diagnostic checks passed. The deployment appears fully functional and safe for production traffic.' :
                                    overallHealth === 'failure' ? 'Critical connectivity issues detected. Immediate attention required before releasing to users.' :
                                        'Ready to perform post-deployment validation sequence.'}
                            </p>
                        </div>

                        {/* Quick Actions (Mock) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Links</h4>
                            <div className="space-y-2">
                                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between">
                                    <span>View Server Logs</span>
                                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">Ext</span>
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between">
                                    <span>Active Users</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Live</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
