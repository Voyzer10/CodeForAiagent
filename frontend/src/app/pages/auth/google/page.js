"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("processing"); // processing | error | success
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleCallback = () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");
      const error = url.searchParams.get("error");

      // Handle error cases from backend
      if (error) {
        let userMessage = "";

        switch (error) {
          case "invalid_grant":
            userMessage = "Authentication session expired. Please try signing in again.";
            break;
          case "no_code":
            userMessage = "Authentication failed. Please try again.";
            break;
          case "config_error":
            userMessage = "Authentication service is temporarily unavailable. Please contact support.";
            break;
          case "network_error":
            userMessage = "We're having trouble connecting. Please try again in a moment.";
            break;
          case "auth_failed":
          default:
            userMessage = "Authentication failed. Please try again.";
        }

        setErrorMessage(userMessage);
        setStatus("error");

        // Auto-retry once for network errors
        if (error === "network_error" && retryCount === 0) {
          setRetryCount(1);
          setTimeout(() => {
            setStatus("processing");
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
            window.location.href = `${API_BASE_URL.replace(/\/$/, "")}/auth/login/google`;
          }, 2000);
          return;
        }

        // Redirect to login after 3 seconds on error
        setTimeout(() => {
          router.push("/pages/auth/login");
        }, 3000);
        return;
      }

      // Success case - token received
      if (token) {
        document.cookie = `token=${token}; path=/; SameSite=Lax; max-age=${4 * 60 * 60}`;
        setStatus("success");
        setTimeout(() => {
          router.push("/pages/userpanel");
        }, 500);
      } else {
        // No token and no error - something unexpected happened
        setErrorMessage("Authentication failed unexpectedly. Redirecting...");
        setStatus("error");
        setTimeout(() => {
          router.push("/pages/auth/login");
        }, 2000);
      }
    };

    handleCallback();
  }, [router, retryCount]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#030604] via-[#041208] to-[#030604] text-white p-4">
      <div className="w-full max-w-md bg-[rgba(3,6,4,0.8)] border border-[rgba(0,250,146,0.2)] rounded-2xl p-8 text-center">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold mb-2">
              {retryCount > 0 ? "Retrying..." : "Connecting your Google account..."}
            </h1>
            <p className="text-gray-400 text-sm">Please wait while we complete your sign-in</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2 text-green-400">Success!</h1>
            <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2 text-red-400">Authentication Error</h1>
            <p className="text-gray-300 text-sm mb-4">{errorMessage}</p>
            <button
              onClick={() => router.push("/pages/auth/login")}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
