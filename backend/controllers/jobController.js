const Job = require("../model/jobs");
const fetch = require("node-fetch");

// Create job (from n8n + attach userId)
const createJob = async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.id;
  console.log("👤 Authenticated userId:", userId);

  try {
    console.log("➡️ Incoming request:", { prompt, userId });

    // 🔑 sessionId generate (agar userId mila to use karo, warna random)
    const sessionId = userId || Date.now().toString();

    // 1. Call n8n webhook
    const url = "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";
    console.log("📡 Sending request to n8n:", url);

    const n8nRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, sessionId }), // 👈 sessionId added here
    });

    console.log("📥 n8n status:", n8nRes.status);

    // 2. Read raw response
    const rawText = await n8nRes.text();
    console.log("📥 n8n raw response body:", rawText);

    let jobs;
    try {
      jobs = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Failed to parse JSON from n8n:", err.message);
      return res.status(500).json({ error: "Invalid JSON response from n8n" });
    }

    console.log("✅ Parsed jobs from n8n:", jobs);

    // 3. Validate jobs array
    if (!Array.isArray(jobs)) {
      console.error("❌ n8n did not return an array of jobs");
      return res.status(500).json({ error: "n8n did not return a valid jobs array" });
    }

    // 4. Save each job with userId
    const savedJobs = await Job.insertMany(
      jobs.map(job => ({
        ...job,
        userId,
      }))
    );

    console.log("💾 Saved jobs:", savedJobs);
    res.status(201).json(savedJobs);
  } catch (err) {
    console.error("🔥 Error in createJob:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get jobs by userId
const getUserJobs = async (req, res) => {
  const { userId } = req.params;
  try {
    console.log("📡 Fetching jobs for user:", userId);
    const jobs = await Job.find({ userId });
    res.json(jobs);
  } catch (err) {
    console.error("🔥 Error in getUserJobs:", err);
    res.status(500).json({ error: err.message });
  }
};

console.log("🔄 jobController loaded");

module.exports = {
  createJob,
  getUserJobs,
};
