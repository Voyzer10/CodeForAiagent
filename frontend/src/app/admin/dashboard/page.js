"use client";

import { useMemo } from "react";

import SystemHealth from "../components/SystemHealth";
import ResourceMonitor from "../components/ResourceMonitor";
import LogsWidget from "../components/LogsWidget";
import SecurityWidget from "../components/SecurityWidget";

export default function DashboardPage() {
  // 🔒 Static dashboard stats (NO API)
  const stats = useMemo(() => {
    return {
      totalJobs: 0,
      totalUsers: 0,
      sentEmails: 0,
      uniqueCompanies: 0,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
      </div>

      {/* System widgets (UI only – make sure these components
          DO NOT contain useEffect API calls) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SystemHealth />
        <ResourceMonitor />
      </div>

      {/* Logs / Security / Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LogsWidget />
        <SecurityWidget />
        <JobsPerDayChart jobs={[]} />
      </div>

      <hr className="border-gray-200" />

      {/* Stats */}
      <h2 className="text-xl font-semibold text-gray-700">
        Platform Analytics
      </h2>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value={stats.totalJobs} />
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Emails Sent" value={stats.sentEmails} />
        <StatCard title="Companies" value={stats.uniqueCompanies} />
      </section>

      {/* Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentJobs jobs={[]} />
        <RecentUsers users={[]} />
      </section>
    </div>
  );
}

/* -------------------- UI COMPONENTS ONLY -------------------- */

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </div>
      <div className="mt-2 text-3xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function JobsPerDayChart({ jobs }) {
  const counts = useMemo(() => {
    const map = new Map();
    for (const j of jobs) {
      if (!j?.createdAt) continue;
      const d = new Date(j.createdAt);
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).slice(-10);
  }, [jobs]);

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 border-b font-medium">
        Jobs Created (last 10 days)
      </div>
      <div className="p-4 text-gray-500">
        No data
      </div>
    </div>
  );
}

function RecentJobs({ jobs }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 border-b font-medium">Recent Jobs</div>
      <div className="px-4 py-6 text-center text-gray-500">
        No recent jobs
      </div>
    </div>
  );
}

function RecentUsers({ users }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 border-b font-medium">Recent Users</div>
      <div className="px-4 py-6 text-center text-gray-500">
        No recent users
      </div>
    </div>
  );
}
