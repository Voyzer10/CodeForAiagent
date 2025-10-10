"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiFetch("/api/jobs/all");
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p className="p-4">Loading jobs...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Jobs</h1>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Company</th>
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border">Salary</th>
              <th className="px-4 py-2 border">Applicants</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Posted At</th>
              <th className="px-4 py-2 border">More</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{job._id}</td>
                  <td className="px-4 py-2 border">{job.title || job.email_subject || "—"}</td>
                  <td className="px-4 py-2 border">{job.companyName || "—"}</td>
                  <td className="px-4 py-2 border">{job.location || "—"}</td>
                  <td className="px-4 py-2 border">{job.salary || "N/A"}</td>
                  <td className="px-4 py-2 border">{job.applicantsCount || 0}</td>
                  <td className="px-4 py-2 border">{job.email_to || "—"}</td>
                  <td className="px-4 py-2 border">{job.createdAt ? new Date(job.createdAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2 border">
                    <button className="px-2 py-1 text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-4 py-2 text-center">
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
