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
  Briefcase,
  X as XIcon
} from "lucide-react";

const LinkedInSVG = ({ size = 13, className = "" }) => (
  <svg width={size} height={(size / 13) * 14} viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_27_478)">
      <path d="M11.375 0.875H0.872266C0.391016 0.875 0 1.27148 0 1.7582V12.2418C0 12.7285 0.391016 13.125 0.872266 13.125H11.375C11.8562 13.125 12.25 12.7285 12.25 12.2418V1.7582C12.25 1.27148 11.8562 0.875 11.375 0.875ZM3.70234 11.375H1.88672V5.52891H3.70508V11.375H3.70234ZM2.79453 4.73047C2.21211 4.73047 1.7418 4.25742 1.7418 3.67773C1.7418 3.09805 2.21211 2.625 2.79453 2.625C3.37422 2.625 3.84727 3.09805 3.84727 3.67773C3.84727 4.26016 3.37695 4.73047 2.79453 4.73047ZM10.5082 11.375H8.69258V8.53125C8.69258 7.85313 8.67891 6.98086 7.74922 6.98086C6.80312 6.98086 6.6582 7.71914 6.6582 8.48203V11.375H4.84258V5.52891H6.58437V6.32734H6.60898C6.85234 5.86797 7.4457 5.38398 8.32891 5.38398C10.1664 5.38398 10.5082 6.59531 10.5082 8.17031V11.375Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_27_478">
        <path d="M0 0H12.25V14H0V0Z" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const GithubSVG = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_27_482)">
      <path d="M4.53633 10.8664C4.53633 10.9211 4.47344 10.9648 4.39414 10.9648C4.30391 10.973 4.24102 10.9293 4.24102 10.8664C4.24102 10.8117 4.30391 10.768 4.3832 10.768C4.46523 10.7598 4.53633 10.8035 4.53633 10.8664ZM3.68594 10.7434C3.6668 10.798 3.72148 10.8609 3.80352 10.8773C3.87461 10.9047 3.95664 10.8773 3.97305 10.8227C3.98945 10.768 3.9375 10.7051 3.85547 10.6805C3.78437 10.6613 3.70508 10.6887 3.68594 10.7434ZM4.89453 10.6969C4.81523 10.716 4.76055 10.768 4.76875 10.8309C4.77695 10.8855 4.84805 10.9211 4.93008 10.902C5.00938 10.8828 5.06406 10.8309 5.05586 10.7762C5.04766 10.7242 4.97383 10.6887 4.89453 10.6969ZM6.69375 0.21875C2.90117 0.21875 0 3.09805 0 6.89062C0 9.92305 1.90859 12.518 4.63477 13.4313C4.98477 13.4941 5.10781 13.2781 5.10781 13.1004C5.10781 12.9309 5.09961 11.9957 5.09961 11.4215C5.09961 11.4215 3.18555 11.8316 2.78359 10.6066C2.78359 10.6066 2.47187 9.81094 2.02344 9.60586C2.02344 9.60586 1.39727 9.17656 2.06719 9.18477C2.06719 9.18477 2.74805 9.23945 3.12266 9.89023C3.72148 10.9457 4.725 10.6422 5.11602 10.4617C5.17891 10.0242 5.35664 9.7207 5.55352 9.54023C4.025 9.3707 2.48281 9.14922 2.48281 6.51875C2.48281 5.7668 2.69062 5.38945 3.12812 4.9082C3.05703 4.73047 2.82461 3.99766 3.19922 3.05156C3.7707 2.87383 5.08594 3.78984 5.08594 3.78984C5.63281 3.63672 6.2207 3.55742 6.80312 3.55742C7.38555 3.55742 7.97344 3.63672 8.52031 3.78984C8.52031 3.78984 9.83555 2.87109 10.407 3.05156C10.7816 4.00039 10.5492 4.73047 10.4781 4.9082C10.9156 5.39219 11.1836 5.76953 11.1836 6.51875C11.1836 9.15742 9.57305 9.36797 8.04453 9.54023C8.29609 9.75625 8.50938 10.1664 8.50938 10.809C8.50938 11.7305 8.50117 12.8707 8.50117 13.0949C8.50117 13.2727 8.62695 13.4887 8.97422 13.4258C11.7086 12.518 13.5625 9.92305 13.5625 6.89062C13.5625 3.09805 10.4863 0.21875 6.69375 0.21875ZM2.65781 9.64961C2.62227 9.67695 2.63047 9.73984 2.67695 9.7918C2.7207 9.83555 2.78359 9.85469 2.81914 9.81914C2.85469 9.7918 2.84648 9.72891 2.8 9.67695C2.75625 9.6332 2.69336 9.61406 2.65781 9.64961ZM2.3625 9.42812C2.34336 9.46367 2.3707 9.50742 2.42539 9.53477C2.46914 9.56211 2.52383 9.55391 2.54297 9.51562C2.56211 9.48008 2.53477 9.43633 2.48008 9.40898C2.42539 9.39258 2.38164 9.40078 2.3625 9.42812ZM3.24844 10.4016C3.20469 10.4371 3.22109 10.5191 3.28398 10.5711C3.34687 10.634 3.42617 10.6422 3.46172 10.5984C3.49727 10.5629 3.48086 10.4809 3.42617 10.4289C3.36602 10.366 3.28398 10.3578 3.24844 10.4016ZM2.93672 9.99961C2.89297 10.027 2.89297 10.098 2.93672 10.1609C2.98047 10.2238 3.0543 10.2512 3.08984 10.2238C3.13359 10.1883 3.13359 10.1172 3.08984 10.0543C3.05156 9.99141 2.98047 9.96406 2.93672 9.99961Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_27_482">
        <path d="M0 0H13.5625V14H0V0Z" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
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
  const [modalSearchName, setModalSearchName] = useState("");

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");

  /* ---------------- LOAD HISTORY (SERVER SIDE) ---------------- */
  useEffect(() => {
    if (!user?.userId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/userjobs/searches/${user.userId}`, {
          credentials: "include"
        });
        const data = await res.json();
        if (res.ok && data.savedSearches) {
          // Map saved searches to the format expected by pills
          const history = data.savedSearches
            .filter(s => s && s.name)
            .map(s => ({
              title: s.name.split(' in ')[0] || s.name, // Estimate title from name
              loc: s.name.split(' in ')[1] || "",
              count: 100, // Default or estimate
              originalName: s.name
            })).slice(0, 5);
          setSearchHistory(history);
        }
      } catch (e) {
        console.error("Failed to fetch search history", e);
      }
    };
    fetchHistory();
  }, [user?.userId, API_BASE_URL]);

  /* ---------------- SAVE SEARCH CONTEXT (DUMMY - PERSISTED BY SERVER) ---------------- */
  const saveSearchContext = (title, loc, jobCount) => {
    // We already persist searches via the "Save Search" modal which hits the backend
    // So we don't need to manually update local storage anymore
    // We'll just update the local state for immediate feedback if desired
    const newEntry = { title, loc, count: jobCount, timestamp: Date.now() };
    setSearchHistory(prev => [
      newEntry,
      ...prev.filter(item => item.title.toLowerCase() !== title.toLowerCase())
    ].slice(0, 5));
  };

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
          // Auto-trigger Save Modal with a slight delay
          setTimeout(() => setShowSaveModal(true), 3000);
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
    if (!num || num < 100 || num > 1500) {
      setCountError("Count must be between 100–1500");
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
          Smarter Job Search <span className="text-green-500">Starts Here</span>
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
              <label className="text-gray-400 text-base font-medium flex items-center gap-2">
                <Briefcase size={14} className="text-green-500" />
                Job Title
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
                Location
              </label>
              <div className="[&_*]:!text-sm">
                <LocationDropdown value={location} onChange={setLocation} placeholder="Search city, area, or PIN" />
              </div>
            </div>

            {/* Social Links - Stacked */}
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <label className="text-gray-400 text-base font-medium flex items-center gap-2">
                  <LinkedInSVG className="text-[#4ADE80]" />
                  LinkedIn URL
                </label>
                <input
                  required
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full rounded-xl bg-[#0e1513] text-green-300 border border-[#2d3b4d] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
                />
                <p className="text-[10px] text-gray-400 font-medium italic pl-1 text-red-500">
                  Save this in your profile for better results
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-gray-400 text-base font-medium flex items-center gap-2">
                  <GithubSVG className="text-[#4ADE80]" />
                  GitHub URL
                </label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="github.com/username"
                  className="w-full rounded-xl bg-[#0e1513] text-green-300 border border-[#2d3b4d] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
                />
                <p className="text-[10px] text-gray-400 font-medium italic pl-1">
                  Save this in your profile for better results
                </p>
              </div>
            </div>

            {/* Count */}
            <div className="space-y-3">
              <label className="text-gray-400 text-base font-medium">Number of Jobs to Fetch</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="100"
                  max="1500"
                  step="1"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className={`w-full rounded-xl bg-[#0e1513] px-4 py-3 border focus:outline-none transition-all ${count === 100
                    ? "text-green-400 border-green-500/50 ring-1 ring-green-500/20"
                    : "text-green-300 border-[#2d3b4d] focus:ring-2 focus:ring-green-500/50"
                    }`}
                />
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
                  <span> Finding Opportunities...</span>
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
              onClick={() => {
                setShowSaveModal(false);
                setModalSearchName("");
              }}
            >
              <XIcon className="w-6 h-6" />
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
                className="w-full bg-[#0e1513] border border-[#2d3b4d] text-green-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                value={modalSearchName}
                onChange={(e) => setModalSearchName(e.target.value)}
                autoFocus
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={async () => {
                    if (!modalSearchName.trim()) {
                      setAlertState({ severity: "warning", message: "Please enter a search name to continue." });
                      return;
                    }
                    try {
                      const res = await fetch(`${API_BASE_URL}/userjobs/searches/save`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          name: modalSearchName.trim(),
                          jobs: userJobs,
                          runId: response?.runId,
                          sessionId: sessionId,
                        }),
                      });
                      if (!res.ok) throw new Error("Failed to save search");
                      setModalSearchName("");
                      setShowSaveModal(false);
                      router.push(`/pages/job-found?runId=${response.runId}`);
                    } catch (err) {
                      setAlertState({ severity: "error", message: err.message || "Error saving search" });
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors font-bold"
                >
                  View Jobs
                </button>
                <button
                  onClick={async () => {
                    const finalName = modalSearchName.trim() || `${jobTitle} in ${location}`;
                    try {
                      const res = await fetch(`${API_BASE_URL}/userjobs/searches/save`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          name: finalName,
                          jobs: userJobs,
                          runId: response?.runId,
                          sessionId: sessionId,
                        }),
                      }
                      );
                      if (!res.ok) throw new Error("Failed to save search");
                      setAlertState({ severity: "success", message: "Search saved successfully!" });
                      setModalSearchName("");
                      setShowSaveModal(false);
                      router.push(`/pages/job-found?runId=${response.runId}`);
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
