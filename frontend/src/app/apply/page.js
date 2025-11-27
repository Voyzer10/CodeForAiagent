"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Mail } from "lucide-react";

function ApplyPageContent() {
  const params = useSearchParams();
  const jobid = params.get("jobid");

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftUrl, setDraftUrl] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);

  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
  while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

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
      }
    };

    fetchUser();
  }, [API_BASE_URL]);

  // STEP 2 — Auto Create Gmail Draft
  useEffect(() => {
    if (!userId || !jobid) return;

    const createDraft = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/gmail/create-draft`, {
          userId,
          jobid,
        });

        setDraftUrl(res.data.gmailUrl);
        setJobDetails(res.data.job);
      } catch (err) {
        console.error("❌ Draft creation failed:", err);
      } finally {
        setLoading(false);
      }
    };

    createDraft();
  }, [userId, jobid, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-green-400 text-lg">
        Creating Gmail Draft…
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400 text-lg">
        ❌ Failed to load job details
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-[#0e1614] border border-green-900 rounded-xl p-8 shadow-2xl w-full max-w-3xl">

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
