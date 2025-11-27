// src/app/auth/login/page.js
'use client'

import { Lock, Mail, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'


export default function RegisterPage() {

    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = async (e) => {
        let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
        while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match')
            return
        }
        // Terms text is shown below; no checkbox gate per UI spec

        try {
            await axios.post(`${API_BASE_URL}/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            })
            alert('Registration successful! Please log in.')
            router.push('/auth/login')
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || 'Registration failed')
        }
    }

    return (
        <div className="min-h-screen md:min-h-[1150px] w-full relative flex items-center justify-center bg-[#030604] px-4 pb-12">
            {/* Figma background dots and soft circles */}
            <div className="pointer-events-none absolute inset-0 hidden md:flex items-center justify-center">
                <div className="relative" style={{ width: 1440, height: 1440 }}>
                    {/* Small glow dots (2x2) */}
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 153.27, top: -18.55, opacity: 0.9709740281105042 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 297.58, top: -19.16, opacity: 0.9832519888877869 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 437.48, top: -10.96, opacity: 0.8191030025482178 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 585.99, top: -19.97, opacity: 0.9994109869003296 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 728.13, top: -16.25, opacity: 0.9250289797782898 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 866.8, top: -5.6, opacity: 0.7120360136032104 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 1017.93, top: -19.85, opacity: 0.9970970153808594 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 1158.77, top: -13.54, opacity: 0.8707579970359802 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 1300.52, top: -9.04, opacity: 0.7808570265769958 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 890.35, top: -18.18, opacity: 0.963575005531311 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 161.48, top: 0, opacity: 0.6 }} />
                    <span className="absolute w-[2px] h-[2px] rounded-full bg-[#00FA92]" style={{ left: 21.25, top: 0, opacity: 0.6 }} />

                    {/* Soft background circles */}
                    <div className="absolute rounded-full" style={{ left: 360, top: 360, width: 128, height: 128, background: 'rgba(74, 222, 128, 0.05)' }} />
                    <div className="absolute rounded-full" style={{ left: 984, top: 984, width: 96, height: 96, background: 'rgba(0, 0, 0, 0)' }} />
                    <div className="absolute rounded-full" style={{ left: 0, top: 720, width: 64, height: 64, background: 'rgba(74, 222, 128, 0.1)' }} />
                </div>
            </div>
            <div className="hidden md:flex items-center gap-3 absolute top-8 left-8">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FA92] to-[#00C775] shadow-[0_0_20px_rgba(0,250,146,0.3),0_0_40px_rgba(0,250,146,0.1)]" />
                <span className="text-white font-semibold text-[20px] leading-[1.4]">LinkedIn AI Scraper</span>
            </div>
            <div className="w-[448px] bg-[rgba(3,6,4,0.8)] border border-[rgba(0,250,146,0.2)] shadow-2xl rounded-[16px] px-[33px] pt-[33px] pb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FA92] to-[#00C775] shadow-[0_0_20px_rgba(0,250,146,0.3),0_0_40px_rgba(0,250,146,0.1)]" />
                    <h1 className="text-[20px] leading-[1.4] font-semibold text-white">JobScraper AI</h1>
                </div>
                <div className="mt-2 h-1 w-16 bg-gradient-to-r from-transparent via-[#00FA92] to-transparent rounded-full mx-auto" />

                <div className="mt-8 text-center">
                    <h2 className="text-2xl font-semibold text-white">Create Your AI-Powered Account</h2>
                    <p className="mt-2 text-sm text-gray-400">Connect your data once — let our agent handle the rest.</p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className=" text-sm font-medium text-[#00FA92] mb-2 flex items-center gap-2">
                            <User size={12} className="text-[#00FA92]" />
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full h-[50px] bg-black/50 border border-white/10 text-gray-200 placeholder:text-[#ADAEBC] rounded-md pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#00FA92]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className=" text-sm font-medium text-[#00FA92] mb-2 flex items-center gap-2">
                            <Mail size={12} className="text-[#00FA92]" />
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-[50px] bg-black/50 border border-white/10 text-gray-200 placeholder:text-[#ADAEBC] rounded-md pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#00FA92]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className=" text-sm font-medium text-[#00FA92] mb-2 flex items-center gap-2">
                            <Lock size={12} className="text-[#00FA92]" />
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Create password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full h-[50px] bg-black/50 border border-white/10 text-gray-200 placeholder:text-[#ADAEBC] rounded-md pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00FA92]"
                            />
                            <button
                                type="button"
                                aria-label="Toggle password visibility"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className=" text-sm font-medium text-[#00FA92] mb-2 flex items-center gap-2">
                            <Lock size={12} className="text-[#00FA92]" />
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full h-[50px] bg-black/50 border border-white/10 text-gray-200 placeholder:text-[#ADAEBC] rounded-md pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00FA92]"
                            />
                            <button
                                type="button"
                                aria-label="Toggle confirm password visibility"
                                onClick={() => setShowConfirmPassword((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 h-[52px] rounded-md bg-gradient-to-tr from-[#00FA92] to-[#00D477] text-black font-semibold shadow-[0_4px_15px_rgba(0,250,146,0.3)] hover:opacity-90 transition inline-flex items-center justify-center gap-2"
                    >
                        Start My AI Journey <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-6 w-full text-center">
                    <p className="text-[14px] leading-[1.428] text-gray-300">
                        Already have an account? <a href="/auth/login" className="text-[#00FA92] hover:opacity-90">Log in</a>
                    </p>
                    <p className="mt-2 text-[14px] leading-[1.428]">
                        <a href="#" className="text-[#00FA92] hover:opacity-90">Forgot Password?</a>
                    </p>
                </div>

                <div className="mt-6 w-full">
                    <div className="h-px w-full bg-[#1F2937]" />
                    <p className="mt-4 text-center text-[12px] leading-[1.666] text-gray-300">
                        By creating an account, you agree to our <a href="#" className="text-[#00FA92] hover:opacity-90">Terms of Service</a> and
                    </p>
                    <p className="text-center text-[12px] leading-[1.666] text-gray-300">
                        <a href="#" className="text-[#00FA92] hover:opacity-90">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
