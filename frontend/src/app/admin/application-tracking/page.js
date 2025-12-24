"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs", {
          cache: "no-store", // 👈 avoid stale 304 cache
        });
        const data = await res.json();
        console.log("Fetched jobs:", data); // 👈 check here
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Data</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Job ID</th>
            <th className="border p-2">Tracking ID</th>
            <th className="border p-2">Ref ID</th>
            <th className="border p-2">Sent</th>
            <th className="border p-2">Email To</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Content</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center p-4">
                No jobs found
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job._id}>
                <td className="border p-2">{job.jobId}</td>
                <td className="border p-2">{job.trackingId}</td>
                <td className="border p-2">{job.refId}</td>
                <td className="border p-2">{String(job.sent)}</td>
                <td className="border p-2">{job.email_to}</td>
                <td className="border p-2">{job.email_subject}</td>
                <td className="border p-2">{job.email_content}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}
