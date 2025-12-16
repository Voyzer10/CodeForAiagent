"use client";

import { useState, useEffect, useRef } from "react";
import LocationDropdown from "../../components/LocationDropdown";
import { Loader2 } from "lucide-react";
import UserNavbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";
import Alert from "../../components/Alert";

const PROGRESS_MESSAGES = [
  "Scanning LinkedIn & job boards…",
  "Analyzing your profile match…",
  "Filtering best-fit opportunities…",
  "Finalizing results…",
];

export default function UserPanel() {
  const router = useRouter();
  const pollRef = useRef(null);
  const pollSuccessCount = useRef(0);
  const messageTick = useRef(0);


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
  const [progressMessage, setProgressMessage] = useState(PROGRESS_MESSAGES[0]);

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [count, setCount] = useState(100);
  const [countError, setCountError] = useState("");

  const [sessionId, setSessionId] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [alertState, setAlertState] = useState(null);

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
          const jobRes = await fetch(
            `${API_BASE_URL}/userjobs/${data.user.userId}`,
            { credentials: "include" }
          );
          const jobData = await jobRes.json();
          setUserJobs(jobData.jobs || []);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUser();
  }, [API_BASE_URL]);

  /* ---------------- PROGRESS BAR ANIMATION ---------------- */
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 95) return 95; // HARD STOP till backend confirms
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [loading]);

  /* ---------------- PROGRESS MESSAGE ROTATION ---------------- */
  useEffect(() => {
    const idx = Math.min(
      Math.floor(loadingProgress / 25),
      PROGRESS_MESSAGES.length - 1
    );
    setProgressMessage(PROGRESS_MESSAGES[idx]);
  }, [loadingProgress]);

  useEffect(() => {
    if (!loading || jobFinished) return;

    const msgInterval = setInterval(() => {
      messageTick.current =
        (messageTick.current + 1) % PROGRESS_MESSAGES.length;
      setProgressMessage(PROGRESS_MESSAGES[messageTick.current]);
    }, 4000); // every 4 seconds

    return () => clearInterval(msgInterval);
  }, [loading, jobFinished]);

  /* ---------------- POLLING JOB COMPLETION ---------------- */
  useEffect(() => {
    if (!response?.runId || !user?.userId || jobFinished) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/userjobs/${user.userId}?runId=${response.runId}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();
        console.log("poll", pollSuccessCount.current, data);

        const completed =
          data.finished === true ||
          data.status === "completed" ||
          data.success === true ||
          (Array.isArray(data.jobs) && data.jobs.length > 0);

        if (!completed) {
          pollSuccessCount.current += 1;
        }

        if (completed || pollSuccessCount.current >= 2) {
          clearInterval(pollRef.current);
          setUserJobs(data.jobs || []);
          setJobFinished(true);
          setLoading(false);
          setLoadingProgress(100);
          setResponse({
            message: "🎉 Jobs found successfully!",
            runId: response.runId,
          });
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [response, user, jobFinished, API_BASE_URL]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    pollSuccessCount.current = 0;
    messageTick.current = 0;
    setProgressMessage(PROGRESS_MESSAGES[0]);

    const num = Number(count);
    if (!num || num < 100 || num > 1000) {
      setCountError("Count must be between 100–1000");
      return;
    }
    setCountError("");

    setError(null);
    setLoading(true);
    setJobFinished(false);
    setLoadingProgress(0);

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
          sessionId: runId,
          runId,
        }),
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
      setAlertState({ severity: 'error', message: 'Failed to start job' });
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
        <h2 className="text-gray-400 tracking-wide text-lg">
          Connect your profiles and let AI find the right opportunities for you
        </h2>
        <div className="w-24 h-[2px] bg-green-500 mx-auto mt-3"></div>
      </div>

      <div className="bg-[#1F2937] shadow-[0_0_15px_#00ff9d33] border border-[#1b2b27] rounded-xl w-full max-w-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Job Title</label>
            <input
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Location</label>
            <div className="[&_*]:!text-sm py-2">
              <LocationDropdown value={location} onChange={setLocation} placeholder="Search city, area, or PIN" />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">LinkedIn Profile URL</label>
            <input
              required
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="Paste your LinkedIn profile link"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">GitHub Profile URL</label>
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="Paste your GitHub profile link"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Count</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {countError && <p className="text-red-400 text-xs mt-1">{countError}</p>}
          </div>

          <button
            disabled={loading || Boolean(countError)}
            className={`mt-3 relative flex items-center justify-center gap-2 font-semibold py-2 rounded-md transition-all duration-300 shadow-[0_0_20px_#00ff9d55] overflow-hidden ${loading || jobFinished
              ? "bg-gray-900 text-white cursor-wait"
              : "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-green-300 text-black disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
          >
            {loading || jobFinished ? (
              <>
                <div
                  className={`absolute bottom-0 left-0 w-full transition-all duration-300 ease-out ${jobFinished ? 'bg-green-600' : 'bg-gradient-to-t from-green-600 to-emerald-500'}`}
                  style={{ height: `${loadingProgress}%` }}
                />
                {!jobFinished && (
                  <div
                    className="absolute left-0 w-full h-[2px] bg-green-300 opacity-50 shadow-[0_0_10px_#ffff]"
                    style={{ bottom: `${loadingProgress}%`, transition: "bottom 300ms ease-out" }}
                  />
                )}
                <div className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                  {jobFinished ? (
                    <span>Scale Up to 100% Completed!</span>
                  ) : (
                    <>
                      <Loader2 className="animate-spin text-white" size={18} />
                      <span>Processing... {Math.floor(loadingProgress)}%</span>
                    </>
                  )}
                </div>
              </>
            ) : (
              "Find Opportunities Now"
            )}
          </button>
        </form>

        {loading && !jobFinished && (
          <div className="mt-4 text-center">
            <p className="text-sm text-green-300 animate-pulse">{progressMessage}</p>
          </div>
        )}

        {jobFinished && (
          <div className="mt-6 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center text-green-400 font-bold text-lg mb-2">🎉 Jobs Found!</div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/pages/job-found?runId=${response.runId}`)}
                className="flex-1 bg-green-600 hover:bg-green-500 text-black py-2 rounded font-semibold shadow-lg transition-all"
              >
                View Jobs
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-semibold shadow-lg transition-all"
              >
                Save Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-[#13201c] border border-green-900 rounded-xl w-11/12 md:w-1/3 p-6 shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
              onClick={() => setShowSaveModal(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-green-400 mb-4">Save This Search</h3>
            <input
              type="text"
              placeholder="Enter search name"
              className="w-full px-3 py-2 mb-4 text-black rounded-md"
              id="searchNameInput"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const searchName = document.getElementById("searchNameInput")?.value.trim();
                  if (!searchName) {
                    setAlertState({ severity: "warning", message: "Please enter a search name." });
                    return;
                  }
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
                className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      {user && (
        <div className="mt-10 p-4 bg-[#0d1512] border border-[#1b2b27] rounded-xl shadow-[0_0_10px_#00ff9d22] w-full max-w-lg text-sm text-gray-300">
          <p><strong className="text-green-400">Name:</strong> {user.name}</p>
          <p><strong className="text-green-400">User ID:</strong> {user.userId}</p>
          <p><strong className="text-green-400">Session ID:</strong> {sessionId}</p>
        </div>
      )}
    </div>
  );
}
