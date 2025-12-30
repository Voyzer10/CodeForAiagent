"use client";

import { useEffect, useState } from "react";
import { Loader2, LogIn } from "lucide-react";

export default function LogoutPage() {
  const [status, setStatus] = useState("processing"); // processing | done | error

  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
  while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Logout failed");

        setStatus("done");
      } catch (err) {
        console.error("Logout error:", err);
        setStatus("error");
      }
    };

    logoutUser();
  }, [API_BASE_URL]);

  return (
    <div className="min-h-screen bg-[#09110f] text-white flex items-center justify-center p-6">
      <div className="bg-[#0f1614] border border-green-800 rounded-xl p-10 shadow-2xl w-full max-w-md text-center">

        {status === "processing" && (
          <>
            <Loader2 className="mx-auto animate-spin text-green-400" size={40} />
            <p className="text-gray-300 mt-4 text-lg">Logging you out…</p>
          </>
        )}

        {status === "done" && (
          <>
            <h1 className="text-2xl font-bold text-green-400 mb-3">
              You have been logged out 🎉
            </h1>
            <p className="text-gray-300 mb-6">
              Your session has ended successfully.
            </p>

            <button
              onClick={() => (window.location.href = "/pages/auth/login")}
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition"
            >
              <LogIn size={20} />
              Login Again
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-400 mb-3">
              Logout Failed ❌
            </h1>
            <p className="text-gray-300 mb-6">
              Something went wrong while logging you out.
            </p>

            <button
              onClick={() => (window.location.href = "/pages/auth/login")}
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-black py-3 rounded-lg hover:bg-green-400 transition"
            >
              <LogIn size={20} />
              Try Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
