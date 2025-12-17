"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { Loader2, CheckCircle, Pencil, Trash2, X, Check } from "lucide-react";
import Sidebar from "../userpanel/Sidebar";
import UserNavbar from "../userpanel/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  // NOTE: selectedJobs now stores UUIDs (jobid) — consistent with n8n & DB
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const [responseMessage, setResponseMessage] = useState(""); // For status box text
  const [alertState, setAlertState] = useState(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const [activeSearch, setActiveSearch] = useState("All Jobs");
  const [currentSession, setCurrentSession] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [editingSearch, setEditingSearch] = useState(null);
  const [renameValue, setRenameValue] = useState("");

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

  // NOTE: removed localStorage-based pending-recovery (JWT-only approach)
  // If you want recovery on refresh, we can re-add it separately.

  useEffect(() => {
    let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
    while (API_BASE_URL.endsWith("/")) API_BASE_URL = API_BASE_URL.slice(0, -1);

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
            const sessionMatch = currentSessions.find((s) => s.sessionId === runIdParam);

            const jobsMatch = jobsData.jobs.filter(
              (j) =>
                j.sessionId === runIdParam ||
                j.runId === runIdParam ||
                j.sessionid === runIdParam
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
          setSelectedJob((prev) => prev || jobsData.jobs[0]);
        }

        const searchesRes = await fetch(`${API_BASE_URL}/userjobs/searches/${userId}`, {
          method: "GET",
          credentials: "include",
        });
        const searchesData = await searchesRes.json();
        if (searchesRes.ok) setRecentSearches(searchesData.savedSearches || []);

        // FETCH APPLIED JOBS
        try {
          const appliedRes = await fetch(`${API_BASE_URL}/applied-jobs/user/${userId}`, {
            method: "GET",
            credentials: "include",
          });
          const appliedData = await appliedRes.json();
          if (appliedData.success && Array.isArray(appliedData.jobs)) {
            // Collect all possible IDs to ensure matching works
            const ids = new Set(
              appliedData.jobs
                .map((j) => j.jobid || j.jobId || j.id)
                .filter(Boolean)
            );
            setAppliedJobIds(ids);
          }
        } catch (err) {
          console.warn("[JobFound] Failed to fetch applied jobs:", err);
        }
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

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredJobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 240,
    overscan: 8,
  });

  // ✅ Reset selected jobs when search/session changes
  useEffect(() => {
    setSelectedJobs([]);
  }, [activeSearch]);


  // toggle selection stores/removes the job UUID (job.jobid || job.jobId)
  const toggleJobSelection = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const pollForConfirmation = async (jobUUID) => {
    let attempts = 0;
    const maxAttempts = 50; // 50 * 3s = 150 seconds
    let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
    while (API_BASE_URL.endsWith("/")) API_BASE_URL = API_BASE_URL.slice(0, -1);

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`${API_BASE_URL}/applied-jobs/check/${jobUUID}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (data.exists && data.job?.email_to && data.job?.email_subject) {
          console.log("✅ Polling confirmed: Job data ready:", data.job);
          return true;
        }
      } catch (e) {
        // ignore transient errors
      }
      await new Promise((r) => setTimeout(r, 3000));
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
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  };

  // FULL updated applyJobs: always send job.jobid (UUID) to n8n, poll until DB has email_to & email_subject, then redirect
  const applyJobs = async (jobsToApply) => {
    if (!jobsToApply.length) {
      setAlertState({ severity: "warning", message: "No jobs selected!" });
      return;
    }

    setApplying(true);
    setResponseMessage("Your job is under processing...");

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://n8n.techm.work.gd/webhook/apply-jobs";
    let lastJobUUID = null;
    let successCount = 0;
    let failCount = 0;

    try {
      // Send each selected job to n8n, but ensure we send the UUID field only (jobid/jobId/id)
      for (let i = 0; i < jobsToApply.length; i++) {
        const job = jobsToApply[i];

        // Prefer the UUID-style field — jobid is the canonical field in your setup
        const jobUUID = job.jobid || job.jobId || job.id;
        if (!jobUUID) {
          console.error("❌ Job missing UUID (jobid/jobId/id):", job);
          failCount++;
          continue;
        }

        const payload = {
          jobid: jobUUID, // ensure the UUID is present and named jobid
          ...job, // include rest but explicit jobid above ensures consistency
          userId: user?.userId,
          trackingId: user?.userId,
        };

        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error(`Failed to send job ${i + 1}`, result);
          failCount++;
          continue;
        }

        successCount++;
        lastJobUUID = jobUUID;

        // small delay to avoid burst
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (successCount === 0) {
        setAlertState({
          severity: "error",
          message: "No jobs could be processed. Please try again.",
        });
        setApplying(false);
        setResponseMessage("");
        return;
      }

      if (lastJobUUID) {
        setResponseMessage("Waiting for N8N to prepare job email...");

        // Poll the backend until the job (identified by jobid UUID) has email_to & email_subject
        let attempts = 0;
        const MAX_ATTEMPTS = 60; // 60 * 2s = 120s
        let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        API_BASE_URL = API_BASE_URL.replace(/\/+$/, "");

        while (attempts < MAX_ATTEMPTS) {
          try {
            const check = await fetch(`${API_BASE_URL}/applied-jobs/check/${lastJobUUID}`, {
              method: "GET",
              credentials: "include",
            });
            const data = await check.json();

            if (data.exists && data.job?.email_to && data.job?.email_subject) {
              console.log("🎉 Email details ready — redirecting…");
              setResponseMessage("Redirecting to application…");
              await new Promise((r) => setTimeout(r, 1200));
              router.push(`/apply?jobid=${lastJobUUID}`);
              return;
            }
          } catch (err) {
            console.warn("Polling error:", err.message || err);
          }

          await new Promise((r) => setTimeout(r, 2000));
          attempts++;
        }

        setAlertState({
          severity: "error",
          message: "Job email could not be prepared in time. Try again.",
        });
        setApplying(false);
        setResponseMessage("");
        return;
      }
    } catch (err) {
      console.error("Error applying:", err);
      setAlertState({ severity: "error", message: "Unexpected error. Try again." });
      setApplying(false);
      setResponseMessage("");
    }
  };

  // ✅ Normalize & deduplicate jobs for saved searches
  const normalizeJobs = (jobsArray = []) => {
    const map = new Map();

    jobsArray.forEach((item) => {
      if (item?.jobs && Array.isArray(item.jobs)) {
        item.jobs.forEach(addJob);
      } else {
        addJob(item);
      }
    });

    function addJob(job) {
      const uuid = job?.jobid || job?.jobId || job?.id || job?._id;
      if (!uuid) return;
      map.set(uuid, job);
    }

    return Array.from(map.values());
  };

  const handleSearchSelect = (search) => {
    console.log("🔍 Saved search clicked:", search);

    if (search === "All Jobs") {
      setFilteredJobs(userJobs);
      setActiveSearch("All Jobs");
      setCurrentSession(null);
      return;
    }

    // 🔥 IMPORTANT FIX
    if (!search?.runId) {
      console.warn("⚠️ Saved search has no runId:", search);
      setFilteredJobs([]);
      return;
    }

    const matchedJobs = userJobs.filter((job) => {
      return (
        job.runId === search.runId ||
        job.sessionId === search.runId ||
        job.sessionid === search.runId
      );
    });

    console.log("🆔 Search runId:", search.runId);
    console.log("📦 Matched jobs count:", matchedJobs.length);

    setFilteredJobs(matchedJobs);
    setActiveSearch(search.name);
    setCurrentSession(null);
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

  const handleDeleteSearch = async (searchName) => {
    if (!confirm(`Are you sure you want to delete "${searchName}"?`)) return;

    // ✅ Optimistic UI update
    setRecentSearches((prev) =>
      prev.filter((s) => s.name !== searchName)
    );

    if (activeSearch === searchName) {
      handleSearchSelect("All Jobs");
    }

    try {
      let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      API_BASE_URL = API_BASE_URL.replace(/\/+$/, "");

      const res = await fetch(
        `${API_BASE_URL}/userjobs/searches/${encodeURIComponent(searchName)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete search");
      }

      setAlertState({ severity: "success", message: "Search deleted" });
    } catch (err) {
      setAlertState({ severity: "error", message: err.message });
    }
  };

  const startRenaming = (e, searchName) => {
    e.stopPropagation();
    setEditingSearch(searchName);
    setRenameValue(searchName);
  };

  const cancelRenaming = (e) => {
    e?.stopPropagation();
    setEditingSearch(null);
    setRenameValue("");
  };

  const handleRenameSearch = async (e, oldName) => {
    e.stopPropagation();
    if (!renameValue.trim() || renameValue === oldName) {
      cancelRenaming();
      return;
    }

    try {
      let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      while (API_BASE_URL.endsWith("/")) API_BASE_URL = API_BASE_URL.slice(0, -1);

      const res = await fetch(`${API_BASE_URL}/userjobs/searches/${oldName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newName: renameValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rename");

      setRecentSearches(data.savedSearches || []);
      if (activeSearch === oldName) {
        setActiveSearch(renameValue);
      }
      setEditingSearch(null);
      setAlertState({ severity: "success", message: "Search renamed" });
    } catch (err) {
      console.error(err);
      setAlertState({ severity: "error", message: err.message });
    }
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
      <Sidebar isOpen={sidebarOpen} recentSearches={recentSearches} onSelectSearch={handleSearchSelect} />

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
            <h2 className="text-md font-bold text-green-400 mb-2  px-3 pt-1.5">Saved Searches</h2>
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
                recentSearches.map((search, idx) => {
                  const isActive = activeSearch === search.name;
                  const isEditing = editingSearch === search.name;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center rounded-md border transition overflow-hidden group ${isActive
                        ? "bg-green-700/50 border-green-600 text-green-200"
                        : "bg-green-700/20 border-green-700 text-green-300 hover:bg-green-700/40"
                        }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center px-2 py-1 gap-1">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0b0f0e] border border-green-600 rounded px-1 py-0.5 text-xs text-white focus:outline-none w-32"
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleRenameSearch(e, search.name)}
                            className="p-1 hover:text-green-400"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={cancelRenaming}
                            className="p-1 hover:text-red-400"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSearchSelect(search)}
                            className="px-3 py-2 text-sm text-left truncate max-w-[150px]"
                          >
                            {search.name} <span className="text-xs opacity-70">({userJobs.filter(j =>
                              j.runId === search.runId ||
                              j.sessionId === search.runId
                            ).length})
                            </span>
                          </button>

                          {/* Edit/Delete Actions - visible on hover or if active */}
                          <div className={`flex items-center px-1 border-l border-green-800/50 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                            <button
                              onClick={(e) => startRenaming(e, search.name)}
                              className="p-1.5 hover:text-white text-green-400/70"
                              title="Rename"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSearch(search.name);
                              }}
                              className="p-1.5 hover:text-red-400 text-red-500/70"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-xs italic mt-2">No saved searches yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4 w-full">
          <h2 className="text-md font-bold text-green-400 mb-2 px-3">Recent Sessions</h2>
          <div className="flex flex-wrap gap-2 px-3">
            {sessions.length > 0 ? (
              sessions.map((session, idx) => {
                const displayName = session.sessionName || new Date(session.timestamp).toLocaleString();
                const isActive = activeSearch === `Session: ${displayName}`;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSessionSelect(session)}
                    className={`px-3 py-1 rounded-md text-xs border transition ${isActive ? "bg-green-700/50 border-green-600 text-green-200" : "bg-green-700/10 border-green-800 text-green-400 hover:bg-green-700/30"
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
            onClick={() =>
              applyJobs(
                // map selected UUIDs back to job objects
                userJobs.filter((j) => {
                  const uuid = j.jobid || j.jobId || j.id;
                  return selectedJobs.includes(uuid);
                })
              )
            }
            disabled={!selectedJobs.length || applying}
            className={`px-3 py-2 text-sm rounded-md border transition flex items-center gap-2 ${selectedJobs.length && !applying ? "bg-green-700/30 border-green-700 text-green-300 hover:bg-green-700/50" : "bg-gray-700/20 border-gray-600 text-gray-500 cursor-not-allowed"
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

        <div className="flex flex-col lg:flex-row lg:h-[75vh] border border-green-800 rounded-lg overflow-hidden mt-6">
          {/* Job List */}
          <div
            ref={parentRef}
            className="w-full lg:w-1/3 m-0 lg:m-2 overflow-y-auto no-scrollbar
             max-h-[40vh] lg:max-h-full p-4 lg:p-0
             border-b lg:border-b-0 lg:border-r border-green-800/50"
          >
            {filteredJobs.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">No jobs found.</div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const job = filteredJobs[virtualRow.index];

                  const jobUUID =
                    job.jobid || job.jobId || job.id || job._id || virtualRow.index;

                  const isSelected = selectedJobs.includes(jobUUID);
                  const isApplied = appliedJobIds.has(jobUUID);
                  const title = job.Title || job.title || "(No title)";
                  const description =
                    job.Description ||
                    job.descriptionText ||
                    job.descriptionHtml ||
                    "No description available.";
                  const location = job.Location || job.location || "";
                  const postedAt =
                    job.postedAt || job.datePosted || job.createdAt || null;

                  return (
                    <div
                      key={jobUUID}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {/* 🔽 SAME CARD UI — UNCHANGED */}
                      {/* JOB CARD */}
                      <div
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer
                          min-h-[230px] flex flex-col justify-between
                          ${isSelected
                            ? "bg-green-900/30 border-green-500 shadow-[0_0_0_1px_#22c55e]"
                            : "bg-[#0e1513] border-[#1b2b27] hover:border-green-700"
                          }`}
                        onClick={() => !isApplied && toggleJobSelection(jobUUID)}
                      >
                        {/* HEADER */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold text-green-400 leading-snug line-clamp-2">
                            {title}
                          </h3>

                          {isApplied ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                              bg-green-900/40 border border-green-700 text-green-400 shrink-0">
                              <CheckCircle size={13} />
                              Applied
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleJobSelection(jobUUID)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 accent-green-500 cursor-pointer mt-1"
                            />
                          )}
                        </div>

                        {/* SKILLS / DESCRIPTION */}
                        <p
                          className="mt-2 text-sm text-gray-400 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: description }}
                        />

                        {/* META */}
                        <div className="mt-3 text-xs text-gray-400 space-y-1">
                          {location && <div>📍 {location}</div>}
                          <div>
                            Posted:{" "}
                            {postedAt ? new Date(postedAt).toLocaleDateString() : "Unknown"}
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(job);
                            }}
                            className="flex-1 px-3 py-2 text-sm rounded-md
                              bg-green-700/20 border border-green-700
                              text-green-300 hover:bg-green-700/40 transition"
                          >
                            View Details
                          </button>

                          {job.link && (
                            <a
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-2 text-sm rounded-md
                                bg-[#12201c] border border-green-800
                                text-green-400 hover:bg-green-900/30 transition"
                            >
                              Apply →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* Job Details */}
          <div className="w-full lg:w-2/3 p-6 overflow-y-auto no-scrollbar bg-[#0b0f0e] min-h-[50vh] lg:min-h-auto">
            {selectedJob ? (
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-3">{selectedJob.Title || selectedJob.title}</h3>

                <div className="space-y-2 text-sm max-h-[65vh] overflow-y-auto">
                  {Object.keys(selectedJob).map((key) => {
                    if (["_id", "__v"].includes(key)) return null;
                    return (
                      <div key={key}>
                        <span className="font-semibold text-green-300">{key}: </span>
                        {key === "link" || key === "applyUrl" ? (
                          <a href={selectedJob[key]} target="_blank" rel="noopener noreferrer" className="text-green-400 underline">
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
                    <a href={selectedJob.link} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-black px-5 py-2 rounded-md hover:bg-green-500 transition font-semibold">
                      Go to Job
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-center mt-10">Select a job to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobFound() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0f0d] text-green-500">Loading search parameters...</div>}>
      <JobFoundContent />
    </Suspense>
  );
}
