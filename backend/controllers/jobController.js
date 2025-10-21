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
    // 1️⃣ Fetch and validate user
    const user = await User.findOne({ userId });
    if (!user) {
      console.error("❌ [createJob] User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("👤 [createJob] User found:", user.name);
    console.log("📦 [createJob] Plan details:", user.plan);

    // 2️⃣ Validate subscription
    if (!user.plan || user.plan.expiresAt < Date.now()) {
      console.warn("⚠️ [createJob] No active subscription or plan expired");
      console.log("🕒 Plan Expiry:", user.plan?.expiresAt);
      return res.status(403).json({ message: "No active subscription" });
    }

    // 3️⃣ Validate available tokens before proceeding
    const availableTokens = user.plan.remainingJobs || 0;
    console.log("🔢 [createJob] Tokens available:", availableTokens);

    if (availableTokens <= 0) {
      console.warn("🚫 [createJob] No tokens left — upgrade required");
      console.log(
        "💡 [Suggestion] Ask user to upgrade plan or purchase more tokens"
      );
      return res.status(403).json({
        message:
          "Insufficient tokens. Please upgrade or purchase additional credits.",
      });
    }

    // 4️⃣ Proceed with sending prompt to n8n → Apify
    const sessionId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const n8nWebhook =
      "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";

    console.log("📡 [createJob] Sending request to n8n webhook:", n8nWebhook);

    const n8nResponse = await fetch(n8nWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, sessionId, userId }),
    });

    let parsed;
    try {
      parsed = await n8nResponse.json();
      console.log("✅ [createJob] n8n response received:", parsed);
    } catch (err) {
      const rawText = await n8nResponse.text();
      console.error(
        "❌ [createJob] Failed to parse n8n JSON:",
        err.message,
        "Raw:",
        rawText
      );
      return res.status(500).json({ error: "Invalid response from n8n" });
    }

    // 5️⃣ Expect dataset URL from n8n → Apify
    if (!parsed.datasetUrl) {
      console.warn(
        "⚠️ [createJob] Missing datasetUrl in n8n response. Received:",
        parsed
      );
      return res.status(200).json({
        message: "n8n did not return dataset URL. Check Apify workflow.",
      });
    }

    const datasetUrl = parsed.datasetUrl;
    console.log("🌐 [createJob] Fetching Apify dataset from:", datasetUrl);

    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if (!APIFY_TOKEN) {
      console.error("❌ [createJob] Missing APIFY_TOKEN in environment vars");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // 6️⃣ Fetch Apify dataset and count jobs
    const datasetResponse = await fetch(`${datasetUrl}?token=${APIFY_TOKEN}`);
    const datasetData = await datasetResponse.json();

    const jobCount = Array.isArray(datasetData) ? datasetData.length : 0;
    console.log(`📊 [createJob] Apify returned ${jobCount} job(s)`);

    if (jobCount === 0) {
      console.warn("⚠️ [createJob] No jobs found in dataset — skipping save");
      return res
        .status(200)
        .json({ message: "No jobs returned from Apify dataset." });
    }

    // 7️⃣ Check if user has enough tokens for actual job count
    if (availableTokens < jobCount) {
      console.warn(
        `🚫 [createJob] Insufficient tokens. Required: ${jobCount}, Available: ${availableTokens}`
      );
      console.log("💡 User should upgrade or repurchase plan.");
      return res.status(403).json({
        message: `Not enough tokens. Required: ${jobCount}, Available: ${availableTokens}`,
      });
    }

    // 8️⃣ Deduct exact tokens used
    user.plan.remainingJobs -= jobCount;
    await user.save();
    console.log(
      `💰 [createJob] Deducted ${jobCount} tokens. Remaining: ${user.plan.remainingJobs}`
    );

    // 9️⃣ Save all jobs in MongoDB
    const jobsToSave = datasetData.map((job) => ({
      ...job,
      userId,
      sessionId,
    }));
    const savedJobs = await Job.insertMany(jobsToSave);

    console.log(`💾 [createJob] Successfully saved ${savedJobs.length} jobs`);
    return res.status(201).json(savedJobs);
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
