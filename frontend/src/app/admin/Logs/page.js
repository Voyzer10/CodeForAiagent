"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "../../pages/userpanel/Sidebar";
import UserNavbar from "../../pages/userpanel/Navbar";
import { Loader2, RefreshCw, FileText, AlertTriangle } from "lucide-react";

export default function LogsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState("");
  const [errorLogs, setErrorLogs] = useState("");
  const [view, setView] = useState("normal"); // 'normal' | 'error'
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    let API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (API_BASE.length > 2048) API_BASE = API_BASE.slice(0, 2048);
    while (API_BASE.endsWith('/')) API_BASE = API_BASE.slice(0, -1);

    try {
      setLoading(true);
      const url = view === "normal"
        ? `${API_BASE}/logs/logs`
        : `${API_BASE}/logs/error-logs`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        if (view === "normal") setLogs(data.logs);
        else setErrorLogs(data.logs);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  }, [view]);

  // Auto refresh logs each 5 sec
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, errorLogs, view]);

  const displayedLogs = view === "normal" ? logs : errorLogs;

  return (
    <div className="flex min-h-screen bg-[#0b0f0e] text-white font-sans">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 p-6 md:p-10 relative pt-24">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header / Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1F2937] p-4 rounded-xl border border-[#1b2b27] shadow-[0_0_15px_#00ff9d11]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <FileText size={20} />
              </div>
              <h1 className="text-xl font-bold text-gray-100">System Logs</h1>
            </div>

            <div className="flex items-center gap-2 bg-[#0e1513] p-1 rounded-lg border border-[#1b2b27]">
              <button
                onClick={() => setView("normal")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${view === "normal"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                Standard Logs
              </button>
              <button
                onClick={() => setView("error")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${view === "error"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-red-400 hover:bg-white/5"
                  }`}
              >
                <AlertTriangle size={14} />
                Error Logs
              </button>
            </div>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 transition-all disabled:opacity-50"
              title="Refresh Logs"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Logs Viewer */}
          <div className="bg-[#1F2937] border border-[#1b2b27] rounded-xl shadow-[0_0_20px_#00000044] overflow-hidden flex flex-col h-[70vh]">
            <div className="bg-[#0e1513] px-4 py-2 border-b border-[#1b2b27] flex justify-between items-center">
              <span className="text-xs text-gray-500 font-mono">Console Output</span>
              <span className="text-xs text-green-500/50 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live
              </span>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0a0f0d]"
            >
              <pre className={`font-mono text-sm whitespace-pre-wrap break-all ${view === 'error' ? 'text-red-300' : 'text-gray-300'
                }`}>
                {displayedLogs || (loading ? "Loading logs..." : "No logs available.")}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
