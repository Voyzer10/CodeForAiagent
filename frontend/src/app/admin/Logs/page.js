"use client";
"use client";
import { useEffect, useState, useRef, useCallback } from "react";


export default function LogsPage() {
  const [logs, setLogs] = useState("");
  const [errorLogs, setErrorLogs] = useState("");
  const [view, setView] = useState("normal"); // "normal" | "error"
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const logUrl =
        view === "normal"
          ? `${API_BASE_URL}/admin/logs`
          : `${API_BASE_URL}/admin/error-logs`;

      const res = await fetch(logUrl);
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
  }, [view]); // ✅ now it’s a dependency-safe function

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [fetchLogs]); // ✅ safe to include fetchLogs now

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, errorLogs]);

  const displayedLogs = view === "normal" ? logs : errorLogs;


  return (
    <div className="p-6 bg-[#0f172a] text-[#e2e8f0] min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#00ff9d]">Server Logs</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("normal")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              view === "normal"
                ? "bg-[#00ff9d] text-[#0f172a]"
                : "bg-[#00ff9d33] text-[#00ff9d]"
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setView("error")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              view === "error"
                ? "bg-red-500 text-white"
                : "bg-red-500/30 text-red-400"
            }`}
          >
            Errors
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              loading
                ? "bg-[#00ff9d33] text-gray-400 cursor-not-allowed"
                : "bg-[#00ff9d] text-[#0f172a] hover:bg-[#00cc80]"
            }`}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="bg-[#1e293b] p-4 rounded-lg overflow-y-auto flex-1 border border-[#00ff9d33] shadow-lg max-h-[80vh]"
      >
        <pre
          className={`whitespace-pre-wrap text-sm font-mono ${
            view === "error" ? "text-red-400" : "text-gray-200"
          }`}
        >
          {displayedLogs || "Loading logs..."}
        </pre>
      </div>
    </div>
  );
}
