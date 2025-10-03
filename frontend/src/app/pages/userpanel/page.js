"use client";

import { useState, useEffect } from "react";

export default function UserPanel() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ Fetch current user (name + id) on mount
  // Fetch current user
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch user");

      setUser(data.user);
    } catch (err) {
      console.error("Fetch user error:", err);
      setError(err.message);
    }
  };
  fetchUser();
}, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:5000/api/userjobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔑 cookie with token is auto-sent
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
  const errorData = await res.json();
  throw new Error(errorData.message || `Server error: ${res.status}`);
}
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-4">
      <h1 className="text-2xl font-bold mb-4">User Panel</h1>

      {/* ✅ Show logged-in user info */}
      {user && (
  <div className="mb-4 p-3 border rounded bg-gray-50">
    <p><strong>Name:</strong> {user.name}</p>
    <p><strong>User ID:</strong> {user.userId}</p>
  </div>
)}


      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="prompt" className="font-medium">Enter your prompt:</label>
        <textarea
          id="prompt"
          rows={5}
          cols={50}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          placeholder="Type your prompt here..."
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">Error: {error}</p>}

      {/* Job Results */}
      {response && Array.isArray(response) && (
        <div style={{ marginTop: "20px" }}>
          <h3>Job Results:</h3>
          <div style={{ display: "grid", gap: "15px", marginTop: "10px" }}>
            {response.map((job, idx) => (
              <div
                key={idx}
                style={{
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#f9f9f9"
                }}
              >
                <h4 style={{ margin: "0 0 5px 0" }}>{job.title}</h4>
                <p style={{ margin: "0", fontWeight: "bold" }}>{job.company}</p>
                <p style={{ margin: "5px 0" }}>{job.location}</p>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#555" }}>
                  {job.description}
                </p>
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0070f3", textDecoration: "underline" }}
                >
                  View Job
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* n8n custom output */}
      {response && !Array.isArray(response) && response.output && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response:</h3>
          <p>{response.output}</p>
        </div>
      )}
    </div>
  );
}
