// src/app/auth/login/page.js
'use client'

import { FcGoogle } from 'react-icons/fc'
import { Github, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image";
import registerImage from "../register/regsiter.jpg";

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
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

      // ✅ Store token in localStorage
      if (data.token) {
        console.log("🔑 Token saved:", data.token);
      } else {
        console.warn("⚠️ No token received from backend");
      }

      // ✅ Redirect to user panel
      router.push("/pages/userpanel");

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D4D5EE] px-4">
      <div className="bg-white shadow-xl rounded-lg flex w-full max-w-4xl overflow-hidden">
        
        {/* Left illustration */}
        <div className="hidden md:flex relative w-1/2 h-[600px]">
          <Image
            src={registerImage}
            alt="Team Work"
            fill
            className="object-contain rounded-lg"
            priority
          />
          <div className="absolute rounded-lg flex flex-col justify-center items-center text-center text-blue-900 p-10 z-10">
            <h2 className="text-3xl text-center font-extrabold">TrackMate</h2>
            <div className="text-center mt-96 py-6">
              <h3 className="text-2xl font-semibold">Project Management Service</h3>
              <p className="text-lg mt-2 max-w-md">Everything you need for convenient team work</p>
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="w-full md:w-1/2 p-8 bg-[#D4D5EE]">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign in</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={20}/>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={20}/>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end text-sm text-blue-600 hover:underline">
              <a href="#">Forgot the password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-bold"
            >
              Log in
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">Or</div>

          <div className="flex justify-center gap-4 mt-4 py-2.5 px-4 border rounded-md bg-white shadow-md cursor-pointer hover:bg-gray-100 transition">
            <FcGoogle className="text-xl cursor-pointer"/>
            Continue with Google
          </div>

          <div className="flex justify-center gap-4 mt-4 py-2.5 px-4 border rounded-md bg-white shadow-md cursor-pointer hover:bg-gray-100 transition">
            <Github className="text-gray-600 hover:text-black cursor-pointer"/>
            Continue with Github
          </div>

          <div className="mt-6 text-center text-sm">
            Don’t have an account?{' '}
            <a href="/auth/register" className="text-blue-600 hover:underline">
              Register now!
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
