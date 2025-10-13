"use client";

import { useState, useEffect } from "react";
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
  const [userJobs, setUserJobs] = useState([]); // ✅ jobs already fetched by the user
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ Step 1: Fetch current user + user's jobs
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch user");
        setUser(data.user);

        // ✅ Fetch jobs for this user
        if (data.user && data.user.userId) {
          const jobRes = await fetch(
            `http://localhost:5000/api/userjobs/${data.user.userId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const jobData = await jobRes.json();
          if (jobRes.ok && Array.isArray(jobData.jobs)) {
            setUserJobs(jobData.jobs);
          } else {
            setUserJobs([]);
          }
        }
      } catch (err) {
        console.error("Fetch user error:", err);
        setError(err.message);
      }
    };
    fetchUser();
  }, []);

  // ✅ Step 2 + 3: Handle submit with payment check + prompt creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Check payment
      const planRes = await fetch("http://localhost:5000/api/payment/check", {
        method: "GET",
        credentials: "include",
      });
      const planData = await planRes.json();

      if (!planData.hasPlan) {
        setLoading(false);
        router.push("/pages/price");
        return;
      }

      // Generate hidden prompt
      const prompt = `
        Job Title: ${jobTitle}
        Location: ${location}
        LinkedIn: ${linkedin}
        GitHub: ${github}
      `;

      // Continue to backend
      await continueToFetchJobs(prompt);
    } catch (err) {
      setError("Error verifying plan: " + err.message);
      setLoading(false);
    }
  };

  // ✅ Step 3: Continue fetching jobs (from backend)
  const continueToFetchJobs = async (prompt) => {
    try {
      const res = await fetch("http://localhost:5000/api/userjobs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResponse(data);

      // ✅ After adding new jobs, refresh user jobs list
      if (user && user.userId) {
        const jobRes = await fetch(
          `http://localhost:5000/api/userjobs/${user.userId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const jobData = await jobRes.json();
        setUserJobs(jobData.jobs || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 4: Render everything
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

          {/* Location */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Bangalore, India"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
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

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-green-300 text-black font-semibold py-2 rounded-md transition-all duration-300 shadow-[0_0_20px_#00ff9d55]"
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

      {/* User Info */}
      {user && (
        <div className="mt-10 p-4 bg-[#0d1512] border border-[#1b2b27] rounded-xl shadow-[0_0_10px_#00ff9d22] w-full max-w-lg text-sm text-gray-300">
          <p>
            <strong className="text-green-400">Name:</strong> {user.name}
          </p>
          <p>
            <strong className="text-green-400">User ID:</strong> {user.userId}
          </p>
        </div>
      )}

      {/* ✅ Display user's saved jobs */}
      <div className="mt-10 w-full max-w-3xl">
        <h3 className="text-green-400 font-semibold mb-3">Your Saved Jobs:</h3>
        {userJobs.length > 0 ? (
          <div className="grid gap-4">
            {userJobs.map((job, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0e1513] border border-[#1b2b27] rounded-md shadow-inner shadow-[#00ff9d22]"
              >
                <h4 className="text-green-300 font-semibold mb-1">
                  {job.title}
                </h4>
                <p className="font-medium text-gray-300">{job.company}</p>
                <p className="text-sm text-gray-400">{job.location}</p>
                <p className="text-sm text-gray-500 mt-2">{job.description}</p>
                {job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 underline text-sm mt-2 inline-block"
                  >
                    View Job
                  </a>
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

      {/* Response from the new search */}
      {response && Array.isArray(response) && (
        <div className="mt-6 w-full max-w-3xl">
          <h3 className="text-green-400 font-semibold mb-3">New Job Results:</h3>
          <div className="grid gap-4">
            {response.map((job, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0e1513] border border-[#1b2b27] rounded-md shadow-inner shadow-[#00ff9d22]"
              >
                <h4 className="text-green-300 font-semibold mb-1">
                  {job.title}
                </h4>
                <p className="font-medium text-gray-300">{job.company}</p>
                <p className="text-sm text-gray-400">{job.location}</p>
                <p className="text-sm text-gray-500 mt-2">{job.description}</p>
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 underline text-sm mt-2 inline-block"
                >
                  View Job
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
