"use client";

import { useState, useEffect } from "react";
import LocationDropdown from "../../components/LocationDropdown";
import { Loader2 } from "lucide-react";
import UserNavbar from "./Navbar";
import Sidebar from "./Sidebar";
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
  const [sessionId, setSessionId] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");

  // Generate unique session ID when page loads
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Auto-close Save Search Modal after 2 minutes
  useEffect(() => {
    if (showSaveModal) {
      const timer = setTimeout(() => {
        setShowSaveModal(false);
      }, 2 * 60 * 1000); // 2 minutes
      return () => clearTimeout(timer);
    }
  }, [showSaveModal]);

  // Fetch user and jobs
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

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const num = Number(count);

    if (!Number.isFinite(num) || num < 100 || num > 1000) {
      setCountError("Count must be between 100–1000");
      return;
    }

    setCountError("");
    setError(null);
    setLoading(true);
    setShowSaveModal(true);

    try {
      // Check active plan
      const planRes = await fetch(`${API_BASE_URL}/payment/check`, {
        credentials: "include",
      });
      const planData = await planRes.json();

      if (!planData.hasPlan) {
        setLoading(false);
        router.push("/pages/price");
        return;
      }

      // NEW: Check actual credit balance
      const creditRes = await fetch(
       `${API_BASE_URL}/credits/check?userId=${user.userId}`,
        {
          credentials: "include",
        }
      );

      const creditData = await creditRes.json();

      if (!creditRes.ok) {
        setLoading(false);
        setError(creditData.message || "Failed to check credits");
        return;
      }

      if (creditData.credits < 100) {
        setLoading(false);
        alert(
          `Not enough credits! You have ${creditData.credits}. Buy credits first.`
        );
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

      const res = await fetch(`${API_BASE_URL}/userjobs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt, sessionId }),
      });

      if (!res.ok) throw new Error("Server error while enqueuing job");

      const data = await res.json();
      setResponse(data);

      if (user?.userId) {
        const jobRes = await fetch(
          `${API_BASE_URL}/userjobs/${user.userId}`,
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
      // ❌ removed auto-close timeout — modal stays open until user closes
    }
  };

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

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-[#13201c] border border-green-900 rounded-xl w-11/12 md:w-1/3 p-6 shadow-lg relative">

            {/* Close (X) Button */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
              onClick={() => setShowSaveModal(false)}
              disabled={loading}
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-green-400 mb-4">
              Save This Search
            </h3>

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
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const searchName =
                    document.getElementById("searchNameInput")?.value.trim();
                  if (!searchName) {
                    alert("Please enter a search name.");
                    return;
                  }

                  try {
                    const res = await fetch(
                      `${API_BASE_URL}/userjobs/searches/save`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          name: searchName,
                          jobs: userJobs,
                          sessionId,
                        }),
                      }
                    );
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(data.error || "Failed to save search");
                    alert("Search saved successfully!");
                    setShowSaveModal(false);
                  } catch (err) {
                    alert(err.message || "Error saving search");
                  }
                }}
                className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-500"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Info */}
      {user && (
        <div className="mt-10 p-4 bg-[#0d1512] border border-[#1b2b27] rounded-xl shadow-[0_0_10px_#00ff9d22] w-full max-w-lg text-sm text-gray-300">
          <p>
            <strong className="text-green-400">Name:</strong> {user.name}
          </p>
          <p>
            <strong className="text-green-400">User ID:</strong> {user.userId}
          </p>
          <p>
            <strong className="text-green-400">Session ID:</strong> {sessionId}
          </p>
        </div>
      )}
    </div>
  );
}
