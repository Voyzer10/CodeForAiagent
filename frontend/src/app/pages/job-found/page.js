"use client";
import { useState, useEffect } from "react";
import Sidebar from "../userpanel/Sidebar";
import UserNavbar from "../userpanel/Navbar";

export default function JobFound() {
  const [user, setUser] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // UI / filter state
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryActionMsg, setCategoryActionMsg] = useState("");

  // Category creation
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Job selection / modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);

  // Save Search Modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Fetch all required data
  useEffect(() => {
    const fetchUserAndJobs = async () => {
      try {
        setLoading(true);
        setError("");
        setCategoryActionMsg("");

        // 1️⃣ Get user
        const userRes = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.message || "Failed to fetch user");
        setUser(userData.user);
        const userId = userData.user?.userId;
        if (!userId) throw new Error("User info missing");

        // 2️⃣ Get user jobs
        // 2️⃣ Get user jobs
        const jobsRes = await fetch(`http://localhost:5000/api/userjobs/${userId}`, {
          method: "GET",
          credentials: "include",
        });
        const jobsData = await jobsRes.json();

        if (!jobsRes.ok) {
          console.error("[JobFound] error fetching jobs:", jobsData);
          throw new Error(jobsData.message || "Failed to load jobs");
        } else {
          console.debug(
            `[JobFound] got ${Array.isArray(jobsData.jobs) ? jobsData.jobs.length : 0} jobs`
          );
          if (Array.isArray(jobsData.jobs)) {
            setUserJobs(jobsData.jobs || []);
            setFilteredJobs(jobsData.jobs || []);
          }
        }

        if (jobsData.jobs?.length > 0) setSelectedJob(jobsData.jobs[0]);
        // 3️⃣ Get categories
        const catRes = await fetch(
          `http://localhost:5000/api/userjobs/categories/${userId}`,
          { method: "GET", credentials: "include" }
        );
        const catText = await catRes.text();
        let catData;
        try {
          catData = JSON.parse(catText);
        } catch {
          catData = {};
        }
        setUserCategories(Array.isArray(catData.categories) ? catData.categories : []);

        // 4️⃣ Get saved searches
        const searchesRes = await fetch(
          `http://localhost:5000/api/userjobs/searches/${userId}`,
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

  // Filter jobs when category changes
  useEffect(() => {
    if (!filterCategory) setFilteredJobs(userJobs);
    else
      setFilteredJobs(
        userJobs.filter(
          (job) => job.category?.toLowerCase() === filterCategory.toLowerCase()
        )
      );
  }, [filterCategory, userJobs]);

  // Save current search
  const saveCurrentSearch = async () => {
    if (!newSearchName.trim()) {
      alert("Please enter a search name.");
      return;
    }

    // map jobs using flexible field names like in display
    const jobsPayload = filteredJobs.map((job) => ({
      title: job.Title || job.title || "(No title)",
      company: job.Company || job.CompanyName || job.organization || "Unknown Company",
      category: job.category || "Uncategorized",
      description: job.Description || job.descriptionText || job.descriptionHtml || "No description available",
      location: job.Location || job.location || "",
      link: job.link || job.applyUrl || ""
    }));

    try {
      const res = await fetch("http://localhost:5000/api/userjobs/searches/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newSearchName, jobs: jobsPayload }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save search");

      // backend must return savedSearch object
      setRecentSearches((prev) => [data.savedSearch, ...prev.slice(0, 9)]);
      setSaveModalOpen(false);
      setNewSearchName("");
      alert("Search saved successfully!");
    } catch (err) {
      console.error("[JobFound] saveCurrentSearch error:", err);
      alert(err.message || "Error saving search");
    }
  };


  // Category management
  const handleCreateNewCategory = async (categoryName) => {
    if (!categoryName.trim()) return;
    if (!user?.userId) return alert("You must be logged in.");

    try {
      setCategoryActionMsg("Creating category...");
      const res = await fetch(
        `http://localhost:5000/api/userjobs/categories/${user.userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ category: categoryName }),
        }
      );

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to create category");

      setUserCategories(body.categories || []);
      setCreatingCategory(false);
      setNewCategoryInput("");
      setFilterCategory(categoryName);
      setCategoryActionMsg("Category created!");
      setTimeout(() => setCategoryActionMsg(""), 2000);
    } catch (err) {
      setCategoryActionMsg(`Error: ${err.message}`);
    }
  };

  const handleCategoryChange = async (jobId, newCategory) => {
    try {
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
      if (!res.ok) throw new Error(data.error || "Failed to update category");
      setUserJobs((prev) => prev.map((j) => (j._id === jobId ? data.job : j)));
      setCategoryActionMsg("Category updated!");
      setTimeout(() => setCategoryActionMsg(""), 1500);
    } catch (err) {
      setCategoryActionMsg(`Error updating: ${err.message}`);
    }
  };

  // Job selection + apply logic
  const toggleJobSelection = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const applyJobs = async (jobsToApply) => {
    if (!jobsToApply.length) return alert("No jobs selected!");
    try {
      const webhookUrl =
        "http://localhost:5678/webhook-test/d776d31c-a7d9-4521-b374-1e540915ed36";
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: jobsToApply }),
      });
      if (!res.ok) throw new Error("Webhook failed");
      alert(`Successfully triggered apply for ${jobsToApply.length} job(s)!`);
    } catch (err) {
      alert("Error applying: " + err.message);
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

  const uniqueCategories = ["All", ...new Set(userCategories)];

  return (
    <div className="flex min-h-screen bg-[#0b0f0e] text-white">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar
        isOpen={sidebarOpen}
        recentSearches={recentSearches}
        onSelectSearch={(search) =>
          search?.jobs && setFilteredJobs(search.jobs.flatMap((j) => j.jobs || [j]))
        }
      />

      < div className="flex-1 p-6 md:p-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mt-3  ">


          {/* CATEGORY FILTER */}
          <div className="flex flex-wrap items-center gap-3  ">
            {uniqueCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setFilterCategory(cat === "All" ? "" : cat)}
                className={`px-3 py-2 text-sm rounded-md border transition ${filterCategory === cat || (cat === "All" && !filterCategory)
                  ? "bg-green-600 text-black border-green-600"
                  : "bg-[#0e1513] text-green-300 border-green-700 hover:bg-green-800/40"
                  }`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => setCreatingCategory(true)}
              className="px-3 py-2  text-sm bg-green-700/10 border border-green-700 text-green-300 rounded-md hover:bg-green-700/30 transition"
            >
              + New Category
            </button>
            {categoryActionMsg && (
              <span className="text-xs text-gray-400">{categoryActionMsg}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-green-400 mb-6 border-b border-green-900 pb-2 pt-10">
            Your Saved Jobs
          </h2>
          <div className="flex gap-3">
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
        </div>
        {/* SAVE SEARCH MODAL */}
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


        {/* NEW CATEGORY INPUT */}
        {creatingCategory && (
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Enter new category"
              className="bg-[#0b0f0e] border border-green-700 text-green-300 text-sm rounded-md px-3 py-2"
            />
            <button
              onClick={() => handleCreateNewCategory(newCategoryInput)}
              className="px-3 py-2 bg-green-600 text-black rounded-md hover:bg-green-500 transition"
            >
              Save
            </button>
            <button
              onClick={() => {
                setCreatingCategory(false);
                setNewCategoryInput("");
              }}
              className="px-3 py-2 bg-gray-700/40 text-gray-300 rounded-md hover:bg-gray-700/60 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* JOBS GRID */}
        <div className="flex h-[75vh] border border-green-800 rounded-lg overflow-hidden">
          {filteredJobs.length > 0 ? (
            <div className=" w-1/3  m-2 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 overflow-y-auto no-scrollbar">
              {filteredJobs.map((job, idx) => {
                // ✅ Handle flexible job IDs
                const jobId = job._id || job.id || job.jobId || idx;
                const isSelected = selectedJobs.includes(jobId);

                // ✅ Handle flexible field names for older jobs
                const title = job.Title || job.title || "(No title)";
                const description = job.Description || job.descriptionText || 
                // job.descriptionHtml || 
                "No description available.";
                const location = job.Location || job.location || "";
                const employmentType = job.employmentType || job.type || job.jobType || "Not specified";
                const postedAt = job.postedAt || job.datePosted || job.createdAt || null;
                // const company = job.company || job.Company || job.CompanyName || job.organization || "Unknown Company";

                console.log(job)


                return (
                  <div
                    key={job._id || idx}
                    className={`p-4 border rounded-xl shadow-md transition cursor-pointer  ${isSelected
                      ? "bg-green-900/20 border-green-500"
                      : "bg-[#0e1513] border-[#1b2b27] hover:border-green-700"
                      }`}
                    onClick={() => toggleJobSelection(jobId)}
                  >
                    {/* Title + Checkbox */}
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-green-400 truncate">
                        {title}
                      </h3>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleJobSelection(jobId)}
                        className="accent-green-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Company */}
                    {/* <p className="text-sm text-gray-400 mt-1">{company}</p> */}

                    {/* Description */}
                    <p
                      className="text-sm text-gray-500 mt-2 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: description }}
                    ></p>


                    {/* Meta Info */}
                    <div className="mt-3 text-xs text-green-300 space-y-1">
                      <div className="text-gray-400 text-sm mb-2"> {location}</div>
                      {/* <div>Type: {employmentType}</div> */}
                      <div className="text-gray-400 text-sm mb-2">
                        Posted:{" "}
                        {postedAt
                          ? new Date(postedAt).toLocaleDateString()
                          : "Unknown date"}
                      </div>
                    </div>

                    {/* Category Selector */}
                    <div className="mt-3">
                      <label className="text-xs text-gray-400">Category:</label>
                      <select
                        value={job.category || "Uncategorized"}
                        onChange={(e) => handleCategoryChange(job._id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0b0f0e] border border-green-700 text-green-300 text-xs rounded-md px-2 py-1 ml-2"
                      >
                        <option value="Uncategorized">Uncategorized</option>
                        {userCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Job Link */}
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

                    {/* View Details Button */}
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
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-10">No jobs found.</div>
          )}

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
    </div>
  );
}     