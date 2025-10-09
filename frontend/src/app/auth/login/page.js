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
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
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
      if (data.token) localStorage.setItem('token', data.token)
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
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-[12px] shadow-[0_0_20px_rgba(0,250,146,0.3)]"
               style={{ background: 'linear-gradient(135deg, #00FA92 0%, #00C775 100%)' }} />
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
              <span className="relative z-10">Access My Dashboard</span>
              <span className="pointer-events-none absolute inset-0 -left-full w-full h-full"
                    style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,250,146,0.3) 50%, rgba(0,0,0,0) 100%)' }} />
            </button>

            {/* helper links */}
            <div className="text-center">
              <a href="#" className="text-[14px] text-[#00FA92]">Forgot your password?</a>
              <div className="mt-2 text-[14px] text-[#9CA3AF]">
                Don't have an account? <a href="/auth/register" className="text-[#00FA92] font-medium">Sign Up</a>
              </div>
            </div>
          </form>
        </div>

        {/* footer microcopy */}
        <div className="mt-4 text-center text-[12px] text-[#6B7280]">Secure • Encrypted • AI-Powered</div>

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

        {/* bottom glow line */}
        <div className="mx-auto mt-10 w-32 h-[2px] shadow-[0_0_39px_rgba(0,250,146,0.59)]"
             style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, #00FA92 50%, rgba(0,0,0,0) 100%)' }} />
      </div>
    </div>
  )
}
