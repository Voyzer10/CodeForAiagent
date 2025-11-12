"use client";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");   // ✅ change username -> email
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
       const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }), // ✅ send email, not username
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        window.location.href = "/admin/dashboard"; // ✅ redirect after login
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("⚠️ Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 p-6 border rounded w-80"
      >
        <h2 className="text-xl font-bold text-center">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"       // ✅ updated label
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>

        {message && <p className="text-red-500">{message}</p>}
      </form>
    </div>
  );
}
