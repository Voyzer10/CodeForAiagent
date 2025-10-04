const Job = require("../model/application-tracking");
const fetch = require("node-fetch");

// Create job (from n8n + attach userId)
const createJob = async (req, res) => {
  const userId = req.user?.id || null; // comes from JWT middleware
  const { prompt } = req.body;

  if (!userId) {
    console.warn("⚠️ No authenticated user found, saving as guest");
  }
  console.log("👤 Authenticated userId:", userId);

  try {
    console.log("➡️ Incoming request:", { prompt, userId });

    // 🔑 Generate unique sessionId (different from userId)
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Call n8n webhook
    const url = "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";
    console.log("📡 Sending request to n8n:", url);

    const n8nRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, sessionId, userId }), // ✅ sessionId and userId passed
    });

    let parsed;
    try {
      parsed = await n8nRes.json();
    } catch (err) {
      const rawText = await n8nRes.text();
      console.error("❌ Failed to parse JSON from n8n:", err.message, "Raw:", rawText);
      return res.status(500).json({ error: "Invalid JSON response from n8n" });
    }

    console.log("✅ Parsed response from n8n:", parsed);

    // Case A: Array of jobs
    if (Array.isArray(parsed) && parsed.length > 0) {
      const jobsToSave = parsed.map((job) => ({
        ...job,
        sessionId, // ✅ unique tracking ID
        ...(userId && { userId }), // attach userId only if logged in
      }));

      const savedJobs = await Job.insertMany(jobsToSave);
      console.log("💾 Saved jobs:", savedJobs);

      return res.status(201).json(savedJobs);
    }

    // Case B: Object with "output"
    if (parsed && typeof parsed === "object" && parsed.output) {
      console.log("📝 Returning n8n output message");
      return res.json({ output: parsed.output, sessionId, userId });
    }

    // Case C: Unexpected format
    console.warn("⚠️ Unexpected n8n response format:", parsed);
    return res.json({ output: JSON.stringify(parsed), sessionId, userId });
  } catch (err) {
    console.error("🔥 Error in createJob:", err);
    res.status(500).json({ error: "Something went wrong. Check logs." });
  }
};

// Get jobs by authenticated user
const getUserJobs = async (req, res) => {
  const userId = req.user?.id; // 👈 yaha bhi fix
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    console.log("📡 Fetching jobs for user:", userId);
    const jobs = await Job.find({ userId });
    res.json(jobs);
  } catch (err) {
    console.error("🔥 Error in getUserJobs:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📌 Admin only: Get all jobs from all users
const getAllUserJobs = async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    console.log("👑 Admin fetching all jobs");
    const jobs = await Job.find().populate("userId", "name email"); // populate user details
    res.json(jobs);
  } catch (err) {
    console.error("🔥 Error in getAllUserJobs:", err);
    res.status(500).json({ error: err.message });
  }
};

console.log("🔄 jobController loaded");

module.exports = {
  createJob,
  getUserJobs,
  getAllUserJobs, // 👈 export bhi karna h
};
