const Job = require("../model/job-information");
const fetch = require("node-fetch");
const User = require("../model/User");
const { jobQueue } = require("../queues/jobQueue");

console.log("🔄 jobController loaded with debugging");

// controller/createJob.js
const createJob = async (req, res) => {
  const userId = req.user?.id || null;
  const { prompt, sessionId, runId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.plan || user.plan.expiresAt < Date.now()) {
      return res.status(403).json({ message: "No active subscription" });
    }

    if (user.plan.remainingJobs <= 0) {
      return res.status(403).json({
        message: "Insufficient tokens. Please upgrade or purchase credits.",
      });
    }

    // ✅ Ensure we have valid IDs
    const finalSessionId = sessionId || `${userId}-${Date.now()}`;
    const finalRunId = runId || finalSessionId;

    // ✅ Queue the single job properly  
    await jobQueue.add("processJob", { userId, prompt, sessionId: finalSessionId, runId: finalRunId });

    console.log("🧩 [createJob] Queued job for user:", userId, "session:", finalSessionId, "runId:", finalRunId);

    return res.status(202).json({
      message: "Job queued successfully",
      sessionId: finalSessionId,
      runId: finalRunId,
      userId,
    });
  } catch (err) {
    console.error("🔥 [createJob] Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
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

    // ✅ Build query
    const query = { UserID: userId };
    if (req.query.sessionId) query.sessionId = req.query.sessionId;
    if (req.query.runId) query.runId = req.query.runId;

    // ✅ Use correct DB field name
    const jobs = await Job.find(query).sort({ Posted_At: -1 });

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
// const updateJobCredits = async (req, res) => {
//   try {
//     // 🧩 Load secure environment variables
//     const SECRET_KEY = process.env.APIFY_WEBHOOK_KEY; // Your private webhook key
//     const APIFY_TOKEN = process.env.APIFY_TOKEN; // Your Apify API token

//     if (!SECRET_KEY || !APIFY_TOKEN) {
//       console.error("❌ Missing environment variables: APIFY_WEBHOOK_KEY or APIFY_TOKEN");
//       return res.status(500).json({ message: "Server misconfiguration" });
//     }

//     // 🔐 Verify webhook secret header
//     if (req.headers["x-webhook-secret"] !== SECRET_KEY) {
//       console.warn("🚫 Unauthorized webhook attempt detected");
//       return res.status(403).json({ message: "Unauthorized webhook request" });
//     }

//     const { userId, datasetUrl } = req.body;
//     if (!userId || !datasetUrl) {
//       return res.status(400).json({
//         message: "Missing userId or datasetUrl in request body",
//       });
//     }

//     console.log(`📬 Received Apify webhook for user ${userId}`);
//     console.log(`🌐 Dataset URL: ${datasetUrl}`);

//     // 🔹 Fetch dataset items from Apify API with authorization
//     const response = await fetch(`${datasetUrl}?token=${APIFY_TOKEN}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       console.error("❌ Failed to fetch dataset:", response.status, response.statusText);
//       return res.status(response.status).json({
//         message: "Failed to fetch Apify dataset",
//         status: response.status,
//       });
//     }

//     const data = await response.json();
//     const jobCount = Array.isArray(data) ? data.length : 0;

//     console.log(`📊 Dataset returned ${jobCount} jobs for user ${userId}`);

//     // 🔹 Find the user
//     const user = await User.findOne({ userId });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 🔹 Deduct actual number of generated jobs
//     if (jobCount > 0) {
//       const deduction = jobCount;
//       user.plan.remainingJobs = Math.max(user.plan.remainingJobs - deduction, 0);
//       await user.save();

//       console.log(
//         `✅ Deducted ${deduction} credits from user ${userId}. Remaining: ${user.plan.remainingJobs}`
//       );

//       return res.status(200).json({
//         message: `Deducted ${deduction} jobs from plan.`,
//         remainingJobs: user.plan.remainingJobs,
//       });
//     }

//     console.log("⚠️ No jobs found in dataset, skipping deduction.");
//     return res.status(200).json({ message: "No jobs to deduct." });
//   } catch (err) {
//     console.error("🔥 Error in updateJobCredits:", err);
//     res.status(500).json({ error: "Error updating job credits" });
//   }
// };

module.exports = {
  createJob,
  getUserJobs,
  getAllUserJobs,
  // updateJobCredits,
};
