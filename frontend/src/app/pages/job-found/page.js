"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "../userpanel/Sidebar";
import UserNavbar from "../userpanel/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "../../components/Alert"; // Imported Alert

function JobFoundContent() {
  const [user, setUser] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);


  const [responseMessage, setResponseMessage] = useState(""); // For status box text

  // New Alert State
  const [alertState, setAlertState] = useState(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Track which recent search is active
  const [activeSearch, setActiveSearch] = useState("All Jobs");
  const [currentSession, setCurrentSession] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const runIdParam = searchParams.get("runId");
  const pollingRef = useRef(null);

  // Auto-dismiss alert
  useEffect(() => {
    if (alertState) {
      const timer = setTimeout(() => setAlertState(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertState]);

  // Check for pending application after reload
  useEffect(() => {
    const checkPending = async () => {
      const pendingId = localStorage.getItem("pendingJobApplication");
      if (!pendingId) return;

      console.log("Checking pending job from reload:", pendingId);
      let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
      while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

      try {
        const res = await fetch(`${API_BASE_URL}/applied-jobs/check/${pendingId}`, { method: "GET", credentials: "include" });
        const data = await res.json();

        if (data.exists && data.job?.email_to && data.job?.email_subject) {
          console.log("✅ Pending job is ready! Redirecting...");
          localStorage.removeItem("pendingJobApplication");
          router.push(`/apply?jobid=${pendingId}`);
        } else {
          console.log("❌ Pending job details still missing or job not found.");
          localStorage.removeItem("pendingJobApplication");
        }
      } catch (e) {
        console.error("Error checking pending job:", e);
      }
    };
    checkPending();
  }, [router]);

  useEffect(() => {
    let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
    while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

    pollingRef.current = false;

    const fetchUserAndJobs = async (isPoll = false) => {
      try {
        if (!isPoll) setLoading(true);

        const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.message || "Failed to fetch user");
        setUser(userData.user);
        const userId = userData.user?.userId;
        if (!userId) throw new Error("User info missing");

        let currentSessions = [];
        if (userData.user?.plan?.history) {
          const sortedSessions = userData.user.plan.history.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setSessions(sortedSessions);
          currentSessions = sortedSessions;
        }

        const jobsRes = await fetch(`${API_BASE_URL}/userjobs/${userId}`, {
          method: "GET",
          credentials: "include",
        });
        const jobsData = await jobsRes.json();
        if (!jobsRes.ok) throw new Error(jobsData.message || "Failed to load jobs");

        if (Array.isArray(jobsData.jobs)) {
          setUserJobs(jobsData.jobs);

          if (runIdParam) {
            console.log("🏃 [JobFound] Filtering by runId:", runIdParam);
            const sessionMatch = currentSessions.find(s => s.sessionId === runIdParam);
            const jobsMatch = jobsData.jobs.filter(j =>
              j.sessionId === runIdParam || j.runId === runIdParam || j.sessionid === runIdParam
            );

            if (jobsMatch.length > 0 || sessionMatch) {
              setFilteredJobs(jobsMatch);
              setActiveSearch(`Session: ${sessionMatch?.sessionName || runIdParam}`);
              if (sessionMatch) setCurrentSession(sessionMatch);
              setIsPolling(false);
            } else {
              console.log("⏳ [JobFound] Run ID not found in jobs yet. Polling...");
              setFilteredJobs([]);
              setActiveSearch(`Processing Run: ${runIdParam}...`);
              setIsPolling(true);
              if (!pollingRef.current) {
                pollingRef.current = setTimeout(() => fetchUserAndJobs(true), 5000);
              }
              return;
            }
          } else {
            setFilteredJobs(jobsData.jobs);
          }
        }

        if (jobsData.jobs?.length > 0) {
          setSelectedJob(prev => prev || jobsData.jobs[0]);
        }

        const searchesRes = await fetch(
          `${API_BASE_URL}/userjobs/searches/${userId}`,
          { method: "GET", credentials: "include" }
        );
        const searchesData = await searchesRes.json();
        if (searchesRes.ok) setRecentSearches(searchesData.savedSearches || []);
      } catch (err) {
        console.error("[JobFound] fetch error:", err);
        setError(err.message || "Unknown error");
        setIsPolling(false);
      } finally {
        if (!isPoll) setLoading(false);
      }
    };

    fetchUserAndJobs();

    return () => clearTimeout(pollingRef.current);
  }, [runIdParam]);



  const toggleJobSelection = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const pollForConfirmation = async (jobId) => {
    let attempts = 0;
    const maxAttempts = 50; // 50 * 3s = 150 seconds wait time
    let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
    while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`${API_BASE_URL}/applied-jobs/check/${jobId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        // Strict Check: Ensure job exists AND has critical email data
        if (data.exists && data.job?.email_to && data.job?.email_subject) {
          console.log("✅ Polling confirmed: Job data ready:", data.job);
          return true;
        }
      } catch (e) {
        // Silent catch
      }
      await new Promise(r => setTimeout(r, 3000)); // Increase interval to 3s
      attempts++;
    }
    return false;
  };

  const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res;
      } catch (err) {
        console.warn(`Attempt ${i + 1} failed: ${err.message}`);
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, backoff));
      }
    }
  };

  const applyJobs = async (jobsToApply) => {
    if (!jobsToApply.length) {
      setAlertState({ severity: "warning", message: "No jobs selected!" });
      return;
    }

    setApplying(true);
    setResponseMessage("Your job is under processing...");

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://n8n.techm.work.gd/webhook/apply-jobs";
    let lastJobId = null;
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < jobsToApply.length; i++) {
        const job = jobsToApply[i];

        // Send userId so backend can track it
        const payload = {
          ...job,
          userId: user?.userId,
          trackingId: user?.userId
        };

        const res = await fetchWithRetry(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // Try to parse JSON response
        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error(`Failed to send job ${i + 1}`, result);
          failCount++;
          continue;
        }

        successCount++;
        // Prioritize UUID (jobid/id) over Mongo _id
        const currentJobId = job.jobid || job.jobId || job.id || job._id;
        lastJobId = currentJobId;

        console.log(`✅ Processed job ${i + 1}/${jobsToApply.length}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (failCount > 0 && successCount === 0) {
        setAlertState({
          severity: "error",
          message: "Network error. Server could not be reached. Please try again."
        });
        setApplying(false);
        setResponseMessage("");
        return;
      }

      if (successCount > 0) {
        if (lastJobId) {
          console.log("⏳ Jobs sent to N8N. Waiting 60s for backend processing...");

          // Store ID for post-reload check
          localStorage.setItem("pendingJobApplication", lastJobId);

          // Wait 60 seconds (1 minute as requested)
          await new Promise((resolve) => setTimeout(resolve, 60000));

          // success state
          setResponseMessage("Redirecting to application...");
          // Short delay to let user see the message
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Direct redirect instead of reload
          router.push(`/apply?jobid=${lastJobId}`);
          return;
        } else {
          setApplying(false);
          setResponseMessage("");
        }
      } else {
        setApplying(false);
        setResponseMessage("");
      }

    } catch (err) {
      console.error("Error applying:", err);
      setAlertState({ severity: "error", message: "Network error or server unavailable. Please try again." });
      setApplying(false);
      setResponseMessage("");
    }
  };

  const handleSearchSelect = (search) => {
    console.log("🔍 [handleSearchSelect] Called with:", search);

    if (search === "All Jobs") {
      setFilteredJobs(userJobs);
      setActiveSearch("All Jobs");
      setCurrentSession(null);
      console.log("✅ Showing all jobs:", userJobs.length);
    } else if (search?.jobs) {
      let jobsToShow = [];

      if (Array.isArray(search.jobs)) {
        jobsToShow = search.jobs.flatMap((j) => {
          if (j.jobs && Array.isArray(j.jobs)) {
            return j.jobs;
          }
          return j;
        });
      }

      console.log("✅ Filtered jobs for search:", search.name, "Count:", jobsToShow.length);
      setFilteredJobs(jobsToShow);
      setActiveSearch(search.name);
      setCurrentSession(null);
    } else {
      console.warn("⚠️ Unknown search format:", search);
    }
  };

  const handleSessionSelect = (session) => {
    console.log("🕒 [handleSessionSelect] Called with session:", session);

    const sessionId = session.sessionId;
    const sessionTime = new Date(session.timestamp).getTime();

    setCurrentSession(session);

    let sessionJobs = userJobs.filter((job) => job.sessionId === sessionId);
    console.log(`🔍 Exact ID match for sessionId="${sessionId}": ${sessionJobs.length} jobs`);

    if (sessionJobs.length === 0) {
      console.warn("⚠️ No jobs found by Session ID. Trying time-based matching...");
      sessionJobs = userJobs.filter((job) => {
        const jobTime = new Date(job.postedAt || job.createdAt || job.datePosted).getTime();
        if (isNaN(jobTime)) return false;

        const diff = Math.abs(jobTime - sessionTime);
        return diff < 10 * 60 * 1000;
      });
      console.log(`🕐 Time-based match: ${sessionJobs.length} jobs found`);
    }

    setFilteredJobs(sessionJobs);
    const displayName = session.sessionName || new Date(session.timestamp).toLocaleString();
    setActiveSearch(`Session: ${displayName}`);
    console.log(`✅ Session "${displayName}" selected, showing ${sessionJobs.length} jobs`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-green-400">
        Loading your saved jobs...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#0b0f0e] text-white">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar
        isOpen={sidebarOpen}
        recentSearches={recentSearches}
        onSelectSearch={handleSearchSelect}
      />

      {/* ALERT CONTAINER */}
      {alertState && (
        <div className="fixed top-20 right-5 z-50 w-full max-w-md">
          <Alert severity={alertState.severity} onClose={() => setAlertState(null)}>
            {alertState.message}
          </Alert>
        </div>
      )}

      <div className="flex-1 p-6 md:p-10 relative">

        <div className="flex justify-between items-start flex-wrap gap-4 mt-14 ">
          <div className="flex ">
            <h2 className="text-md font-bold text-green-400 mb-2  px-3 pt-1.5">
              Saved Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSearchSelect("All Jobs")}
                className={`px-4 py-2 rounded-md text-sm border transition ${activeSearch === "All Jobs"
                  ? "bg-green-700/50 border-green-600 text-green-200"
                  : "bg-green-700/20 border-green-700 text-green-300 hover:bg-green-700/40"
                  }`}
              >
                All Jobs ({userJobs.length})
              </button>

              {recentSearches.length > 0 ? (
                recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSelect(search)}
                    className={`px-4 py-2 rounded-md text-sm border transition ${activeSearch === search.name
                      ? "bg-green-700/50 border-green-600 text-green-200"
                      : "bg-green-700/20 border-green-700 text-green-300 hover:bg-green-700/40"
                      }`}
                  >
                    {search.name} ({search.jobs?.length || 0})
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-xs italic mt-2">No saved searches yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4 w-full">
          <h2 className="text-md font-bold text-green-400 mb-2 px-3">
            Recent Sessions
          </h2>
          <div className="flex flex-wrap gap-2 px-3">
            {sessions.length > 0 ? (
              sessions.map((session, idx) => {
                const displayName = session.sessionName || new Date(session.timestamp).toLocaleString();
                const isActive = activeSearch === `Session: ${displayName}`;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSessionSelect(session)}
                    className={`px-3 py-1 rounded-md text-xs border transition ${isActive
                      ? "bg-green-700/50 border-green-600 text-green-200"
                      : "bg-green-700/10 border-green-800 text-green-400 hover:bg-green-700/30"
                      }`}
                  >
                    {displayName}
                    <span className="ml-1 opacity-70">({session.deducted} jobs)</span>
                  </button>
                );
              })
            ) : (
              <p className="text-gray-500 text-xs italic">No recent sessions</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 md:mt-0">
          <button
            onClick={() => applyJobs(userJobs.filter((j) => selectedJobs.includes(j._id)))}
            disabled={!selectedJobs.length || applying}
            className={`px-3 py-2 text-sm rounded-md border transition flex items-center gap-2 ${selectedJobs.length && !applying
              ? "bg-green-700/30 border-green-700 text-green-300 hover:bg-green-700/50"
              : "bg-gray-700/20 border-gray-600 text-gray-500 cursor-not-allowed"
              }`}
          >
            {applying ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              `Apply Now (${selectedJobs.length})`
            )}
          </button>

          <button
            onClick={() => applyJobs(userJobs)}
            disabled={applying}
            className="px-3 py-2 text-sm rounded-md bg-green-700/20 border border-green-700 text-green-300 hover:bg-green-700/40 transition flex items-center gap-2 disabled:bg-gray-700/20 disabled:text-gray-500 disabled:border-gray-600 cursor-pointer disabled:cursor-not-allowed"
          >
            {applying ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              "Apply All"
            )}
          </button>
        </div>

        {/* Status Message Area */}
        {applying && (
          <div className="mt-6 w-full max-w-lg p-4 bg-green-900/40 border border-green-500/50 rounded-xl text-green-300 text-center shadow-[0_0_15px_#00ff9d22] animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-green-400" size={24} />
            <p className="font-semibold text-lg">{responseMessage}</p>
          </div>
        )}



        <div className="flex h-[75vh] border border-green-800 rounded-lg overflow-hidden mt-6">
          <div className="w-1/3 m-2 grid gap-4 grid-cols-1 lg:grid-cols-1 overflow-y-auto no-scrollbar">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => {
                const jobId = job._id || job.id || job.jobId || idx;
                const isSelected = selectedJobs.includes(jobId);
                const title = job.Title || job.title || "(No title)";
                const description =
                  job.Description || job.descriptionText || job.descriptionHtml || "No description available.";
                const location = job.Location || job.location || "";
                const postedAt = job.postedAt || job.datePosted || job.createdAt || null;

                return (
                  <div
                    key={job._id || idx}
                    className={`p-4 border rounded-xl shadow-md transition cursor-pointer ${isSelected
                      ? "bg-green-900/20 border-green-500"
                      : "bg-[#0e1513] border-[#1b2b27] hover:border-green-700"
                      }`}
                    onClick={() => toggleJobSelection(jobId)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-green-400 truncate">{title}</h3>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleJobSelection(jobId)}
                        className="accent-green-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <p
                      className="text-sm text-gray-500 mt-2 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: description }}
                    ></p>

                    <div className="mt-3 text-xs text-green-300 space-y-1">
                      <div className="text-gray-400 text-sm mb-2">{location}</div>
                      <div className="text-gray-400 text-sm mb-2">
                        Posted: {postedAt ? new Date(postedAt).toLocaleDateString() : "Unknown date"}
                      </div>
                    </div>

                    {job.link && (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-3 text-green-400 hover:text-green-300 text-sm"
                      >
                        View / Apply →
                      </a>
                    )}

                    <button
                      className="mt-3 w-full px-3 py-2 bg-green-700/20 border border-green-700 text-green-300 rounded-md hover:bg-green-700/40 transition text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 mt-10">No jobs found.</div>
            )}
          </div>

          <div className="w-3/4 p-6 overflow-y-auto no-scrollbar bg-[#0b0f0e]">
            {selectedJob ? (
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-3">
                  {selectedJob.Title || selectedJob.title}
                </h3>

                <div className="space-y-2 text-sm max-h-[65vh] overflow-y-auto">
                  {Object.keys(selectedJob).map((key) => {
                    if (["_id", "__v"].includes(key)) return null;
                    return (
                      <div key={key}>
                        <span className="font-semibold text-green-300">{key}: </span>
                        {key === "link" || key === "applyUrl" ? (
                          <a
                            href={selectedJob[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 underline"
                          >
                            {selectedJob[key]}
                          </a>
                        ) : (
                          <span className="text-gray-300">{String(selectedJob[key])}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedJob.link && (
                  <div className="mt-6">
                    <a
                      href={selectedJob.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-black px-5 py-2 rounded-md hover:bg-green-500 transition font-semibold"
                    >
                      Go to Job
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-center mt-10">
                Select a job to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}

export default function JobFound() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0f0d] text-green-500">Loading search parameters...</div>}>
      <JobFoundContent />
    </Suspense>
  );
}
