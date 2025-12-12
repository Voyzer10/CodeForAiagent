"use client";

import {
  Suspense,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Mail, Loader2 } from "lucide-react";
import Alert from "../components/Alert";

function ApplyPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const jobid = params.get("jobid");

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftUrl, setDraftUrl] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [alertState, setAlertState] = useState(null);

  const pollingActive = useRef(true);

  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  while (API_BASE_URL.endsWith("/")) API_BASE_URL = API_BASE_URL.slice(0, -1);

  // Auto-dismiss alerts
  useEffect(() => {
    if (alertState) {
      const timer = setTimeout(() => setAlertState(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertState]);

  // STEP 1 — Load user (JWT-based)
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
        setAlertState({
          severity: "error",
          message: "Failed to load user session.",
        });
      }
    };

    fetchUser();
  }, [API_BASE_URL]);

  // STEP 3 — Create Gmail Draft (useCallback fixes ESLint)
  const createDraft = useCallback(
    async (jobData) => {
      try {
        console.log("📨 Creating Gmail Draft…");

        // ⬅️ IMPORTANT: OLD WORKING ROUTE
        const res = await axios.post(`${API_BASE_URL}/gmail/create-draft`, {
          userId,
          jobid,
        });

        setDraftUrl(res.data.gmailUrl);
        setJobDetails(res.data.job);
        setLoading(false);
        pollingActive.current = false;
      } catch (err) {
        console.error("❌ Draft creation error:", err.response?.data || err);
        setLoading(false);
        setAlertState({
          severity: "error",
          message:
            err.response?.data?.error ||
            "Failed to create Gmail draft. Try again.",
        });
      }
    },
    [API_BASE_URL, userId, jobid]
  );

  // STEP 2 — Poll DB waiting for N8N to fill email_to + email_subject
  useEffect(() => {
    if (!userId || !jobid) return;

    const pollUntilReady = async () => {
      const MAX_RETRIES = 40;
      let attempts = 0;

      while (attempts < MAX_RETRIES && pollingActive.current) {
        try {
          console.log(`⏳ Checking job status... Attempt ${attempts + 1}`);

          const res = await fetch(
            `${API_BASE_URL}/applied-jobs/check/${jobid}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          const data = await res.json();

          if (data.exists && data.job?.email_to && data.job?.email_subject) {
            console.log("🎉 Job email ready → Creating Gmail Draft…");
            return createDraft(data.job);
          }
        } catch (err) {
          console.warn("Polling error:", err.message);
        }

        attempts++;
        await new Promise((r) => setTimeout(r, 3000));
      }

      setLoading(false);
      setAlertState({
        severity: "error",
        message: "Job email could not be prepared in time. Try again later.",
      });
    };

    pollUntilReady();

    return () => {
      pollingActive.current = false;
    };
  }, [userId, jobid, API_BASE_URL, createDraft]);

  // LOADING UI
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-green-400 gap-4">
        <Loader2 className="animate-spin w-10 h-10" />
        <div className="text-lg font-semibold">Processing Application...</div>
        <p className="text-sm text-gray-400">Waiting for N8N to prepare email</p>
      </div>
    );
  }

  // ERROR UI
  if (alertState && !jobDetails) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div className="w-full max-w-md px-4">
          <Alert severity={alertState.severity}>{alertState.message}</Alert>
        </div>
        <button
          onClick={() => router.push("/pages/job-found")}
          className="text-green-400 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!jobDetails) return null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
      <div className="bg-[#0e1614] border border-green-900 rounded-xl p-8 shadow-2xl w-full max-w-3xl">
        {alertState && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md">
            <Alert
              severity={alertState.severity}
              onClose={() => setAlertState(null)}
            >
              {alertState.message}
            </Alert>
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
