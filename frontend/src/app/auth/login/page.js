// src/app/auth/login/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Linkedin } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
     const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }
      router.push('/pages/userpanel')
    } catch (err) {
      setError('Something went wrong. Try again.')
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #030604 0%, #041208 0%, #030604 100%)' }}>
      {/* decorative dots and glows (approximation of Figma) */}
      <div className="pointer-events-none absolute left-9 top-14 w-36 h-36 rounded-full"
        style={{ background: 'linear-gradient(135deg, #00FA92 0%, rgba(0,0,0,0) 100%)', opacity: 0.1 }} />
      <div className="pointer-events-none absolute right-6 bottom-6 w-24 h-24"
        style={{ background: 'linear-gradient(45deg, #00FA92 50%, rgba(0,0,0,0) 100%)', opacity: 0.2 }} />
      <div className="pointer-events-none absolute right-72 top-80 w-16 h-16 rounded-full"
        style={{ background: '#00FA92', opacity: 0.05 }} />

      {/* main column container sized similar to 448px card */}
      <div className="w-[448px] text-white">
        {/* logo + heading */}
        <div className="flex flex-col items-center mb-6 py-2">
          <div
            className="w-18 h-18 flex items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #00FA92 0%, #00C775 100%)' }}
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
                    d="M52 39C52.8297 39 53.5 39.6703 53.5 40.5V43.5H59.125C60.9906 43.5 62.5 45.0094 62.5 46.875V59.625C62.5 61.4906 60.9906 63 59.125 63H44.875C43.0094 63 41.5 61.4906 41.5 59.625V46.875C41.5 45.0094 43.0094 43.5 44.875 43.5H50.5V40.5C50.5 39.6703 51.1703 39 52 39ZM46.75 57C46.3375 57 46 57.3375 46 57.75C46 58.1625 46.3375 58.5 46.75 58.5H48.25C48.6625 58.5 49 58.1625 49 57.75C49 57.3375 48.6625 57 48.25 57H46.75ZM51.25 57C50.8375 57 50.5 57.3375 50.5 57.75C50.5 58.1625 50.8375 58.5 51.25 58.5H52.75C53.1625 58.5 53.5 58.1625 53.5 57.75C53.5 57.3375 53.1625 57 52.75 57H51.25ZM55.75 57C55.3375 57 55 57.3375 55 57.75C55 58.1625 55.3375 58.5 55.75 58.5H57.25C57.6625 58.5 58 58.1625 58 57.75C58 57.3375 57.6625 57 57.25 57H55.75ZM49.375 51C49.375 50.5027 49.1775 50.0258 48.8258 49.6742C48.4742 49.3225 47.9973 49.125 47.5 49.125C47.0027 49.125 46.5258 49.3225 46.1742 49.6742C45.8225 50.0258 45.625 50.5027 45.625 51C45.625 51.4973 45.8225 51.9742 46.1742 52.3258C46.5258 52.6775 47.0027 52.875 47.5 52.875C47.9973 52.875 48.4742 52.6775 48.8258 52.3258C49.1775 51.9742 49.375 51.4973 49.375 51ZM56.5 52.875C56.9973 52.875 57.4742 52.6775 57.8258 52.3258C58.1775 51.9742 58.375 51.4973 58.375 51C58.375 50.5027 58.1775 50.0258 57.8258 49.6742C57.4742 49.3225 56.9973 49.125 56.5 49.125C56.0027 49.125 55.5258 49.3225 55.1742 49.6742C54.8225 50.0258 54.625 50.5027 54.625 51C54.625 51.4973 54.8225 51.9742 55.1742 52.3258C55.5258 52.6775 56.0027 52.875 56.5 52.875ZM39.25 49.5H40V58.5H39.25C38.0078 58.5 37 57.4922 37 56.25V51.75C37 50.5078 38.0078 49.5 39.25 49.5ZM64.75 49.5C65.9922 49.5 67 50.5078 67 51.75V56.25C67 57.4922 65.9922 58.5 64.75 58.5H64V49.5H64.75Z"
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
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="10" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0.980392 0 0 0 0 0.572549 0 0 0 0.3 0"
                  />
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_62_113" />
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_62_113" result="shape" />
                </filter>
                <linearGradient
                  id="paint0_linear_62_113"
                  x1="-2.62742"
                  y1="42.6274"
                  x2="42.6274"
                  y2="87.8823"
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

          <h1 className="mt-4 text-[30px] leading-[1.2] font-bold text-center">Smart Job Search</h1>
          <p className="mt-1 text-[14px] leading-[1.43] text-[#9CA3AF] text-center">
            AI-Powered LinkedIn Automation
          </p>
        </div>

        {/* glass card */}
        <div className="rounded-[16px] border border-white/10 bg-white/5 shadow-[0_0_20px_rgba(0,250,146,0.3)] p-[33px]">
          {/* welcome copy */}
          <div className="mb-6 text-center">
            <div className="text-[24px] font-bold">Welcome Back</div>
            <div className="mt-2 text-[14px] text-[#9CA3AF]">
              Log in to continue your AI-powered job automation journey
            </div>
          </div>

          {/* form */}
          <form className="space-y-[24px]" onSubmit={handleSubmit}>
            {/* email */}
            <div className="relative h-[50px]">
              <div className="absolute inset-0 rounded-[8px] border border-[#4B5563] bg-black/30" />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADAEBC]" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="relative z-10 w-full h-full bg-transparent outline-none pl-10 pr-3 text-[16px] placeholder:text-[#ADAEBC]"
              />
            </div>

            {/* password */}
            <div className="relative h-[50px]">
              <div className="absolute inset-0 rounded-[8px] border border-[#4B5563] bg-black/30" />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADAEBC]" size={18} />
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
              className="relative h-12 w-full rounded-[8px] font-semibold text-[#030604] overflow-hidden"
              style={{ background: 'linear-gradient(90deg, #00FA92 0%, #00C775 100%)' }}>
              <span className="relative z-10 cursor-pointer">Access My Dashboard</span>
              <span className="pointer-events-none absolute inset-0 -left-full w-full h-full"
                style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,250,146,0.3) 50%, rgba(0,0,0,0) 100%)' }} />
            </button>

            {/* helper links */}
            <div className="text-center">
              <a href="#" className="text-[14px] text-[#00FA92]">Forgot your password?</a>
              <div className="mt-2 text-[14px] text-[#9CA3AF]">
                Don&apos;t have an account? <a href="/auth/register" className="text-[#00FA92] font-medium">Sign Up</a>
              </div>
            </div>
          </form>
          {/* social buttons */}
          <div className="mt-10 grid gap-3">
            <button className="h-[54px] w-[350px] max-w-full mx-auto rounded-[12px] border border-white/10 bg-white/10 text-white flex items-center justify-center gap-3">
              <span className="inline-flex items-center justify-center"><FcGoogle size={18} /></span>
              <span className="text-[16px]">Continue with Google</span>
            </button>
            <button className="h-[54px] w-[350px] max-w-full mx-auto rounded-[12px] border border-white/10 bg-white/10 text-white flex items-center justify-center gap-3">
              <span className="inline-flex items-center justify-center"><Linkedin size={16} /></span>
              <span className="text-[16px]">Continue with LinkedIn</span>
            </button>
          </div>
        </div>

        {/* footer microcopy */}
        <div className="mt-4 text-center text-[12px] text-[#6B7280]">Secure • Encrypted • AI-Powered</div>



        {/* bottom glow line */}
        <div className="mx-auto mt-10 w-32 h-[2px] shadow-[0_0_39px_rgba(0,250,146,0.59)]"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, #00FA92 50%, rgba(0,0,0,0) 100%)' }} />
      </div>
    </div>
  )
}
