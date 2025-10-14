const Job = require("../model/job-information");
const fetch = require("node-fetch");
const User = require("../model/User");

// ✅ Create job (already working fine, no changes)
const createJob = async (req, res) => {
  const userId = req.user?.id || null; // comes from JWT middleware
  const { prompt } = req.body;

  if (!userId) {
    console.warn("⚠️ No authenticated user found, saving as guest");
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  console.log("👤 Authenticated userId:", userId);

  try {
    // 1️⃣ Fetch user by numeric userId (not Mongo _id)
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Validate subscription
    if (!user.plan || user.plan.expiresAt < Date.now()) {
      return res.status(403).json({ message: "No active subscription" });
    }

    // 2️⃣ Check job credits
    if (user.plan.remainingJobs < 100) {
      return res.status(403).json({
        message: "Not enough credits. Each search uses 100 credits. Please upgrade your plan.",
      });
    }

    // 3️⃣ Deduct 100 job credits per search
    user.plan.remainingJobs -= 100;
    await user.save();


    console.log("➡️ Incoming request:", { prompt, userId });
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const url = "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";
    console.log("📡 Sending request to n8n:", url);

    // 4️⃣ Send to n8n
    const n8nRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, sessionId, userId }),
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

    // 5️⃣ Save job(s) to Mongo
    if (Array.isArray(parsed) && parsed.length > 0) {
      const jobsToSave = parsed.map((job) => ({
        ...job,
        sessionId,
        userId,
      }));

      const savedJobs = await Job.insertMany(jobsToSave);
      console.log("💾 Saved jobs:", savedJobs);

      return res.status(201).json(savedJobs);
    }

    if (parsed && typeof parsed === "object" && parsed.output) {
      console.log("📝 Returning n8n output message");
      return res.json({ output: parsed.output, sessionId, userId });
    }

    console.warn("⚠️ Unexpected n8n response format:", parsed);
    return res.json({ output: JSON.stringify(parsed), sessionId, userId });
  } catch (err) {
    console.error("🔥 Error in createJob:", err);
    res.status(500).json({ error: "Something went wrong. Check logs." });
  }
};



// ✅ Get jobs by authenticated user or specific userId
const getUserJobs = async (req, res) => {
  // Support both token-based and param-based queries
  const userId = Number(req.params.userId || req.user?.id);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  try {
    console.log("📡 Fetching jobs for UserID:", userId);

    // ✅ Use correct DB field name (UserID)
    const jobs = await Job.find({ UserID: userId }).sort({ Posted_At: -1 });

    if (!jobs.length) {
      console.log("ℹ️ No jobs found for UserID:", userId);
      return res.json({ jobs: [] });
    }

    console.log(`✅ Found ${jobs.length} jobs for UserID ${userId}`);
    return res.json({ jobs });
  } catch (err) {
    console.error("🔥 Error in getUserJobs:", err);
    return res.status(500).json({ error: err.message });
  }
};


// ✅ Admin only: Get all jobs from all users (Admin Panel)
const getAllUserJobs = async (req, res) => {
  if (req.user?.role !== "admin") {
    console.warn("⛔ Unauthorized access attempt to admin route");
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    console.log("👑 Admin fetching all jobs with user details...");
    const jobs = await Job.find()
      .populate("userId", "name email") // show user details
      .sort({ createdAt: -1 });

    console.log(`✅ Admin fetched ${jobs.length} total jobs`);
    return res.json(jobs);
  } catch (err) {
    console.error("🔥 Error in getAllUserJobs:", err);
    return res.status(500).json({ error: err.message });
  }
};

console.log("🔄 jobController loaded with debugging");

module.exports = {
  createJob,
  getUserJobs,
  getAllUserJobs,
};
