"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import { ScrollText, AlertTriangle } from 'lucide-react';

export default function LogsWidget() {
    const [logs, setLogs] = useState([]);
    const [type, setType] = useState('info'); // 'info' or 'error'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const endpoint = type === 'info' ? '/logs/logs' : '/logs/error-logs';
                const data = await apiFetch(endpoint);
                if (data.logs) {
                    // Split by newline, filter empty, reverse to show latest first, take top 20
                    const lines = data.logs.split('\n').filter(Boolean).reverse().slice(0, 20);
                    setLogs(lines);
                }
            } catch (err) {
                console.error("Logs fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [type]);

    return (
        <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    {type === 'error' ? <AlertTriangle className="text-red-500" size={18} /> : <ScrollText className="text-blue-500" size={18} />}
                    {type === 'error' ? 'Recent Error Logs' : 'Live System Logs'}
                </h2>
                <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                    <button
                        onClick={() => setType('info')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${type === 'info' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        System
                    </button>
                    <button
                        onClick={() => setType('error')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${type === 'error' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Errors
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#0d1117] p-4 min-h-[250px] max-h-[300px]">
                {loading && logs.length === 0 ? (
                    <div className="text-gray-500 text-xs animate-pulse">Fetching logs...</div>
                ) : logs.length > 0 ? (
                    <div className="space-y-1">
                        {logs.map((line, i) => {
                            // Highlight logical parts (Timestamps in brackets)
                            const timestampMatch = line.match(/^\[(.*?)\]/);
                            const timestamp = timestampMatch ? timestampMatch[0] : "";
                            const message = timestampMatch ? line.replace(timestamp, "") : line;

                            return (
                                <div key={i} className="text-xs font-mono font-medium border-b border-gray-800/50 pb-1 last:border-0 hover:bg-[#161b22] px-2 rounded -mx-2 transition-colors">
                                    <span className={type === 'error' ? "text-red-400/70" : "text-blue-400/70"}>{timestamp}</span>
                                    <span className={type === 'error' ? "text-red-200" : "text-gray-300"}>{message}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-gray-500 italic text-xs text-center mt-10">No recent logs found.</div>
                )}
            </div>
        </div>
    );
}
