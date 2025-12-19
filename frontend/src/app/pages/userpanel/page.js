"use client";

import { useState, useEffect, useRef } from "react";
import LocationDropdown from "../../components/LocationDropdown";
import {
  Loader2,
  Search,
  MapPin,
  Linkedin,
  Github,
  CheckCircle2,
  Sparkles,
  History,
  ArrowRight,
  X
} from "lucide-react";
import UserNavbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";
import Alert from "../../components/Alert";



export default function UserPanel() {
  const router = useRouter();
  const eventSourceRef = useRef(null);


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  const [response, setResponse] = useState(null);
  const [userJobs, setUserJobs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [jobFinished, setJobFinished] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("Preparing job…");

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [count, setCount] = useState(100);
  const [countError, setCountError] = useState("");

  const [sessionId, setSessionId] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [credits, setCredits] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);

  /* ---------------- LOAD HISTORY ---------------- */
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("ai_job_search_history") || "[]");
      setSearchHistory(history);
    } catch (e) {
      console.error("Failed to load search history", e);
    }
  }, []);

  /* ---------------- SAVE SEARCH CONTEXT ---------------- */
  const saveSearchContext = (title, loc, jobCount) => {
    try {
      const history = JSON.parse(localStorage.getItem("ai_job_search_history") || "[]");
      const newEntry = { title, loc, count: jobCount, timestamp: Date.now() };

      // Keep only unique titles, most recent first
      const updatedHistory = [
        newEntry,
        ...history.filter(item => item.title.toLowerCase() !== title.toLowerCase())
      ].slice(0, 5);

      localStorage.setItem("ai_job_search_history", JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    } catch (e) {
      console.error("Failed to save search history", e);
    }
  };

  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_BASE_URL || "";
  while (API_BASE_URL.endsWith("/")) API_BASE_URL = API_BASE_URL.slice(0, -1);

  /* ---------------- ALERT AUTO DISMISS ---------------- */
  useEffect(() => {
    if (alertState) {
      const t = setTimeout(() => setAlertState(null), 5000);
      return () => clearTimeout(t);
    }
  }, [alertState]);

  /* ---------------- SESSION ID ---------------- */
  useEffect(() => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    setSessionId(`session_${Date.now()}_${arr[0].toString(16)}`);
  }, []);

  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser(data.user);

        if (data.user?.userId) {
          if (data.user.linkedin) setLinkedin(data.user.linkedin);
          if (data.user.github) setGithub(data.user.github);

          const jobRes = await fetch(
            `${API_BASE_URL}/userjobs/${data.user.userId}`,
            { credentials: "include" }
          );
          const jobData = await jobRes.json();
          setUserJobs(jobData.jobs || []);

          // Fetch credits
          try {
            const creditRes = await fetch(`${API_BASE_URL}/credits/check?userId=${data.user.userId}`, { credentials: "include" });
            const creditData = await creditRes.json();
            if (creditRes.ok) setCredits(creditData.credits);
          } catch (e) {
            console.error("Failed to fetch credits", e);
          }
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUser();
  }, [API_BASE_URL]);

  /* ---------------- PROGRESS POLLING ---------------- */
  useEffect(() => {
    if (!response?.runId || jobFinished) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/progress/${response.runId}`
        );
        const data = await res.json();

        if (typeof data.progress === "number") {
          setLoadingProgress(data.progress);
        }

        if (data.message) {
          setProgressMessage(data.message);
        }

        if (data.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          setJobFinished(false);
          setAlertState({
            severity: "error",
            message: data.message || "Job failed",
          });
        }

        if (data.status === "completed" || data.progress >= 100) {
          clearInterval(interval);
          setLoading(false);
          setJobFinished(true);
          setLoadingProgress(100);
          setProgressMessage("Completed successfully");
          // Auto-trigger Save Modal
          setTimeout(() => setShowSaveModal(true), 1500);
        }
      } catch (err) {
        console.error("Progress polling failed", err);
      }
    }, 2000); // every 2 sec

    return () => clearInterval(interval);
  }, [response?.runId, jobFinished, API_BASE_URL]);


  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Check credits before starting
    if (credits < 100) {
      setAlertState({
        severity: "error",
        message: "Insufficient credits! You need at least 100 credits. Redirecting to plans..."
      });
      setTimeout(() => {
        router.push("/pages/price");
      }, 2000);
      return;
    }

    const num = Number(count);
    if (!num || num < 100 || num > 1000) {
      setCountError("Count must be between 100–1000");
      return;
    }
    setCountError("");
    saveSearchContext(jobTitle, location, num);

    setLoading(true);
    setJobFinished(false);
    setLoadingProgress(0);
    setProgressMessage("Starting job…");

    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const runId = `run_${Date.now()}_${arr[0].toString(16)}`;

    setResponse({
      message: "Your job is under processing…",
      runId,
    });

    try {
      await fetch(`${API_BASE_URL}/userjobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: {
            jobTitle,
            location,
            linkedin,
            github,
            count: num,
          },
          runId,
          sessionId: runId,
        }),
      });
    } catch (err) {
      setLoading(false);
      setAlertState({
        severity: "error",
        message: "Failed to start job",
      });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="relative min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center px-4 pb-20">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      {alertState && (
        <div className="fixed top-24 z-50 w-full max-w-lg px-4">
          <Alert severity={alertState.severity} onClose={() => setAlertState(null)}>
            {alertState.message}
          </Alert>
        </div>
      )}

      {/* Header text */}
      <div className="text-center mt-24 mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          AI Job <span className="text-green-500">Automation</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Connect your profiles and let our AI agents handle the heavy lifting of finding your next career move.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-10">
        {/* Main Form Card */}
        <div className="bg-[#1F2937]/40 backdrop-blur-md border border-[#2d3b4d] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/5 blur-[80px] rounded-full"></div>

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">
            {/* Job Title & Recommendations */}
            <div className="space-y-3">
              <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <Search size={14} className="text-green-500" />
                Target Job Title
              </label>
              <input
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Fullstack Engineer"
                className="w-full rounded-xl bg-[#0e1513] text-green-300 border border-[#2d3b4d] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
              />

              {/* Recommendation Pills */}
              {searchHistory.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold pt-1 mr-1">Recent:</span>
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setJobTitle(item.title);
                        setLocation(item.loc);
                        setCount(item.count);
                      }}
                      className="text-xs bg-green-500/5 hover:bg-green-500/20 border border-green-500/10 hover:border-green-500/30 text-green-400/80 hover:text-green-400 px-3 py-1 rounded-full transition-all flex items-center gap-1.5"
                    >
                      <History size={10} />
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <MapPin size={14} className="text-green-500" />
                Preferred Location
              </label>
              <div className="[&_*]:!text-sm">
                <LocationDropdown value={location} onChange={setLocation} placeholder="Search city, area, or PIN" />
              </div>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                  <Linkedin size={14} className="text-[#0A66C2]" />
                  LinkedIn URL
                </label>
                <input
                  required
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full rounded-xl bg-[#0e1513] text-green-300 border border-[#2d3b4d] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
                />
                <p className="text-[10px] text-gray-500 font-medium italic pl-1">
                  Save this in your profile for better results
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                  <Github size={14} className="text-white" />
                  GitHub URL
                </label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="github.com/username"
                  className="w-full rounded-xl bg-[#0e1513] text-green-300 border border-[#2d3b4d] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
                />
                <p className="text-[10px] text-gray-500 font-medium italic pl-1">
                  Save this in your profile for better results
                </p>
              </div>
            </div>

            {/* Count */}
            <div className="space-y-3">
              <label className="text-gray-400 text-sm font-medium">Number of Jobs to Fetch</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="flex-1 accent-green-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="bg-[#0e1513] border border-[#2d3b4d] text-green-400 px-3 py-1 rounded-lg font-mono text-sm min-w-[70px] text-center">
                  {count}
                </span>
              </div>
              {countError && <p className="text-red-400 text-xs">{countError}</p>}
            </div>

            <button
              disabled={loading}
              className={`mt-4 group relative flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all duration-500 overflow-hidden ${loading
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                  : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-black shadow-[0_0_25px_#10b98133] hover:shadow-[0_0_35px_#10b98155] active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Agent is Deploying...</span>
                </>
              ) : (
                <>
                  <span>Find Opportunities Now</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Progress Display Panel */}
        {(loading || jobFinished) && (
          <div className="bg-[#1F2937]/40 backdrop-blur-md border border-[#2d3b4d] rounded-2xl p-10 shadow-2xl animate-in fade-in slide-in-from-top-6 duration-700">
            {!jobFinished ? (
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-gray-800"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * loadingProgress) / 100}
                      className="text-green-500 transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{Math.floor(loadingProgress)}%</span>
                  </div>

                  {/* Pulse Effect */}
                  <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping -z-10"></div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white flex items-center justify-center gap-3">
                    <Sparkles size={20} className="text-green-400 animate-pulse" />
                    Our AI is crawling the web
                  </h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-green-400/80 text-sm font-medium tracking-wide h-6">
                      {progressMessage}
                    </p>
                    <div className="w-48 h-1 bg-gray-800 mx-auto mt-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 animate-shimmer"
                        style={{ width: '100%', background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)', backgroundSize: '200% 100%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-1000">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center shadow-[0_0_40px_#22c55e33] border border-green-500/30">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-white">Search Completed!</h2>
                  <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-lg">
                    Your search for <span className="text-green-400 font-bold">“{jobTitle}”</span> in <span className="text-green-400 font-bold">“{location}”</span> has been completed successfully.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={() => router.push(`/pages/job-found?runId=${response.runId}`)}
                    className="flex-1 bg-green-500 hover:bg-green-400 text-black py-4 rounded-xl font-black transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                  >
                    View All Jobs
                    <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black border border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    Save Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-in fade-in duration-300">
          <div className="bg-[#13201c] border border-green-500/20 rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              onClick={() => setShowSaveModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="text-green-500" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Save Your Search</h3>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Give your search a name to easily access these results later from your dashboard.
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="e.g. Frontend Roles in Berlin"
                className="w-full bg-[#0e1513] border border-[#2d3b4d] text-green-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                id="searchNameInput"
                autoFocus
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors font-bold"
                >
                  Skip
                </button>
                <button
                  onClick={async () => {
                    const searchName = document.getElementById("searchNameInput")?.value.trim() || `${jobTitle} in ${location}`;
                    try {
                      const res = await fetch(`${API_BASE_URL}/userjobs/searches/save`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          name: searchName,
                          jobs: userJobs,
                          runId: response?.runId,
                          sessionId: sessionId,
                        }),
                      }
                      );
                      if (!res.ok) throw new Error("Failed to save search");
                      setAlertState({ severity: "success", message: "Search saved successfully!" });
                      setShowSaveModal(false);
                      router.push("/pages/job-found");
                    } catch (err) {
                      setAlertState({ severity: "error", message: err.message || "Error saving search" });
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-black rounded-xl hover:bg-green-500 transition-all font-black shadow-lg shadow-green-600/20"
                >
                  Save Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Summary Footer */}
      {user && (
        <div className="mt-16 p-6 bg-[#1F2937]/20 border border-[#2d3b4d] rounded-2xl shadow-xl w-full max-w-2xl flex flex-wrap gap-8 items-center justify-center md:justify-between text-sm filter grayscale hover:grayscale-0 transition-all duration-700 opacity-50 hover:opacity-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-black font-bold">
              {user.name?.[0] || 'U'}
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Active Profile</p>
              <p className="text-white font-bold">{user.name}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Credits</p>
              <p className="text-green-500 font-mono font-bold">{credits}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Session</p>
              <p className="text-gray-300 font-mono text-[10px] truncate max-w-[80px]">{sessionId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
