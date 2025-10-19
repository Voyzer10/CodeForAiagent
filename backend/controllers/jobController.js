const Job = require("../model/job-information");
const fetch = require("node-fetch");
const User = require("../model/User");

console.log("🔄 jobController loaded with debugging");

// ✅ Create job
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

    // 3️⃣ Check job credits
    if (user.plan.remainingJobs < 100) {
      return res.status(403).json({
        message:
          "Not enough credits. Each search uses 100 credits. Please upgrade your plan.",
      });
    }

    // 4️⃣ Deduct 100 job credits per search
    user.plan.remainingJobs -= 100;
    await user.save();

    console.log("➡️ Incoming request:", { prompt, userId });

    const sessionId = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const url =
      "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";
    console.log("📡 Sending request to n8n:", url);

    // 5️⃣ Send to n8n
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
      console.error(
        "❌ Failed to parse JSON from n8n:",
        err.message,
        "Raw:",
        rawText
      );
      return res.status(500).json({ error: "Invalid JSON response from n8n" });
    }

    console.log("✅ Parsed response from n8n:", parsed);

    // 6️⃣ Save job(s) to Mongo
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
  const userId = Number(req.params.userId || req.user?.id);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  try {
    console.log("📡 Fetching jobs for UserID:", userId);

    // ✅ Use correct DB field name
    const jobs = await Job.find({ UserID: userId }).sort({ Posted_At: -1 });

    // ✅ No normalization — send directly
    res.status(200).json({ jobs });
  } catch (error) {
    console.error("[getUserJobs] Error:", error);
    res.status(500).json({ message: "Server error fetching user jobs" });
  }
};

module.exports = { getUserJobs };

// ✅ Admin only: Get all jobs from all users
const getAllUserJobs = async (req, res) => {
  if (req.user?.role !== "admin") {
    console.warn("⛔ Unauthorized access attempt to admin route");
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    console.log("👑 Admin fetching all jobs with user details...");
    const jobs = await Job.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ Admin fetched ${jobs.length} total jobs`);
    return res.json(jobs);
  } catch (err) {
    console.error("🔥 Error in getAllUserJobs:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Webhook to update job credits based on Apify dataset results
const updateJobCredits = async (req, res) => {
  try {
    // 🧩 Load secure environment variables
    const SECRET_KEY = process.env.APIFY_WEBHOOK_KEY; // Your private webhook key
    const APIFY_TOKEN = process.env.APIFY_TOKEN; // Your Apify API token

    if (!SECRET_KEY || !APIFY_TOKEN) {
      console.error("❌ Missing environment variables: APIFY_WEBHOOK_KEY or APIFY_TOKEN");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // 🔐 Verify webhook secret header
    if (req.headers["x-webhook-secret"] !== SECRET_KEY) {
      console.warn("🚫 Unauthorized webhook attempt detected");
      return res.status(403).json({ message: "Unauthorized webhook request" });
    }

    const { userId, datasetUrl } = req.body;
    if (!userId || !datasetUrl) {
      return res.status(400).json({
        message: "Missing userId or datasetUrl in request body",
      });
    }

    console.log(`📬 Received Apify webhook for user ${userId}`);
    console.log(`🌐 Dataset URL: ${datasetUrl}`);

    // 🔹 Fetch dataset items from Apify API with authorization
    const response = await fetch(`${datasetUrl}?token=${APIFY_TOKEN}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Failed to fetch dataset:", response.status, response.statusText);
      return res.status(response.status).json({
        message: "Failed to fetch Apify dataset",
        status: response.status,
      });
    }

    const data = await response.json();
    const jobCount = Array.isArray(data) ? data.length : 0;

    console.log(`📊 Dataset returned ${jobCount} jobs for user ${userId}`);

    // 🔹 Find the user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Deduct actual number of generated jobs
    if (jobCount > 0) {
      const deduction = jobCount;
      user.plan.remainingJobs = Math.max(user.plan.remainingJobs - deduction, 0);
      await user.save();

      console.log(
        `✅ Deducted ${deduction} credits from user ${userId}. Remaining: ${user.plan.remainingJobs}`
      );

      return res.status(200).json({
        message: `Deducted ${deduction} jobs from plan.`,
        remainingJobs: user.plan.remainingJobs,
      });
    }

    console.log("⚠️ No jobs found in dataset, skipping deduction.");
    return res.status(200).json({ message: "No jobs to deduct." });
  } catch (err) {
    console.error("🔥 Error in updateJobCredits:", err);
    res.status(500).json({ error: "Error updating job credits" });
  }
};

module.exports = {
  createJob,
  getUserJobs,
  getAllUserJobs,
  updateJobCredits,
};
