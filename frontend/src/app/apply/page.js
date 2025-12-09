"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Mail, Loader2 } from "lucide-react";
import Alert from "../components/Alert";

function ApplyPageContent() {
  const params = useSearchParams();
  const jobid = params.get("jobid");
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftUrl, setDraftUrl] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [alertState, setAlertState] = useState(null);

  // Use ref to control polling
  const pollingActive = useRef(true);
  const retryCount = useRef(0);
  const MAX_RETRIES = 20; // 20 * 3s = 60s max wait

  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
  while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

  // Auto-dismiss alert
  useEffect(() => {
    if (alertState) {
      const timer = setTimeout(() => setAlertState(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertState]);

  // STEP 1 — Load User
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data?.user?.userId) {
          setUserId(data.user.userId);
        }
      } catch (err) {
        console.error("❌ User fetch error:", err);
        setAlertState({ severity: "error", message: "Failed to load user session." });
      }
    };

    fetchUser();
  }, [API_BASE_URL]);

  // STEP 2 — Poll Create Gmail Draft
  useEffect(() => {
    if (!userId || !jobid) return;

    const createDraft = async () => {
      try {
        console.log(`Polling draft creation... Attempt ${retryCount.current + 1}`);
        const res = await axios.post(`${API_BASE_URL}/gmail/create-draft`, {
          userId,
          jobid,
        });

        // ✅ Success
        setDraftUrl(res.data.gmailUrl);
        setJobDetails(res.data.job);
        setLoading(false);
        pollingActive.current = false;

      } catch (err) {
        // Check if 404
        if (err.response && err.response.status === 404) {
          const errorMsg = err.response.data?.error || "";

          // Case 1: Job not found (Expected during polling)
          // If message is empty, we assume it might be job not found or just not ready
          if (!errorMsg || errorMsg === "Job not found" || errorMsg.includes("Job")) {
            if (retryCount.current < MAX_RETRIES && pollingActive.current) {
              console.log(`⏳ Job not found yet (Attempt ${retryCount.current + 1}/${MAX_RETRIES}). Retrying in 3s...`);
              retryCount.current += 1;
              setTimeout(createDraft, 3000);
              return;
            } else {
              setLoading(false);
              setAlertState({ severity: "error", message: "Job data not found after waiting. Please try again later." });
              return;
            }
          }

          // Case 2: User not found (Critical)
          if (errorMsg === "User not found") {
            console.error("❌ Critical: User not found during draft creation.");
            setLoading(false);
            setAlertState({ severity: "error", message: "User session invalid. Please log in again." });
            return;
          }
        }

        console.error("❌ Draft creation attempt failed:", err.message, err.response?.data);

        // Other errors
        setLoading(false);
        setAlertState({
          severity: "error",
          message: err.response?.data?.error || err.message || "Failed to create draft."
        });
      }
    };

    if (pollingActive.current) {
      createDraft();
    }

    return () => {
      pollingActive.current = false;
    };
  }, [userId, jobid, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-green-400 gap-4">
        <Loader2 className="animate-spin w-10 h-10" />
        <div className="text-lg font-semibold">
          Processing Application...
        </div>
        <p className="text-sm text-gray-400">Waiting for job details processing</p>
      </div>
    );
  }

  if (alertState && !jobDetails) {
    // Show alert if failed loading
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div className="w-full max-w-md px-4">
          <Alert severity={alertState.severity}>{alertState.message}</Alert>
        </div>
        <button
          onClick={() => router.push('/pages/job-found')}
          className="text-green-400 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!jobDetails) {
    return null; // Should be handled by loading or alert
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
      <div className="bg-[#0e1614] border border-green-900 rounded-xl p-8 shadow-2xl w-full max-w-3xl">

        {alertState && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md">
            <Alert severity={alertState.severity} onClose={() => setAlertState(null)}>{alertState.message}</Alert>
          </div>
        )}

        <h1 className="text-2xl font-bold text-green-400 mb-4">
          Your Application Is Ready ✨
        </h1>

        <div className="bg-[#0f1d19] border border-green-800 rounded-lg p-5 mb-6">
          <h2 className="text-xl font-semibold text-green-300 mb-3">
            {jobDetails.email_subject}
          </h2>
          <p className="text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {jobDetails.email_content}
          </p>
        </div>

        <button
          onClick={() => window.open(draftUrl, "_blank")}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg text-lg transition"
        >
          <Mail size={26} />
          Open Gmail Draft
        </button>

      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="text-green-400 p-10">Loading…</div>}>
      <ApplyPageContent />
    </Suspense>
  );
}
