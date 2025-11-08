"use client";

import { useState, useEffect } from "react";
import LocationDropdown from "../../components/LocationDropdown";
import { Loader2 } from "lucide-react";
import UserNavbar from "./Navbar";
import Sidebar from "./Sidebar";
import SaveSearchPage from "../save-search/page"; // ✅ Import your modal
import { useRouter } from "next/navigation";

export default function UserPanel() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [response, setResponse] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(100);
  const [countError, setCountError] = useState("");
  const [saveSearchModalOpen, setSaveSearchModalOpen] = useState(false); // ✅ Modal toggle

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ✅ Fetch user and jobs
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch user");
        setUser(data.user);

        if (data.user?.userId) {
          const jobRes = await fetch(
            `${API_BASE_URL}/api/userjobs/${data.user.userId}`,
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

  // ✅ Handle job fetch
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const num = Number(count);

    if (!Number.isFinite(num) || num < 100 || num > 1000) {
      setCountError("Count must be between 100–1000");
      return;
    }

    setCountError("");
    setLoading(true);
    setError(null);
    setSaveSearchModalOpen(true); // ✅ Open save-search modal immediately

    try {
      // Check active plan
      const planRes = await fetch(`${API_BASE_URL}/api/payment/check`, {
        credentials: "include",
      });
      const planData = await planRes.json();

      if (!planData.hasPlan) {
        setLoading(false);
        router.push("/pages/price");
        return;
      }

      const prompt = `
        Job Title: ${jobTitle}
        Location: ${location}
        LinkedIn: ${linkedin}
        GitHub: ${github}
        Count: ${num}
      `;

      const res = await fetch(`${API_BASE_URL}/api/userjobs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Server error while enqueuing job");

      const data = await res.json();
      setResponse(data);

      // Fetch updated jobs
      if (user?.userId) {
        const jobRes = await fetch(
          `${API_BASE_URL}/api/userjobs/${user.userId}`,
          { credentials: "include" }
        );
        const jobData = await jobRes.json();
        setUserJobs(jobData.jobs || []);
      }
    } catch (err) {
      console.error("❌ Error submitting job:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Main UI
  return (
    <div className="relative min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center px-4 pb-20">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      {/* Header */}
      <div className="text-center mt-24 mb-10">
        <h2 className="text-gray-400 tracking-wide text-lg">
          Connect your profiles and let AI find the right opportunities for you
        </h2>
        <div className="w-24 h-[2px] bg-green-500 mx-auto mt-3"></div>
      </div>

      {/* Form */}
      <div className="bg-[#1F2937] shadow-[0_0_15px_#00ff9d33] border border-[#1b2b27] rounded-xl w-full max-w-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Job Title */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Job Title</label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Count */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Count</label>
            <input
              type="number"
              value={count}
              onChange={(e) => {
                const raw = e.target.value;
                setCount(raw === "" ? "" : Number(raw));
                const num = Number(raw);
                if (raw === "" || !Number.isFinite(num))
                  setCountError("Please enter a number");
                else if (num < 100) setCountError("Minimum allowed is 100");
                else if (num > 1000) setCountError("Maximum allowed is 1000");
                else setCountError("");
              }}
              min={100}
              max={1000}
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {countError && (
              <p className="mt-1 text-xs text-red-400">{countError}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Location</label>
            <div className="[&_*]:!text-sm py-2">
              <LocationDropdown
                value={location}
                onChange={(val) => setLocation(val)}
                placeholder="Search city, area, or PIN"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              required
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="Paste your LinkedIn profile link"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* GitHub */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              GitHub Profile URL
            </label>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="Paste your GitHub profile link"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || Boolean(countError) || count === ""}
            className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-green-300 text-black font-semibold py-2 rounded-md transition-all duration-300 shadow-[0_0_20px_#00ff9d55] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>Find Opportunities Now</>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 mt-2">Error: {error}</p>}

      {/* Save Search Modal (visible during loading or manual trigger) */}
      {saveSearchModalOpen && (
        <SaveSearchPage
          filteredJobs={userJobs}
          API_BASE_URL={API_BASE_URL}
        />
      )}

      {/* Saved Jobs */}
      <div className="mt-10 w-full max-w-6xl h-[80vh] overflow-y-auto p-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-green-400 font-semibold">Your Saved Jobs:</h3>

          {/* Manual open */}
          <button
            onClick={() => setSaveSearchModalOpen(true)}
            className="px-3 py-2 text-sm rounded-md bg-green-700/30 border border-green-700 text-green-300 hover:bg-green-700/50 transition"
          >
            Save This Search
          </button>
        </div>

        {userJobs.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {userJobs.map((job, idx) => (
              <div key={idx} className="relative">
                <div
                  className="p-4 bg-[#0e1513] border border-[#1b2b27] rounded-md shadow-inner shadow-[#00ff9d22] cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <h4 className="text-green-300 font-semibold mb-1">
                    {job.Title}
                  </h4>
                  <p className="text-sm text-gray-400">{job.Location}</p>
                  {job.link && (
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 underline text-sm mt-2 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Full Job
                    </a>
                  )}
                </div>

                {isOpen && (
                  <div className="mt-2 p-4 bg-[#1f2937] border border-[#2a3a2e] rounded-md shadow-inner shadow-[#00ff9d33] relative z-10">
                    {Object.keys(job).map((key) => {
                      if (["_id", "__v"].includes(key)) return null;
                      return (
                        <div key={key} className="mb-2">
                          <span className="font-semibold text-green-300">
                            {key}:{" "}
                          </span>
                          {key === "link" || key === "applyUrl" ? (
                            <a
                              href={job[key]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 underline"
                            >
                              {job[key]}
                            </a>
                          ) : (
                            <span className="text-gray-300">{job[key]}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No jobs available for the current user.
          </p>
        )}
      </div>
    </div>
  );
}
