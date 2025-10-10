"use client";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/lib/api";

export default function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const [jobsRes, usersRes] = await Promise.all([
          apiFetch("/api/jobs/all"),
          apiFetch("/api/auth/users"),
        ]);
        setJobs(Array.isArray(jobsRes) ? jobsRes : []);
        setUsers(Array.isArray(usersRes) ? usersRes : []);
      } catch (e) {
        setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalUsers = users.length;
    const sentEmails = jobs.filter(j => j.sent === true).length;
    const uniqueCompanies = new Set(jobs.map(j => j.companyName).filter(Boolean)).size;
    return { totalJobs, totalUsers, sentEmails, uniqueCompanies };
  }, [jobs, users]);

  if (loading) return <p className="p-4">Loading dashboard...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value={stats.totalJobs} />
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Emails Sent" value={stats.sentEmails} />
        <StatCard title="Companies" value={stats.uniqueCompanies} />
      </section>

      <JobsPerDayChart jobs={jobs} />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentJobs jobs={jobs.slice(0, 8)} />
        <RecentUsers users={users.slice(0, 8)} />
      </section>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function JobsPerDayChart({ jobs }) {
  const counts = useMemo(() => {
    const map = new Map();
    for (const j of jobs) {
      const d = j.createdAt ? new Date(j.createdAt) : null;
      if (!d) continue;
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    }
    const arr = Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
    return arr.slice(-10); // last 10 days
  }, [jobs]);

  const max = counts.reduce((m, [, v]) => Math.max(m, v), 0) || 1;
  const width = 520;
  const height = 180;
  const padding = 24;
  const barGap = 8;
  const barWidth = counts.length ? (width - padding * 2 - barGap * (counts.length - 1)) / counts.length : 0;

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 border-b font-medium">Jobs Created (last 10 days)</div>
      <div className="p-4">
        {counts.length === 0 ? (
          <div className="text-gray-500">No data</div>
        ) : (
          <svg width={width} height={height} role="img" aria-label="Jobs per day bar chart">
            {counts.map(([day, value], i) => {
              const x = padding + i * (barWidth + barGap);
              const h = Math.round((value / max) * (height - padding * 2));
              const y = height - padding - h;
              return (
                <g key={day}>
                  <rect x={x} y={y} width={barWidth} height={h} fill="#3b82f6" rx="4" />
                  <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="#6b7280">
                    {day.slice(5)}
                  </text>
                  <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#111827">
                    {value}
                  </text>
                </g>
              );
            })}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
          </svg>
        )}
      </div>
    </div>
  );
}

function RecentJobs({ jobs }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 border-b font-medium">Recent Jobs</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Company</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length ? jobs.map(job => (
              <tr key={job._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{job.title || job.email_subject || "—"}</td>
                <td className="px-4 py-2 border">{job.companyName || "—"}</td>
                <td className="px-4 py-2 border">{job.email_to || "—"}</td>
                <td className="px-4 py-2 border">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No recent jobs</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentUsers({ users }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 border-b font-medium">Recent Users</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">User Id</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{u.name}</td>
                <td className="px-4 py-2 border">{u.email}</td>
                <td className="px-4 py-2 border">{u.userId}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">No recent users</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

