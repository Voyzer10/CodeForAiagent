"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { Loader2, CheckCircle, Pencil, Trash2, X, Check, Building2, MapPin, Clock, Briefcase, ChevronRight, Bookmark, History, AlertCircle, ArrowLeft } from "lucide-react";
import Sidebar from "../userpanel/Sidebar";
import UserNavbar from "../userpanel/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import Alert from "../../components/Alert"; // Imported Alert
import JobDetailsPanel from "../../components/JobDetailsPanel";

const JobListItemSkeleton = () => (
  <div className="px-4 py-3">
    <div className="group relative p-4 rounded-xl border border-[#1b2b27] bg-[#0c1210] flex flex-row items-start gap-4 animate-pulse">
      {/* 1. Left: Company Logo Skeleton */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/5 border border-green-500/10"></div>

      {/* 2. Middle: Content Skeleton */}
      <div className="flex-1 min-w-0 pr-12 pb-6">
        <div className="flex flex-wrap items-start gap-2 mb-2">
          <div className="h-4 bg-green-500/10 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-800/50 rounded w-16 mb-1"></div>
        </div>
        <div className="h-3 bg-gray-800/50 rounded w-1/2 mb-5"></div>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-gray-800/50"></div>
              <div className="h-2 bg-gray-800/40 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Actions / Selection Skeleton */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-4 h-[calc(100%-32px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-4 h-4 rounded bg-gray-800/50"></div>
          <div className="w-6 h-6 rounded bg-gray-800/50"></div>
        </div>
        <div className="mt-auto h-3 bg-gray-800/50 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const JobListItem = ({
  job,
  jobUUID,
  isSelected,
  isApplied,
  isSaved,
  error,
  onToggleSave,
  selectedJob,
  setSelectedJob,
  toggleJobSelection,
  virtualRow,
  rowVirtualizer
}) => {
  const title = job.Title || job.title || "(No title)";
  const company = job.Company || job.companyName || "Unknown Company";
  const salary = job.Salary || job.salary || null;
  const location = job.Location || job.location || "Remote";
  const postedAt = job.postedAt || job.datePosted || job.createdAt || null;
  const isActivelyHiring = job.benefits?.includes("Actively Hiring") || job.isActivelyHiring;

  // Only one badge: Applied takes priority
  const showAppliedBadge = isApplied;
  const showActivelyHiringBadge = !isApplied && isActivelyHiring;

  return (
    <div
      ref={rowVirtualizer.measureElement}
      key={jobUUID}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow.start}px)`,
      }}
      className="px-4 py-3"
    >
      <div
        className={`group relative p-4 rounded-xl border transition-all duration-300
          flex flex-col sm:flex-row items-start gap-4 cursor-pointer min-h-[150px] sm:min-h-0
          ${isSelected
            ? "bg-green-900/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.05)]"
            : selectedJob === job
              ? "bg-green-900/5 border-green-600/40"
              : "bg-[#0c1210] border-[#1b2b27] hover:border-green-800/60 hover:bg-[#111a17]"
          }`}
        onClick={() => setSelectedJob(job)}
      >
        {/* 1. Left: Company Logo */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-900/10 border border-green-800/30 flex items-center justify-center text-green-400 group-hover:scale-105 transition-transform overflow-hidden bg-white/5 relative">
          {job.company?.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={job.company.logo}
              alt={job.company?.name || company}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            style={{ display: job.company?.logo ? 'none' : 'flex' }}
            className="w-full h-full items-center justify-center"
          >
            <Building2 size={24} />
          </div>
        </div>

        {/* 2. Middle: Content */}
        <div className="flex-1 min-w-0 pr-12 pb-6 text-left">
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <h3 className="text-[16px] font-bold text-white group-hover:text-green-400 transition-colors leading-tight line-clamp-2 break-words">
              {title}
            </h3>
            <div className="flex flex-wrap gap-1.5 shrink-0 pt-0.5">
              {showAppliedBadge ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded bg-green-500/10 border border-green-500/20 text-green-400 whitespace-nowrap">
                  <CheckCircle size={10} />
                  Applied
                </span>
              ) : showActivelyHiringBadge ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 whitespace-nowrap">
                  Actively Hiring
                </span>
              ) : null}
            </div>
          </div>

          <div className="text-[13px] font-medium text-gray-400 mb-4 truncate">{job.company?.name || company}</div>

          {error && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle size={16} />
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          {/* GRID BASED META - AUTO ADAPTIVE */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">{location}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Briefcase size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">{job.EmploymentType || job.jobType || "Full-time"}</span>
            </div>
            {salary && (
              <div className="flex items-center gap-2 min-w-0 font-medium text-green-400/90">
                <span className="text-gray-500 text-[10px] font-normal">$</span>
                <span className="text-[11px] truncate">{salary}</span>
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">
                {postedAt ? new Date(postedAt).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Actions / Selection - FIXED TOP RIGHT */}
        <div className="absolute top-4 right-4 flex flex-col items-center gap-4 h-[calc(100%-32px)]">
          <div className="flex flex-col items-center gap-3">
            {!isApplied && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleJobSelection(jobUUID)}
                onClick={(e) => e.stopPropagation()}
                title="Select for application"
                className="w-4 h-4 rounded accent-green-500 border-green-800/50 cursor-pointer"
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job);
              }}
              title="Save this job"
              className={`p-1.5 rounded-md transition-all ${isSaved ? 'text-green-400 bg-green-400/10' : 'text-gray-500 hover:text-green-400 hover:bg-green-400/5'}`}
            >
              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>

          <button
            className="text-[12px] font-semibold text-green-400/70 hover:text-green-400 flex items-center gap-0.5 transition-colors mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedJob(job);
            }}
          >
            View Full Job
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const JobFoundContent = () => {
  const [user, setUser] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobErrors, setJobErrors] = useState({});

  const [selectedJob, setSelectedJob] = useState(null);
  // NOTE: selectedJobs now stores UUIDs (jobid) ΓÇö consistent with n8n & DB
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [savedJobIds, setSavedJobIds] = useState(new Set()); // Γ£à Added savedJobIds state

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

        // Load saved jobs from user object
        if (userData.user?.savedJobs) {
          const ids = userData.user.savedJobs.map(sj => sj.jobid || sj.jobId || sj.id || sj._id);
          setSavedJobIds(new Set(ids));
        }

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
            console.log("≡ƒÅâ [JobFound] Filtering by runId:", runIdParam);
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
              console.log("ΓÅ│ [JobFound] Run ID not found in jobs yet. Polling...");
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
          // Only auto-select first job on Desktop to avoid hiding list on mobile
          if (window.innerWidth >= 1024) {
            setSelectedJob((prev) => prev || jobsData.jobs[0]);
          }
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
    estimateSize: () => 280, // Even larger to prevent mobile overlap
    overscan: 12,
  });

  // Γ£à Reset selected jobs when search/session changes
  useEffect(() => {
    setSelectedJobs([]);
  }, [activeSearch]);


  // Γ£à Toggle Save Job via API
  const handleToggleSave = async (job) => {
    try {
      let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      while (API_BASE_URL.endsWith("/")) API_BASE_URL = API_BASE_URL.slice(0, -1);

      const res = await fetch(`${API_BASE_URL}/userjobs/jobs/save-toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle save");

      // Update local set of IDs
      const jobUUID = job.jobid || job.jobId || job.id || job._id;
      setSavedJobIds(prev => {
        const next = new Set(prev);
        if (next.has(jobUUID)) next.delete(jobUUID);
        else next.add(jobUUID);
        return next;
      });

      setAlertState({
        severity: "success",
        message: data.message === "Job saved" ? "Job saved successfully!" : "Job removed from saved list",
      });
    } catch (err) {
      console.error("Save error:", err);
      setAlertState({ severity: "error", message: err.message });
    }
  };

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
          console.log("Γ£à Polling confirmed: Job data ready:", data.job);
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
    // 1. Check Gmail Connection (Strict Guard)
    let gmailStatus = "not_connected";
    if (user?.gmailEmail) {
      if (!user.gmailTokenExpiry) {
        gmailStatus = "expired";
      } else {
        const expiry = new Date(user.gmailTokenExpiry).getTime();
        const now = Date.now();
        if (expiry < now) {
          gmailStatus = "expired";
        } else {
          gmailStatus = "active";
        }
      }
    }

    if (!user?.gmailEmail || gmailStatus !== "active") {
      setAlertState({
        severity: "error",
        message: "Please connect your Gmail account before applying to jobs.",
      });
      setTimeout(() => {
        router.push("/pages/profile");
      }, 1500);
      return;
    }

    if (!jobsToApply.length) {
      setAlertState({ severity: "warning", message: "No jobs selected!" });
      return;
    }

    // Clear previous errors for selected jobs
    const jobIdsToClear = jobsToApply.map(j => j.jobid || j.jobId || j.id || j._id);
    setJobErrors(prev => {
      const next = { ...prev };
      jobIdsToClear.forEach(id => delete next[id]);
      return next;
    });

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

        // Prefer the UUID-style field ΓÇö jobid is the canonical field in your setup
        const jobUUID = job.jobid || job.jobId || job.id;
        if (!jobUUID) {
          console.error("Γ¥î Job missing UUID (jobid/jobId/id):", job);
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
        setResponseMessage("Waiting for AI process to prepare job email...");

        // Poll the backend until the job (identified by jobid UUID) has email_to & email_subject
        let attempts = 0;
        const MAX_ATTEMPTS = 60; // 60 * 2s = 120s
        let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

        while (attempts < MAX_ATTEMPTS) {
          try {
            // Parallel Polling: Success Check & Error Check
            const [checkRes, errorRes] = await Promise.all([
              fetch(`${API_BASE_URL}/applied-jobs/check/${lastJobUUID}`, {
                method: "GET",
                credentials: "include",
              }),
              fetch(`${API_BASE_URL}/progress/error/job/${lastJobUUID}`, {
                method: "GET",
                credentials: "include",
              })
            ]);

            // 1. Check for Errors (Fast Fail)
            const errorJson = await errorRes.json().catch(() => ({}));
            if (errorJson.hasError && errorJson.code === "EMAIL_NOT_FOUND") {
              setApplying(false);
              setResponseMessage("");
              setJobErrors(prev => ({
                ...prev,
                [lastJobUUID]: "Email not found for this job posting"
              }));
              return; // Stop applying
            }

            // 2. Check for Success
            const data = await checkRes.json().catch(() => ({}));
            if (data.exists && data.job?.email_to && data.job?.email_subject) {
              console.log("≡ƒÄë Email details ready ΓÇö redirectingΓÇª");
              setResponseMessage("Redirecting to applicationΓÇª");
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

  // Γ£à Normalize & deduplicate jobs for saved searches
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
    console.log("≡ƒöì Saved search clicked:", search);

    if (search === "All Jobs") {
      setFilteredJobs(userJobs);
      setActiveSearch("All Jobs");
      setCurrentSession(null);
      return;
    }

    // ≡ƒöÑ IMPORTANT FIX
    if (!search?.runId) {
      console.warn("ΓÜá∩╕Å Saved search has no runId:", search);
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

    console.log("≡ƒåö Search runId:", search.runId);
    console.log("≡ƒôª Matched jobs count:", matchedJobs.length);

    setFilteredJobs(matchedJobs);
    setActiveSearch(search.name);
    setCurrentSession(null);
  };



  const handleSessionSelect = (session) => {
    console.log("≡ƒòÆ [handleSessionSelect] Called with session:", session);

    const sessionId = session.sessionId;
    const sessionTime = new Date(session.timestamp).getTime();

    setCurrentSession(session);

    let sessionJobs = userJobs.filter((job) => job.sessionId === sessionId);
    console.log(`≡ƒöì Exact ID match for sessionId="${sessionId}": ${sessionJobs.length} jobs`);

    if (sessionJobs.length === 0) {
      console.warn("ΓÜá∩╕Å No jobs found by Session ID. Trying time-based matching...");
      sessionJobs = userJobs.filter((job) => {
        const jobTime = new Date(job.postedAt || job.createdAt || job.datePosted).getTime();
        if (isNaN(jobTime)) return false;

        const diff = Math.abs(jobTime - sessionTime);
        return diff < 10 * 60 * 1000;
      });
      console.log(`≡ƒòÉ Time-based match: ${sessionJobs.length} jobs found`);
    }

    setFilteredJobs(sessionJobs);
    const displayName = session.sessionName || new Date(session.timestamp).toLocaleString();
    setActiveSearch(`Session: ${displayName}`);
    console.log(`Γ£à Session "${displayName}" selected, showing ${sessionJobs.length} jobs`);
  };

  const handleDeleteSearch = async (searchName) => {
    if (!confirm(`Are you sure you want to delete "${searchName}"?`)) return;

    // Γ£à Optimistic UI update
    setRecentSearches((prev) =>
      prev.filter((s) => s.name !== searchName)
    );

    if (activeSearch === searchName) {
      handleSearchSelect("All Jobs");
    }

    try {
      let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

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
      <div className="flex min-h-screen bg-[#0b0f0e] text-white">
        <UserNavbar onSidebarToggle={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} recentSearches={recentSearches} onSelectSearch={handleSearchSelect} />

        <div className="flex-1 p-6 md:p-10 mt-14">
          <div className="flex flex-col gap-6">
            {/* Header Skeletons - Filter Pills */}
            <div className="flex flex-wrap gap-4 items-center">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-32 bg-gray-800/40 border border-gray-800/50 rounded-full animate-pulse"></div>
              ))}
            </div>

            {/* Action Bar Skeleton */}
            <div className="flex gap-3 mb-2">
              <div className="h-10 w-40 bg-gray-800/60 rounded-md border border-gray-800/50 animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-800/40 rounded-md border border-gray-800/50 animate-pulse"></div>
            </div>

            <div className="flex flex-col lg:flex-row border border-green-800/30 rounded-lg overflow-hidden h-[70vh] bg-[#0b0f0e]">
              {/* Job List Skeleton Column */}
              <div className="w-full lg:w-1/3 border-r border-green-800/30 bg-[#0b0f0e] h-full overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <JobListItemSkeleton key={i} />
                ))}
              </div>

              {/* Details Panel Skeleton Column */}
              <div className="hidden lg:block lg:w-2/3 bg-[#0c1210] p-8 space-y-10 animate-pulse">
                <div className="flex justify-between items-start border-b border-green-800/10 pb-10">
                  <div className="space-y-4 w-2/3">
                    <div className="h-4 bg-green-500/10 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-800/60 rounded w-full"></div>
                  </div>
                  <div className="h-10 w-24 bg-gray-800/40 rounded-lg"></div>
                </div>

                <div className="h-16 bg-green-900/10 border border-green-800/20 rounded-xl w-full"></div>

                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-gray-800/20 border border-gray-800/10 rounded-xl"></div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="h-6 bg-gray-800/40 rounded w-1/4"></div>
                  <div className="h-40 bg-gray-800/10 rounded-2xl w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0f0d] text-red-500 p-6 text-center">
        <X size={48} className="mb-4 text-red-600" />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#0b0f0e] text-white">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} recentSearches={recentSearches} onSelectSearch={handleSearchSelect} />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* ALERT CONTAINER */}
      {alertState && (
        <div className="fixed top-20 right-5 z-50 w-full max-w-md">
          <Alert severity={alertState.severity} onClose={() => setAlertState(null)}>
            {alertState.message}
          </Alert>
        </div>
      )}

      {/* MAIN CONTENT CONTAINER - STABLE WIDTH, NO SIDBAR SHIFT */}
      <div className="flex-1 h-screen overflow-y-auto no-scrollbar relative bg-[#0b0f0e] w-full max-w-[1600px] mx-auto">
        {/* CLEAR NAVBAR WITH COMPACT TOP MARGIN TO MATCH SKELETON */}
        <div className="flex flex-col gap-5 mt-20 lg:mt-24 px-4 lg:px-8">
          <div className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-3">
              <History size={20} className="text-green-500" />
              Saved Searches
            </h2>
            <div className="flex overflow-x-auto lg:flex-wrap gap-3 pb-2 no-scrollbar scroll-smooth w-full">
              <button
                onClick={() => handleSearchSelect("All Jobs")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold border transition-all duration-300 flex items-center gap-2 shadow-lg whitespace-nowrap ${activeSearch === "All Jobs"
                  ? "bg-[#0e1a16] text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.2)] scale-105"
                  : "bg-[#111a17] border-[#1b2b27] text-gray-400 hover:border-green-500/30 hover:bg-[#16211e]"
                  }`}
              >
                All Jobs
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeSearch === "All Jobs" ? "bg-green-500/10 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                  {userJobs.length}
                </span>
              </button>

              {recentSearches.length > 0 ? (
                recentSearches.map((search, idx) => {
                  const isActive = activeSearch === search.name;
                  const isEditing = editingSearch === search.name;

                  // Use search.jobs.length if available, else filter
                  const jobCount = Array.isArray(search.jobs)
                    ? search.jobs.length
                    : userJobs.filter(j =>
                      j.runId === search.runId ||
                      j.sessionId === search.runId ||
                      j.sessionid === search.runId ||
                      j.runId === search.sessionId ||
                      j.sessionId === search.sessionId
                    ).length;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center rounded-full border transition-all duration-300 overflow-hidden group shadow-lg ${isActive
                        ? "bg-[#0e1a16] text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.2)] scale-105"
                        : "bg-[#111a17] border-[#1b2b27] text-gray-400 hover:border-green-500/30 hover:bg-[#16211e]"
                        }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center px-4 py-1.5 gap-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black/40 border border-green-400 shadow-inner rounded-full px-3 py-1 text-xs text-white focus:outline-none w-40"
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleRenameSearch(e, search.name)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelRenaming}
                            className="p-1 hover:scale-110 transition-transform text-red-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSearchSelect(search)}
                            className="px-5 py-2.5 text-xs font-bold text-left whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] flex items-center gap-2"
                          >
                            {search.name}
                            <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-green-500/10 text-green-400" : "bg-gray-800/50 text-gray-500"}`}>
                              {jobCount}
                            </span>
                          </button>

                          <div className={`flex items-center pr-3 pl-1 border-l ${isActive ? 'border-green-800/20 opacity-100' : 'border-green-800/10 opacity-0 group-hover:opacity-100'} transition-all`}>
                            <button
                              onClick={(e) => startRenaming(e, search.name)}
                              className="p-1.5 transition-colors hover:text-white text-green-400/60"
                              title="Rename"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSearch(search.name);
                              }}
                              className="p-1.5 transition-colors hover:text-red-400 text-red-500/80"
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
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/40 rounded-full border border-gray-800/50">
                  <span className="text-gray-500 text-xs italic px-2">No saved searches yet</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Sessions Area - Hidden as per user request */}
        {false && (
          <div className="flex flex-col mt-8 w-full">
            <h2 className="text-md font-bold text-green-400 mb-3 px-3 flex items-center gap-2">
              <Clock size={16} />
              Recent Discovery Waves
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
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition ${isActive ? "bg-green-500 text-black border-green-400" : "bg-[#111a17] border-green-800/30 text-green-400 hover:bg-green-700/20"
                        }`}
                    >
                      {displayName}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-black/10' : 'bg-green-500/10'}`}>
                        {session.deducted} jobs
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-500 text-xs italic px-3">No recent data streams discovered</p>
              )}
            </div>
          </div>
        )}

        {/* COMPACT APPLY BUTTONS ROW - MATCHING SKELETON SCALE */}
        <div className="flex flex-row gap-3 mt-4 mb-5 h-10 px-4 lg:px-8">
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
            className={`flex-1 h-full px-6 text-xs lg:text-sm font-semibold rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 ${selectedJobs.length && !applying ? "bg-green-700/30 border-green-700/50 text-green-300 hover:bg-green-700/50" : "bg-gray-800/40 border-gray-700/30 text-gray-500 cursor-not-allowed"
              }`}
          >
            {applying ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <span className="truncate">Apply Now ({selectedJobs.length})</span>
            )}
          </button>

          <button
            onClick={() => applyJobs(userJobs)}
            disabled={applying}
            className="flex-1 h-full px-6 text-xs lg:text-sm font-semibold rounded-lg bg-green-700/20 border border-green-700/50 text-green-300 hover:bg-green-700/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-800/40 disabled:text-gray-500 disabled:border-gray-700/30 cursor-pointer disabled:cursor-not-allowed"
          >
            {applying ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <span className="truncate">Apply All</span>
            )}
          </button>
        </div>

        {/* Status Message Area */}
        {applying && (
          <div className="mt-8 mx-auto w-full max-w-lg p-6 bg-[#0e1614] border border-green-500/30 rounded-2xl text-green-400 text-center shadow-[0_0_40px_rgba(34,197,94,0.1)] animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-green-500/10" />
              <div className="absolute inset-0 rounded-full border-t-2 border-green-500 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-green-500/10 animate-pulse flex items-center justify-center">
                <Building2 size={24} className="text-green-500/60" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-xl tracking-wide text-white">{responseMessage}</p>
              <div className="flex flex-col gap-1 items-center">
                <p className="text-sm text-gray-400">Our AI agents are coordinating with the application servers</p>
                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-green-500/50 animate-[shimmer_2s_infinite]" style={{ width: '100%', background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)', backgroundSize: '200% 100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN DATA SECTION - RESTORED 1:2 PROPORTIONS (1/3 LIST, 2/3 DETAIL) */}
        <div className="flex flex-col lg:flex-row lg:h-[75vh] border border-green-800/30 rounded-xl overflow-hidden mt-1 mx-4 lg:mx-8 bg-[#0b0f0e] shadow-2xl mb-12">
          {/* Job List Sidebar */}
          <div
            ref={parentRef}
            className={`w-full lg:w-1/3 m-0 overflow-y-auto custom-scrollbar
             h-[60vh] lg:h-full
             border-b lg:border-b-0 lg:border-r border-green-800/20 bg-[#0b0f0e]
             ${selectedJob ? 'hidden lg:block' : 'block'}`}
          >
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-700 animate-[spin_10s_linear_infinite]" />
                <p className="font-medium">No results found in this stream.</p>
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const job = filteredJobs[virtualRow.index];
                  const jobUUID = job.jobid || job.jobId || job.id || job._id || virtualRow.index;

                  return (
                    <JobListItem
                      key={jobUUID}
                      job={job}
                      jobUUID={jobUUID}
                      virtualRow={virtualRow}
                      rowVirtualizer={rowVirtualizer}
                      isSelected={selectedJobs.includes(jobUUID)}
                      isApplied={appliedJobIds.has(jobUUID)}
                      isSaved={savedJobIds.has(jobUUID)}
                      error={jobErrors[jobUUID]}
                      onToggleSave={handleToggleSave}
                      selectedJob={selectedJob}
                      setSelectedJob={setSelectedJob}
                      toggleJobSelection={toggleJobSelection}
                    />
                  );
                })}
              </div>
            )}
          </div>


          {/* Job Details Main Area - Restored 2/3 width for visual parity with skeleton */}
          <div className={`w-full lg:w-2/3 h-full overflow-hidden bg-[#0a0f0d] border-l border-green-800/10 relative
            ${selectedJob
              ? 'block fixed inset-0 z-[60] lg:static lg:z-0'
              : 'hidden lg:block'}`}>
            <div className="absolute inset-0 overflow-hidden flex flex-col bg-[#0b0f0e] lg:relative lg:h-full">

              {/* Mobile Back Button (Visible on screens smaller than md) */}
              <div className="md:hidden p-4 border-b border-green-800/30 flex items-center bg-[#0b0f0e]">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex items-center gap-2 text-green-400 font-semibold"
                >
                  <ArrowLeft size={20} />
                  Back to Jobs
                </button>
              </div>
              {selectedJob ? (
                <JobDetailsPanel
                  job={selectedJob}
                  onApply={(job) => applyJobs([job])}
                  isApplied={appliedJobIds.has(selectedJob.jobid || selectedJob.jobId || selectedJob.id || selectedJob._id)}
                  isSaved={savedJobIds.has(selectedJob.jobid || selectedJob.jobId || selectedJob.id || selectedJob._id)}
                  onToggleSave={handleToggleSave}
                  applying={applying}
                  isUserLoading={loading}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-[#0a0f0d] p-12">
                  <div className="w-full max-w-2xl space-y-10 animate-pulse opacity-20 pointer-events-none">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4 w-2/3">
                        <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                        <div className="h-12 bg-gray-500 rounded w-full"></div>
                      </div>
                      <div className="h-10 w-24 bg-gray-600 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-700/50 rounded-xl"></div>)}
                    </div>
                    <div className="h-64 bg-gray-800/20 rounded-2xl"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[2px]">
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-green-500/40" />
                    </div>
                    <p className="text-lg font-bold text-white/40 tracking-widest uppercase">Select a job stream</p>
                    <p className="text-sm text-gray-600 mt-2 italic text-center max-w-xs">Pick any opportunity from the list to synchronize details and start your application process.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const JobFound = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#0b0f0e] text-white">
        {/* Navbar Skeleton */}
        <div className="h-20 w-full fixed top-0 border-b border-white/10 bg-[#121e12]/60 z-50"></div>

        {/* Sidebar Space (Hidden on mobile) */}
        <div className="w-72 h-full fixed left-0 border-r border-white/10 bg-[#07110f] hidden lg:block z-50 -translate-x-full"></div>

        {/* Main Content Area */}
        <div className="flex-1 h-screen overflow-hidden relative bg-[#0b0f0e] w-full max-w-[1600px] mx-auto animate-pulse">
          <div className="flex flex-col gap-5 mt-20 lg:mt-24 px-4 lg:px-8">
            {/* Header / Saved Searches Title */}
            <div className="flex flex-col gap-4">
              <div className="h-7 w-48 bg-green-500/10 rounded-md"></div>
              {/* Pills Row */}
              <div className="flex gap-3 overflow-hidden">
                <div className="h-10 w-28 bg-gray-800/40 rounded-full flex-shrink-0"></div>
                <div className="h-10 w-32 bg-gray-800/40 rounded-full flex-shrink-0"></div>
                <div className="h-10 w-24 bg-gray-800/40 rounded-full flex-shrink-0"></div>
                <div className="h-10 w-32 bg-gray-800/40 rounded-full flex-shrink-0"></div>
              </div>
            </div>

            {/* Apply Buttons Row */}
            <div className="flex gap-3 h-10 mt-4 mb-5">
              <div className="flex-1 bg-gray-800/20 border border-gray-700/20 rounded-lg"></div>
              <div className="flex-1 bg-gray-800/20 border border-gray-700/20 rounded-lg"></div>
            </div>

            {/* Main Data Split Box */}
            <div className="flex flex-col lg:flex-row border border-green-800/20 rounded-xl overflow-hidden h-[75vh] mx-0">
              {/* Job List Component */}
              <div className="w-full lg:w-1/3 border-r border-green-800/10 bg-[#0b0f0e] h-full overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <JobListItemSkeleton key={i} />
                ))}
              </div>
              {/* Job Detail Area */}
              <div className="hidden lg:block lg:w-2/3 bg-[#0a0f0d] p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 w-2/3">
                    <div className="h-4 bg-gray-800/40 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-800/40 rounded w-full"></div>
                  </div>
                  <div className="h-10 w-32 bg-gray-800/40 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-800/20 rounded-xl"></div>)}
                </div>
                <div className="h-64 bg-gray-800/10 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <JobFoundContent />
    </Suspense>
  );
};

export default JobFound;

