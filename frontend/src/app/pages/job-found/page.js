"use client";
import { useState, useEffect } from "react";
import Sidebar from "../userpanel/Sidebar";
import UserNavbar from "../userpanel/Navbar";

/**
 * JobFound.jsx
 *
 * - All category values are driven by userCategories from the backend.
 * - No hard-coded default category list (per your request).
 * - "Make new category..." is an option inside the filter <select>.
 *   Choosing it reveals an inline input to create a category.
 * - Improved debugging (console.debug + clearer client-side error captures).
 * - Uses the consolidated route under /api/userjobs/categories/:userId
 *
 * Note: Backend endpoints expected:
 *  GET  /api/userjobs/:userId                   -> fetch user jobs
 *  PUT  /api/userjobs/update-category/:jobId    -> update a job's category (returns updated job)
 *  GET  /api/userjobs/categories/:userId        -> fetch user custom categories
 *  POST /api/userjobs/categories/:userId        -> add a new category for user
 */

export default function JobFound() {
  const [userJobs, setUserJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // User-driven categories
  const [userCategories, setUserCategories] = useState([]);
  // Controls the inline "create new category" UI
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  // Small UI-level feedback for category actions
  const [categoryActionMsg, setCategoryActionMsg] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchUserAndJobs = async () => {
      setLoading(true);
      setError("");
      setCategoryActionMsg("");
      try {
        console.debug("[JobFound] fetching logged-in user -> GET /api/auth/me");
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          const msg = data?.message || `Auth fetch failed: ${res.status}`;
          console.error("[JobFound] /api/auth/me error:", msg, data);
          throw new Error(msg);
        }
        console.debug("[JobFound] logged in user:", data?.user);
        setUser(data.user);

        if (data.user && data.user.userId) {
          // Fetch user jobs
          try {
            console.debug(`[JobFound] fetching jobs -> GET /api/userjobs/${data.user.userId}`);
            const jobRes = await fetch(
              `http://localhost:5000/api/userjobs/${data.user.userId}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const jobData = await jobRes.json();
            if (!jobRes.ok) {
              console.error("[JobFound] error fetching jobs:", jobData);
            } else {
              console.debug(`[JobFound] got ${Array.isArray(jobData.jobs) ? jobData.jobs.length : 0} jobs`);
              if (Array.isArray(jobData.jobs)) setUserJobs(jobData.jobs);
            }
          } catch (err) {
            console.error("[JobFound] network error fetching jobs:", err);
          }

          // Fetch user-defined categories
          try {
            console.debug(`[JobFound] fetching categories -> GET /api/userjobs/categories/${data.user.userId}`);
            const catRes = await fetch(
              `http://localhost:5000/api/userjobs/categories/${data.user.userId}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const catData = await catRes.json();
            if (!catRes.ok) {
              console.error("[JobFound] failed to load categories:", catData);
            } else {
              console.debug("[JobFound] loaded categories:", catData.categories);
              setUserCategories(Array.isArray(catData.categories) ? catData.categories : []);
            }
          } catch (err) {
            console.error("[JobFound] network error fetching categories:", err);
          }
        }
      } catch (err) {
        console.error("[JobFound] fatal error in fetchUserAndJobs:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle a job selection for bulk apply
  const toggleJobSelection = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  // Trigger apply webhook with selected jobs (or all)
  const applyJobs = async (jobsToApply) => {
    if (!jobsToApply || !jobsToApply.length) {
      alert("No jobs selected to apply!");
      return;
    }
    try {
      console.debug("[JobFound] calling webhook for apply:", jobsToApply.length, "jobs");
      const webhookUrl = "http://localhost:5678/webhook-test/d776d31c-a7d9-4521-b374-1e540915ed36";
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: jobsToApply }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error("[JobFound] webhook failed:", res.status, body);
        throw new Error("Failed to trigger apply workflow");
      }
      alert(`Successfully triggered apply for ${jobsToApply.length} job(s)!`);
    } catch (err) {
      console.error("[JobFound] applyJobs error:", err);
      alert("Error applying for jobs: " + (err.message || err));
    }
  };

  // Update category for a single job (persist to backend)
  const handleCategoryChange = async (jobId, newCategory) => {
    setCategoryActionMsg("");
    try {
      console.debug(`[JobFound] update-category -> PUT /api/userjobs/update-category/${jobId}`, newCategory);
      const res = await fetch(
        `http://localhost:5000/api/userjobs/update-category/${jobId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ category: newCategory }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("[JobFound] update-category server error:", res.status, data);
        throw new Error(data?.error || `Update failed with status ${res.status}`);
      }

      // Expecting the updated job to be returned as `data.job` (per earlier code)
      console.debug("[JobFound] category update returned:", data.job);
      setUserJobs((prev) => prev.map((j) => (j._id === jobId ? data.job : j)));
      setCategoryActionMsg("Category saved.");
      setTimeout(() => setCategoryActionMsg(""), 2000);
    } catch (err) {
      console.error("[JobFound] handleCategoryChange error:", err);
      setCategoryActionMsg(`Failed to save category: ${err.message || err}`);
      // show in UI briefly
      setTimeout(() => setCategoryActionMsg(""), 5000);
    }
  };

  // Add a new category for the user (backend persists it on the user doc)
  const handleCreateNewCategory = async (categoryName) => {
    if (!categoryName || !categoryName.trim()) {
      setCategoryActionMsg("Category name cannot be empty.");
      return;
    }
    if (!user?.userId) {
      setCategoryActionMsg("You must be logged in to create categories.");
      return;
    }

    const trimmed = categoryName.trim();
    setCategoryActionMsg("Creating category...");
    try {
      console.debug(`[JobFound] POST /api/userjobs/categories/${user.userId} , body:`, trimmed);
      const res = await fetch(
        `http://localhost:5000/api/userjobs/categories/${user.userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ category: trimmed }),
        }
      );

      let body;
      try {
        body = await res.json();
      } catch (parseErr) {
        const text = await res.text();
        console.error("[JobFound] create category - non-json response:", text);
        throw new Error(`Server returned non-JSON response: ${text}`);
      }

      if (!res.ok) {
        console.error("[JobFound] create category failed:", res.status, body);
        const msg = body?.error || body?.message || `Failed to add category (status ${res.status})`;
        throw new Error(msg);
      }

      // Success: update UI categories list
      const updatedCategories = Array.isArray(body.categories) ? body.categories : [];
      console.debug("[JobFound] create category success, new categories:", updatedCategories);
      setUserCategories(updatedCategories);
      setCreatingCategory(false);
      setNewCategoryInput("");
      setFilterCategory(trimmed); // auto-filter to the new category
      setCategoryActionMsg("Category created.");
      setTimeout(() => setCategoryActionMsg(""), 2000);
    } catch (err) {
      console.error("[JobFound] handleCreateNewCategory error:", err);
      setCategoryActionMsg(`Failed to add category: ${err.message || err}`);
      // keep creatingCategory true so user can retry
      setTimeout(() => setCategoryActionMsg(""), 6000);
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

  // Filter jobs according to chosen user category (empty = all)
  const filteredJobs = filterCategory ? userJobs.filter((job) => job.category === filterCategory) : userJobs;

  return (
    <div className="flex min-h-screen bg-[#0b0f0e] text-white">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 p-6 md:p-10">
        <div className="flex justify-between items-center mt-3">
          <h2 className="text-2xl font-bold text-green-400 mb-6 border-b border-green-900 pb-2 pt-10">
            Your Saved Jobs
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const jobsToApply = userJobs.filter((job) => selectedJobs.includes(job._id));
                applyJobs(jobsToApply);
              }}
              className={`px-3 py-2 text-sm rounded-md border transition ${selectedJobs.length > 0
                ? "bg-green-700/30 border-green-700 text-green-300 hover:bg-green-700/50"
                : "bg-gray-700/20 border-gray-600 text-gray-500 cursor-not-allowed"
                }`}
              disabled={!selectedJobs.length}
            >
              Apply Now ({selectedJobs.length})
            </button>

            <button
              className="px-3 py-2 text-sm rounded-md bg-green-700/20 border border-green-700 text-green-300 hover:bg-green-700/40 transition"
              onClick={() => applyJobs(userJobs)}
            >
              Apply All
            </button>
          </div>
        </div>

        {/* Category filter + "Make new category..." option */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Filter by Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__make_new__") {
                  // show inline create UI
                  setCreatingCategory(true);
                  setFilterCategory(""); // keep showing all until created
                } else {
                  setFilterCategory(v);
                  setCreatingCategory(false);
                }
              }}
              className="bg-[#0b0f0e] border border-green-700 text-green-300 text-sm rounded-md px-2 py-1"
            >
              <option value="">All</option>
              {/* Only use user-driven categories (no hard-coded list) */}
              {userCategories && userCategories.length > 0 && userCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {/* Provide an entry to start creating a new category */}
              <option value="__make_new__">Make new category...</option>
            </select>
          </div>

          {/* Inline create area (only shown when user chooses "Make new category..." or clicks the quick-create) */}
          <div className="flex items-center gap-2">
            {creatingCategory ? (
              <>
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="New category name"
                  className="bg-[#0b0f0e] border border-green-700 text-green-300 text-sm rounded-md px-2 py-1"
                />
                <button
                  onClick={() => handleCreateNewCategory(newCategoryInput)}
                  className="px-3 py-1 bg-green-700/30 border border-green-700 text-green-300 rounded-md hover:bg-green-700/50 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setCreatingCategory(false);
                    setNewCategoryInput("");
                    setCategoryActionMsg("");
                  }}
                  className="px-3 py-1 bg-gray-700/20 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700/30 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              // A non-intrusive "Make new category" quick trigger (optional)
              <button
                onClick={() => { setCreatingCategory(true); setNewCategoryInput(""); }}
                className="px-3 py-1 bg-green-700/10 border border-green-700 text-green-300 rounded-md hover:bg-green-700/30 transition text-sm"
              >
                Make new category
              </button>
            )}
            {/* small status area */}
            {categoryActionMsg && <div className="text-xs text-gray-300 ml-2">{categoryActionMsg}</div>}
          </div>
        </div>

        {/* Jobs grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, idx) => {
              const isSelected = selectedJobs.includes(job._id);
              // Job fields may be camel-cased or differently cased in DB; keep original properties
              const title = job.Title || job.title || "(No title)";
              const location = job.Location || job.location || "";
              const description = job.Description || job.descriptionText || job.descriptionHtml || "No description available.";

              return (
                <div
                  key={job._id || idx}
                  className={`p-5 border rounded-xl shadow-lg transition-all cursor-pointer ${isSelected
                    ? "bg-green-900/20 border-green-500"
                    : "bg-[#111a17] border-[#1f2d2a] hover:border-green-800"
                    }`}
                  onClick={() => toggleJobSelection(job._id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-green-300 font-semibold mb-1 truncate">{title}</h4>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleJobSelection(job._id)}
                      className="accent-green-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <p className="text-gray-400 text-sm mb-2">{location}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{description}</p>

                  {/* Category selector: only user categories + an "Uncategorized" fallback */}
                  <div className="mt-3 flex items-center justify-between">
                    <label className="text-xs text-gray-400">Category:</label>
                    <select
                      value={job.category || "Uncategorized"}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleCategoryChange(job._id, v);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#0b0f0e] border border-green-700 text-green-300 text-xs rounded-md px-2 py-1"
                    >
                      {/* Keep a minimal fallback so every job can be "Uncategorized" */}
                      <option value="Uncategorized">Uncategorized</option>

                      {/* Only show categories that the user created / owns */}
                      {userCategories && userCategories.length > 0 && userCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="mt-3 px-3 py-1 text-sm rounded-md bg-green-700/20 border border-green-700 text-green-300 hover:bg-green-700/40 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                    }}
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">No jobs available for the current user.</p>
        )}
      </div>

      {/* Modal View */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-[#13201c] border border-green-900 rounded-xl w-11/12 md:w-2/3 lg:w-1/2 p-6 shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-green-400 text-lg"
              onClick={() => setSelectedJob(null)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-green-400 mb-3">{selectedJob.Title || selectedJob.title}</h3>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {Object.keys(selectedJob).map((key) => {
                if (["_id", "__v"].includes(key)) return null;
                return (
                  <div key={key} className="text-sm">
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
              <div className="mt-6 text-center">
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
        </div>
      )}
    </div>
  );
}
