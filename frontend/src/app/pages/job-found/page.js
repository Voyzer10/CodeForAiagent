"use client";
import { useState, useEffect } from "react";
import Sidebar from "../userpanel/Sidebar";
import UserNavbar from "../userpanel/Navbar";
import { useRouter } from "next/navigation";


export default function JobFound() {
  const [user, setUser] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [sessions, setSessions] = useState([]); // ✅ Store user sessions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Track which recent search is active
  const [activeSearch, setActiveSearch] = useState("All Jobs");
  const [currentSession, setCurrentSession] = useState(null); // ✅ Track current session for renaming

  const router = useRouter();


  useEffect(() => {
    let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
    while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);
    const fetchUserAndJobs = async () => {
      try {
        setLoading(true);
        setError("");

        // 1️⃣ Get user
        const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.message || "Failed to fetch user");
        setUser(userData.user);
        const userId = userData.user?.userId;
        if (!userId) throw new Error("User info missing");

        // ✅ Extract sessions from history
        if (userData.user?.plan?.history) {
          const sortedSessions = userData.user.plan.history.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setSessions(sortedSessions);
        }

        // 2️⃣ Get user jobs (All jobs)
        const jobsRes = await fetch(`${API_BASE_URL}/userjobs/${userId}`, {
          method: "GET",
          credentials: "include",
        });
        const jobsData = await jobsRes.json();
        if (!jobsRes.ok) throw new Error(jobsData.message || "Failed to load jobs");

        if (Array.isArray(jobsData.jobs)) {
          setUserJobs(jobsData.jobs);
          setFilteredJobs(jobsData.jobs); // ✅ show all jobs initially
        }

        if (jobsData.jobs?.length > 0) setSelectedJob(jobsData.jobs[0]);

        // 3️⃣ Get saved searches
        const searchesRes = await fetch(
          `${API_BASE_URL}/userjobs/searches/${userId}`,
          { method: "GET", credentials: "include" }
        );
        const searchesData = await searchesRes.json();
        if (searchesRes.ok) setRecentSearches(searchesData.savedSearches || []);
      } catch (err) {
        console.error("[JobFound] fetch error:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndJobs();
  }, []);

  // Save current search OR Rename Session
  const saveCurrentSearch = async () => {
    if (!newSearchName.trim()) {
      alert("Please enter a name.");
      return;
    }

    // Check if we are renaming a session
    if (activeSearch.startsWith("Session: ")) {
      // Find the current session object
      // We need to store the current session object in state or derived
      // But for now, let's assume we can find it in sessions array
      // Actually, activeSearch string is "Session: <Date>" or "Session: <Name>"
      // This is brittle. Let's rely on selectedSession state if we add it, or parse.

      // Better approach: When clicking a session, store `currentSession` state.
    }

    const jobsPayload = filteredJobs.map((job) => ({
      title: job.Title || job.title || "(No title)",
      company: job.Company || job.CompanyName || job.organization || "Unknown Company",
      description:
        job.Description || job.descriptionText || job.descriptionHtml || "No description available",
      location: job.Location || job.location || "",
      link: job.link || job.applyUrl || "",
    }));

    try {
      // If it's a session rename
      if (currentSession) {
        const res = await fetch(`${API_BASE_URL}/userjobs/sessions/rename`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId: currentSession.sessionId, newName: newSearchName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to rename session");

        // Update local state
        setSessions(prev => prev.map(s => s.sessionId === currentSession.sessionId ? { ...s, sessionName: newSearchName } : s));
        setActiveSearch(`Session: ${newSearchName}`);
        setSaveModalOpen(false);
        setNewSearchName("");
        alert("Session renamed successfully!");
        return;
      }

      // Normal Save Search
      const res = await fetch(`${API_BASE_URL}/userjobs/searches/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newSearchName, jobs: jobsPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save search");

      setRecentSearches((prev) => [data.savedSearch, ...prev.slice(0, 9)]);
      setSaveModalOpen(false);
      setNewSearchName("");
      alert("Search saved successfully!");
    } catch (err) {
      console.error("[JobFound] saveCurrentSearch error:", err);
      alert(err.message || "Error saving search");
    }
  };

  const toggleJobSelection = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const applyJobs = async (jobsToApply) => {
    if (!jobsToApply.length) return alert("No jobs selected!");

    const webhookUrl = "https://n8n.techm.work.gd/webhook/apply-jobs";

    try {
      for (let i = 0; i < jobsToApply.length; i++) {
        const job = jobsToApply[i];

        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job }), // 👈 send one job at a time
        });

        if (!res.ok) {
          console.error(`Failed to send job ${i + 1}`, await res.text());
          continue;
        }

        console.log(`✅ Sent job ${i + 1}/${jobsToApply.length}`);
        await new Promise((resolve) => setTimeout(resolve, 500)); // small delay (optional)
      }

      alert(`Successfully triggered apply for ${jobsToApply.length} job(s) one by one!`);
      router.push(`/apply?jobid=${jobid}`);
    } catch (err) {
      console.error("Error applying:", err);
      alert("Error applying: " + err.message);
    }
  };


  const handleSearchSelect = (search) => {
    if (search === "All Jobs") {
      setFilteredJobs(userJobs);
      setActiveSearch("All Jobs");
      setCurrentSession(null); // Clear session when switching to saved search
    } else if (search?.jobs) {
      const flatJobs = search.jobs.flatMap((j) => j.jobs || [j]);
      setFilteredJobs(flatJobs);
      setActiveSearch(search.name);
      setCurrentSession(null); // Clear session when switching to saved search
    }
  };

  // ✅ Handle Session Selection with Fallback
  const handleSessionSelect = (session) => {
    const sessionId = session.sessionId;
    const sessionTime = new Date(session.timestamp).getTime();

    // Store the current session for potential renaming
    setCurrentSession(session);

    // 1️⃣ Try exact ID match
    let sessionJobs = userJobs.filter((job) => job.sessionId === sessionId);

    // 2️⃣ Fallback: Time-based matching (within 10 minutes) if ID match fails
    if (sessionJobs.length === 0) {
      console.warn("⚠️ No jobs found by Session ID. Trying time-based matching...");
      sessionJobs = userJobs.filter((job) => {
        // Use postedAt or createdAt (if available)
        const jobTime = new Date(job.postedAt || job.createdAt || job.datePosted).getTime();
        if (isNaN(jobTime)) return false;

        const diff = Math.abs(jobTime - sessionTime);
        return diff < 10 * 60 * 1000; // 10 minutes window
      });
    }

    setFilteredJobs(sessionJobs);
    // Use sessionName if available, otherwise use timestamp
    const displayName = session.sessionName || new Date(session.timestamp).toLocaleString();
    setActiveSearch(`Session: ${displayName}`);
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

      <div className="flex-1 p-6 md:p-10">
        {/* HEADER */}
        <div className="flex justify-between items-start flex-wrap gap-4 mt-14 ">
          {/* 🔍 Recent Searches */}
          <div className="flex ">
            <h2 className="text-md font-bold text-green-400 mb-2  px-3 pt-1.5">
              Saved Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {/* All Jobs button */}
              <button
                onClick={() => handleSearchSelect("All Jobs")}
                className={`px-4 py-2 rounded-md text-sm border transition ${activeSearch === "All Jobs"
                  ? "bg-green-700/50 border-green-600 text-green-200"
                  : "bg-green-700/20 border-green-700 text-green-300 hover:bg-green-700/40"
                  }`}
              >
                All Jobs ({userJobs.length})
              </button>

              {/* Recent searches list */}
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

        {/* 🕒 Recent Sessions (New) */}
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

        {/* 🧩 Action Buttons */}
        <div className="flex gap-3 mt-6 md:mt-0">
          <button
            onClick={() => applyJobs(userJobs.filter((j) => selectedJobs.includes(j._id)))}
            disabled={!selectedJobs.length}
            className={`px-3 py-2 text-sm rounded-md border transition ${selectedJobs.length
              ? "bg-green-700/30 border-green-700 text-green-300 hover:bg-green-700/50"
              : "bg-gray-700/20 border-gray-600 text-gray-500 cursor-not-allowed"
              }`}
          >
            Apply Now ({selectedJobs.length})
          </button>

          <button
            onClick={() => applyJobs(userJobs)}
            className="px-3 py-2 text-sm rounded-md bg-green-700/20 border border-green-700 text-green-300 hover:bg-green-700/40 transition"
          >
            Apply All
          </button>

          <button
            onClick={() => setSaveModalOpen(true)}
            className="px-3 py-2 text-sm rounded-md bg-green-700/30 border border-green-700 text-green-300 hover:bg-green-700/50 transition"
          >
            Save This Search
          </button>
        </div>

        {/* ✅ Save Search Modal */}
        {saveModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-[#13201c] border border-green-900 rounded-xl w-11/12 md:w-1/3 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-green-400 mb-4">Save This Search</h3>

              <input
                type="text"
                placeholder="Enter search name"
                value={newSearchName}
                onChange={(e) => setNewSearchName(e.target.value)}
                className="w-full px-3 py-2 mb-4 text-black rounded-md"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentSearch}
                  className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JOBS GRID + DETAIL PANEL */}
        <div className="flex h-[75vh] border border-green-800 rounded-lg overflow-hidden mt-6">
          {/* Left: Job list */}
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

          {/* Right: Job detail */}
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
