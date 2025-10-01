"use client";

// import { useEffect, useState } from "react";

export default function JobsPage() {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/api/jobs", {
//           cache: "no-store",
//         });
//         const data = await res.json();
//         setJobs(data);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobs();
//   }, []);

//   if (loading) return <p className="p-4">Loading jobs...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Jobs</h1>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse bg-white text-left text-sm">
          <thead className="bg-gray-200">
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
          {/* <tbody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{job._id}</td>
                  <td className="px-4 py-2 border">{job.title}</td>
                  <td className="px-4 py-2 border">{job.companyName}</td>
                  <td className="px-4 py-2 border">{job.location}</td>
                  <td className="px-4 py-2 border">{job.salary || "N/A"}</td>
                  <td className="px-4 py-2 border">{job.applicantsCount || 0}</td>
                  <td className="px-4 py-2 border">{job.email_to || "—"}</td>
                  <td className="px-4 py-2 border">{job.postedAt}</td>
                  <td className="px-4 py-2 border">
                    <button className="text-blue-600 underline">View</button>
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
          </tbody> */}
        </table>
      </div>
    </div>
  );
}
