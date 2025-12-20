"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { Loader2, CheckCircle, Pencil, Trash2, X, Check, Building2, MapPin, Clock, Briefcase, ChevronRight, Bookmark, History } from "lucide-react";
import Sidebar from "../userpanel/Sidebar";
import UserNavbar from "../userpanel/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import Alert from "../../components/Alert"; // Imported Alert
import JobDetailsPanel from "../../components/JobDetailsPanel";

const JobListItemSkeleton = () => (
  <div className="px-4 py-3">
    <div className="group relative p-4 rounded-xl border border-[#1b2b27] bg-[#0c1210] flex flex-row items-start gap-4 animate-pulse">
      {/* 1. Left: Company Logo Skeleton */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/5 border border-green-500/10"></div>

      {/* 2. Middle: Content Skeleton */}
      <div className="flex-1 min-w-0 pr-12 pb-6">
        <div className="flex flex-wrap items-start gap-2 mb-2">
          <div className="h-4 bg-green-500/10 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-800/50 rounded w-16 mb-1"></div>
        </div>
        <div className="h-3 bg-gray-800/50 rounded w-1/2 mb-5"></div>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-gray-800/50"></div>
              <div className="h-2 bg-gray-800/40 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Actions / Selection Skeleton */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-4 h-[calc(100%-32px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-4 h-4 rounded bg-gray-800/50"></div>
          <div className="w-6 h-6 rounded bg-gray-800/50"></div>
        </div>
        <div className="mt-auto h-3 bg-gray-800/50 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const JobListItem = ({
  job,
  jobUUID,
  isSelected,
  isApplied,
  isSaved,
  onToggleSave,
  selectedJob,
  setSelectedJob,
  toggleJobSelection,
  virtualRow,
  rowVirtualizer
}) => {
  const title = job.Title || job.title || "(No title)";
  const company = job.Company || job.companyName || "Unknown Company";
  const salary = job.Salary || job.salary || null;
  const location = job.Location || job.location || "Remote";
  const postedAt = job.postedAt || job.datePosted || job.createdAt || null;
  const isActivelyHiring = job.benefits?.includes("Actively Hiring") || job.isActivelyHiring;

  // Only one badge: Applied takes priority
  const showAppliedBadge = isApplied;
  const showActivelyHiringBadge = !isApplied && isActivelyHiring;

  return (
    <div
      ref={rowVirtualizer.measureElement}
      key={jobUUID}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow.start}px)`,
      }}
      className="px-4 py-3"
    >
      <div
        className={`group relative p-4 rounded-xl border transition-all duration-300
          flex flex-row items-start gap-4 cursor-pointer
          ${isSelected
            ? "bg-green-900/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.05)]"
            : selectedJob === job
              ? "bg-green-900/5 border-green-600/40"
              : "bg-[#0c1210] border-[#1b2b27] hover:border-green-800/60 hover:bg-[#111a17]"
          }`}
        onClick={() => setSelectedJob(job)}
      >
        {/* 1. Left: Company Logo */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-900/10 border border-green-800/30 flex items-center justify-center text-green-400 group-hover:scale-105 transition-transform overflow-hidden bg-white/5">
          {job.company?.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={job.company.logo}
              alt={job.company?.name || company}
              className="w-full h-full object-contain p-1"
              onError={(e) => { e.target.onerror = null; e.target.src = ""; e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-green-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>'; }}
            />
          ) : (
            <Building2 size={24} />
          )}
        </div>

        {/* 2. Middle: Content */}
        <div className="flex-1 min-w-0 pr-12 pb-6 text-left">
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <h3 className="text-[16px] font-bold text-white group-hover:text-green-400 transition-colors leading-tight">
              {title}
            </h3>
            <div className="flex flex-wrap gap-1.5 shrink-0 pt-0.5">
              {showAppliedBadge ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded bg-green-500/10 border border-green-500/20 text-green-400 whitespace-nowrap">
                  <CheckCircle size={10} />
                  Applied
                </span>
              ) : showActivelyHiringBadge ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 whitespace-nowrap">
                  Actively Hiring
                </span>
              ) : null}
            </div>
          </div>

          <div className="text-[13px] font-medium text-gray-400 mb-4 truncate">{job.company?.name || company}</div>

          {/* GRID BASED META - AUTO ADAPTIVE */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">{location}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Briefcase size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">{job.EmploymentType || job.jobType || "Full-time"}</span>
            </div>
            {salary && (
              <div className="flex items-center gap-2 min-w-0 font-medium text-green-400/90">
                <span className="text-gray-500 text-[10px] font-normal">$</span>
                <span className="text-[11px] truncate">{salary}</span>
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">
                {postedAt ? new Date(postedAt).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Actions / Selection - FIXED TOP RIGHT */}
        <div className="absolute top-4 right-4 flex flex-col items-center gap-4 h-[calc(100%-32px)]">
          <div className="flex flex-col items-center gap-3">
            {!isApplied && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleJobSelection(jobUUID)}
                onClick={(e) => e.stopPropagation()}
                title="Select for application"
                className="w-4 h-4 rounded accent-green-500 border-green-800/50 cursor-pointer"
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job);
              }}
              title="Save this job"
              className={`p-1.5 rounded-md transition-all ${isSaved ? 'text-green-400 bg-green-400/10' : 'text-gray-500 hover:text-green-400 hover:bg-green-400/5'}`}
            >
              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>

          <button
            className="text-[12px] font-semibold text-green-400/70 hover:text-green-400 flex items-center gap-0.5 transition-colors mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedJob(job);
            }}
          >
            View Full Job
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const JobFoundContent = () => {
  const [user, setUser] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Start loading as true
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ... (lines 208-1100 unchanged) ...

  <JobDetailsPanel
    job={selectedJob}
    onApply={(job) => applyJobs([job])}
    isApplied={appliedJobIds.has(selectedJob.jobid || selectedJob.jobId || selectedJob.id || selectedJob._id)}
    isSaved={savedJobIds.has(selectedJob.jobid || selectedJob.jobId || selectedJob.id || selectedJob._id)}
    onToggleSave={handleToggleSave}
    applying={applying}
    isUserLoading={loading}
  />
}

export default function JobFound() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#0b0f0e] text-white">
        <div className="h-20 w-full fixed top-0 border-b border-white/10 bg-[#121e12]/60 z-50"></div>
        <div className="w-64 h-full fixed left-0 border-r border-white/10 bg-[#0a0f0d] hidden md:block pt-20"></div>

        <div className="flex-1 p-6 md:p-10 mt-14 ml-0 md:ml-64 animate-pulse">
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="h-10 w-32 bg-gray-800/50 rounded-full"></div>
              <div className="h-10 w-32 bg-gray-800/50 rounded-full"></div>
              <div className="h-10 w-32 bg-gray-800/50 rounded-full"></div>
            </div>

            <div className="flex flex-col lg:flex-row border border-green-800/30 rounded-lg overflow-hidden h-[75vh]">
              <div className="w-full lg:w-1/3 border-r border-green-800/30 bg-[#0b0f0e] p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-800/20 rounded-xl"></div>
                ))}
              </div>
              <div className="hidden lg:block lg:w-2/3 bg-[#0e1513] p-8 space-y-8">
                <div className="h-12 bg-gray-800/40 rounded w-1/2"></div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-800/30 rounded-xl"></div>)}
                </div>
                <div className="h-64 bg-gray-800/10 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <JobFoundContent />
    </Suspense>
  );
}
