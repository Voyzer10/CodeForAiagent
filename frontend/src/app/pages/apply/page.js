"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Mail } from "lucide-react";

export default function ApplyPage() {
  const params = useSearchParams();
  const jobid = params.get("jobid"); // 👈 GET jobid from URL

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftUrl, setDraftUrl] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");

  /* -----------------------------------------
     STEP 1 — Load Logged-in User
  ------------------------------------------*/
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data?.user?.userId) {
          setUserId(data.user.userId);
        } else {
          console.error("❌ No user found");
        }
      } catch (err) {
        console.error("❌ User load error:", err);
      }
    };

    fetchUser();
  }, []);

  /* -----------------------------------------
     STEP 2 — Auto Create Gmail Draft
  ------------------------------------------*/
  useEffect(() => {
    if (!userId || !jobid) return;

    const createDraft = async () => {
      try {
        console.log("📨 Creating Gmail Draft for job:", jobid);

        const res = await axios.post(`${API_BASE_URL}/gmail/create-draft`, {
          userId,
          jobid,
        });

        if (res.data) {
          setDraftUrl(res.data.gmailUrl);
          setJobDetails(res.data.job);
        } else {
          console.error("❌ No data returned from draft API");
        }
      } catch (err) {
        console.error("❌ Draft creation failed:", err);
      } finally {
        setLoading(false);
      }
    };

    createDraft();
  }, [userId, jobid]);

  /* -----------------------------------------
     UI STATES
  ------------------------------------------*/
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
        Something went wrong. No job details available.
      </div>
    );
  }

  /* -----------------------------------------
     FINAL OUTPUT
  ------------------------------------------*/
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-[#0e1614] border border-green-900 rounded-xl p-8 shadow-2xl w-full max-w-3xl">

        <h1 className="text-2xl font-bold text-green-400 mb-4">
          Your Application Is Ready ✨
        </h1>

        {/* Job Email Preview */}
        <div className="bg-[#0f1d19] border border-green-800 rounded-lg p-5 mb-6">
          <h2 className="text-xl font-semibold text-green-300 mb-3">
            {jobDetails.email_subject}
          </h2>

          <p
            className="text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto"
          >
            {jobDetails.email_content}
          </p>
        </div>

        {/* Gmail Button */}
        <button
          onClick={() => window.open(draftUrl, "_blank")}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg text-lg shadow-md transition"
        >
          <Mail size={26} />
          Open Gmail Draft
        </button>

        <p className="text-gray-400 mt-4 text-center text-sm">
          Review your mail in Gmail → click <span className="text-green-400">Send</span>.
        </p>

      </div>
    </div>
  );
}
