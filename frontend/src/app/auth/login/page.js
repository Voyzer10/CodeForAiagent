// src/app/auth/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Linkedin } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");;

  /* -----------------------------
      LOGIN SUBMIT HANDLER
  ------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      router.push("/pages/userpanel");
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  /* -----------------------------
     GMAIL CONNECT (GOOGLE OAUTH)
  ------------------------------ */
  const handleGoogleConnect = () => {
    window.open(
      `${API_BASE_URL}/auth/auth/google`,
      "_blank",
      "width=600,height=700,noopener,noreferrer"
    );
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
      <div className="w-[448px] text-white">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 py-2">
          <div
            className="w-18 h-18 flex items-center justify-center rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, #00FA92 0%, #00C775 100%)",
            }}
          >
            <svg
              width="104"
              height="104"
              viewBox="0 0 104 104"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_62_113)">
                <path
                  d="M20 32C20 25.3726 25.3726 20 32 20H72C78.6274 20 84 25.3726 84 32V72C84 78.6274 78.6274 84 72 84H32C25.3726 84 20 78.6274 20 72V32Z"
                  fill="url(#paint0_linear_62_113)"
                />
                <path d="M67 68H37V36H67V68Z" />
                <g clipPath="url(#clip0_62_113)">
                  <path
                    d="M52 39C52.8297 39 53.5 39.6703 53.5 40.5V43.5H59.125C60.9906 43.5 62.5 45.0094 62.5 46.875V59.625C62.5 61.4906 60.9906 63 59.125 63H44.875C43.0094 63 41.5 61.4906 41.5 59.625V46.875C41.5 45.0094 43.0094 43.5 44.875 43.5H50.5V40.5C50.5 39.6703 51.1703 39 52 39Z"
                    fill="#030604"
                  />
                </g>
              </g>
              <defs>
                <filter
                  id="filter0_d_62_113"
                  x="0"
                  y="0"
                  width="104"
                  height="104"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="10" />
                </filter>
                <linearGradient
                  id="paint0_linear_62_113"
                  x1="-2.62"
                  y1="42.62"
                  x2="42.62"
                  y2="87.88"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#00FA92" />
                  <stop offset="1" stopColor="#00C775" />
                </linearGradient>
                <clipPath id="clip0_62_113">
                  <path d="M37 39H67V63H37V39Z" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          <h1 className="mt-4 text-[30px] font-bold text-center">
            Smart Job Search
          </h1>
          <p className="mt-1 text-[14px] text-[#9CA3AF] text-center">
            AI-Powered LinkedIn Automation
          </p>
        </div>

        {/* Glass Card */}
        <div className="rounded-[16px] border border-white/10 bg-white/5 shadow-[0_0_20px_rgba(0,250,146,0.3)] p-[33px]">
          {/* Welcome */}
          <div className="mb-6 text-center">
            <div className="text-[24px] font-bold">Welcome Back</div>
            <div className="mt-2 text-[14px] text-[#9CA3AF]">
              Log in to continue your AI-powered job automation journey
            </div>
          </div>

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
          <div className="mt-10 grid gap-3">
            {/* GOOGLE BUTTON UPDATED */}
            <button
              onClick={handleGoogleConnect}
              className="h-[54px] w-[350px] max-w-full mx-auto rounded-[12px] border border-white/10 bg-white/10 text-white flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
            >
              <FcGoogle size={18} />
              <span className="text-[16px]">Continue with Google</span>
            </button>

            {/* LinkedIn Button (unchanged) */}
            <button className="h-[54px] w-[350px] max-w-full mx-auto rounded-[12px] border border-white/10 bg-white/10 text-white flex items-center justify-center gap-3">
              <Linkedin size={16} />
              <span className="text-[16px]">Continue with LinkedIn</span>
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
