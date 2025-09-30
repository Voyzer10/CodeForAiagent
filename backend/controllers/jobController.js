const Job = require("../model/jobs");
const fetch = require("node-fetch");

// Create job (from n8n + attach userId)
const createJob = async (req, res) => {
  const userId = req.user?.id || null; // 👈 authMiddleware se aa raha hai
  const { prompt } = req.body;

  if (!userId) {
    console.warn("⚠️ No authenticated user found, generating temporary sessionId");
  }
  console.log("👤 Authenticated userId:", userId);

  try {
    console.log("➡️ Incoming request:", { prompt, userId });

    const sessionId = userId || Date.now().toString();

    // Call n8n webhook
    const url = "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";
    console.log("📡 Sending request to n8n:", url);

    const n8nRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, sessionId }),
    });

    const rawText = await n8nRes.text();
    console.log("📥 n8n raw response body:", rawText);

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Failed to parse JSON from n8n:", err.message);
      return res.status(500).json({ error: "Invalid JSON response from n8n" });
    }

    console.log("✅ Parsed response from n8n:", parsed);

    // Case A: n8n returned an array of jobs
    if (Array.isArray(parsed) && parsed.length > 0) {
      const jobsToSave = parsed.map((job) => ({
        ...job,
        ...(userId && { userId }), // ✅ userId attach only if exists
      }));

      const savedJobs = await Job.insertMany(jobsToSave);
      console.log("💾 Saved jobs:", savedJobs);

      return res.status(201).json(savedJobs);
    }

    // Case B: n8n returned object with "output"
    if (parsed && typeof parsed === "object" && parsed.output) {
      console.log("📝 Returning n8n output message");
      return res.json({ output: parsed.output });
    }

    // Case C: Unexpected format
    console.warn("⚠️ Unexpected n8n response format:", parsed);
    return res.json({ output: JSON.stringify(parsed) });
  } catch (err) {
    console.error("🔥 Error in createJob:", err);
    res.status(500).json({ error: err.message });
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
