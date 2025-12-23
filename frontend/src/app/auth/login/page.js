"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Linkedin, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
  while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

  // Check for OAuth errors from callback
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      let userMessage = "";

      switch (errorParam) {
        case "invalid_grant":
          userMessage = "Your sign-in session expired. Please try again.";
          break;
        case "no_code":
          userMessage = "Authentication failed. Please try signing in again.";
          break;
        case "config_error":
          userMessage = "Authentication service is temporarily unavailable. Please try again later.";
          break;
        case "network_error":
          userMessage = "We're having trouble connecting. Please check your internet and try again.";
          break;
        case "auth_failed":
          userMessage = "Unable to sign in with Google. Please try again or use email/password.";
          break;
        default:
          userMessage = "Authentication failed. Please try again.";
      }

      setError(userMessage);

      // Clear error from URL after showing it
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        window.history.replaceState({}, "", url.toString());
      }, 100);
    }
  }, [searchParams]);

  // NORMAL EMAIL/PASSWORD LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // User-friendly error messages
        if (data.message?.includes("Invalid credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (data.message?.includes("required")) {
          setError("Please enter both email and password.");
        } else {
          setError(data.message || "Login failed. Please try again.");
        }
        return;
      }

      router.push("/pages/userpanel");
    } catch (err) {
      console.error("Login error:", err);
      setError("We're having trouble connecting. Please check your internet and try again.");
    }
  };

  // GOOGLE LOGIN START
  const handleGoogleConnect = () => {
    setError(null); // Clear any existing errors
    window.location.href = `${API_BASE_URL}/auth/login/google`;
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #030604 0%, #041208 0%, #030604 100%)",
      }}
    >
      {/* Decorations */}
      <div
        className="pointer-events-none absolute left-9 top-14 w-36 h-36 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, #00FA92 0%, rgba(0,0,0,0) 100%)",
          opacity: 0.1,
        }}
      />
      <div
        className="pointer-events-none absolute right-6 bottom-6 w-24 h-24"
        style={{
          background:
            "linear-gradient(45deg, #00FA92 50%, rgba(0,0,0,0) 100%)",
          opacity: 0.2,
        }}
      />
      <div
        className="pointer-events-none absolute right-72 top-80 w-16 h-16 rounded-full"
        style={{ background: "#00FA92", opacity: 0.05 }}
      />

      {/* Main Login Card */}
      <div className="w-full max-w-[448px] text-white z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 py-2">
          <div
            className="w-18 h-18 flex items-center justify-center rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, #00FA92 0%, #00C775 100%)",
            }}
          >
            {/* logo removed for brevity */}
          </div>

          <h1 className="mt-4 text-[30px] font-bold text-center">
            Smart Job Search
          </h1>
          <p className="mt-1 text-[14px] text-[#9CA3AF] text-center">
            AI-Powered LinkedIn Automation
          </p>
        </div>

        {/* Glass Card */}
        <div className="rounded-[16px] border border-white/10 bg-white/5 shadow-[0_0_20px_rgba(0,250,146,0.3)] p-6 sm:p-[33px]">

          {/* Welcome */}
          <div className="mb-6 text-center">
            <div className="text-[20px] sm:text-[24px] font-bold">Welcome Back</div>
            <div className="mt-2 text-[13px] sm:text-[14px] text-[#9CA3AF]">
              Log in to continue your AI-powered job automation journey
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-200 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          <form className="space-y-[24px]" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative h-[50px]">
              <div className="absolute inset-0 rounded-[8px] border border-[#4B5563] bg-black/30" />
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADAEBC]"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="relative z-10 w-full h-full bg-transparent outline-none pl-10 pr-3 text-[16px] placeholder:text-[#ADAEBC]"
              />
            </div>

            {/* Password */}
            <div className="relative h-[50px]">
              <div className="absolute inset-0 rounded-[8px] border border-[#4B5563] bg-black/30" />
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADAEBC]"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••"
                className="relative z-10 w-full h-full bg-transparent outline-none pl-10 pr-3 text-[16px] placeholder:text-[#ADAEBC]"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* CTA */}
            <button
              type="submit"
              className="relative h-12 w-full rounded-[8px] font-semibold text-[#030604]"
              style={{
                background:
                  "linear-gradient(90deg, #00FA92 0%, #00C775 100%)",
              }}
            >
              Access My Dashboard
            </button>

            {/* Links */}
            <div className="text-center">
              <a href="#" className="text-[14px] text-[#00FA92]">
                Forgot your password?
              </a>
              <div className="mt-2 text-[14px] text-[#9CA3AF]">
                Don&apos;t have an account?{" "}
                <a href="/auth/register" className="text-[#00FA92] font-medium">
                  Sign Up
                </a>
              </div>
            </div>
          </form>

          {/* Social Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            {/* GOOGLE LOGIN BUTTON */}
            <button
              onClick={handleGoogleConnect}
              className="h-[52px] sm:h-[54px] w-full max-w-[350px] mx-auto rounded-[12px] border border-white/10 bg-white/10 text-white flex items-center justify-center gap-3 hover:bg-white/20 transition-all font-medium"
            >
              <FcGoogle size={20} />
              <span className="text-[15px] sm:text-[16px]">Continue with Google</span>
            </button>

            {/* LinkedIn Button */}
            <button className="h-[52px] sm:h-[54px] w-full max-w-[350px] mx-auto rounded-[12px] border border-white/10 bg-white/10 text-white flex items-center justify-center gap-3 hover:bg-white/20 transition-all font-medium opacity-80 cursor-not-allowed">
              <Linkedin size={18} className="text-[#0077b5]" />
              <span className="text-[15px] sm:text-[16px]">Continue with LinkedIn</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-[12px] text-[#6B7280]">
          Secure • Encrypted • AI-Powered
        </div>

        <div
          className="mx-auto mt-10 w-32 h-[2px] shadow-[0_0_39px_rgba(0,250,146,0.59)]"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0) 0%, #00FA92 50%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}
