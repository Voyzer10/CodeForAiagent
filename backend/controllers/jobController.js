const Job = require("../model/job-information");
const fetch = require("node-fetch");
const User = require("../model/User");
const { jobQueue } = require("../queues/jobQueue");
const redis = require("../config/redis"); // ✅ Redis client
const { getCache, setCache } = require("../utils/cache"); // ✅ cache helper

console.log("🔄 jobController loaded with debugging");

/* ======================================================
   CREATE JOB  (NO CACHING HERE – WRITE PATH)
====================================================== */
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

    const finalSessionId = sessionId || `${userId}-${Date.now()}`;
    const finalRunId = runId || finalSessionId;

    await jobQueue.add("processJob", {
      userId,
      prompt,
      sessionId: finalSessionId,
      runId: finalRunId,
    });

    // ✅ IMPORTANT: invalidate cached jobs for this user
    await redis.del(`jobs:user:${userId}`);

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

/* ======================================================
   GET USER JOBS  (READ PATH + REDIS CACHING)
====================================================== */
const getUserJobs = async (req, res) => {
  const userId = Number(req.params.userId || req.user?.id);
  console.log("🧪 getUserJobs called for user:", userId);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  const cacheKey = `jobs:user:${userId}`;

  try {
    // 1️⃣ TRY REDIS CACHE
    console.log("🔍 Redis GET key:", cacheKey);
    const cachedJobs = await getCache(cacheKey);
    if (cachedJobs) {
      return res.status(200).json({
        jobs: cachedJobs,
        cached: true,
      });
    }

    console.log("📡 Cache MISS → Fetching jobs from DB for UserID:", userId);

    // 2️⃣ BUILD QUERY (same logic as before)
    const query = { UserID: userId };

    if (req.query.runId) {
      query.$or = [
        { runId: req.query.runId },
        { sessionId: req.query.runId },
        { sessionid: req.query.runId },
      ];
    } else if (req.query.sessionId) {
      query.$or = [
        { sessionId: req.query.sessionId },
        { sessionid: req.query.sessionId },
      ];
    }

    // 3️⃣ DB QUERY (LEAN = FAST)
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .lean(); // 🔥 BIG PERFORMANCE BOOST

    // 4️⃣ SAVE TO REDIS (5 MIN TTL)
    console.log("🧠 Redis SET key:", cacheKey);
    await setCache(cacheKey, jobs, 300);

    return res.status(200).json({
      jobs,
      cached: false,
    });
  } catch (error) {
    console.error("[getUserJobs] Error:", error);
    res.status(500).json({ message: "Server error fetching user jobs" });
  }
};

/* ======================================================
   ADMIN: GET ALL USER JOBS (NO CACHE FOR NOW)
====================================================== */
const getAllUserJobs = async (req, res) => {
  if (req.user?.role !== "admin") {
    console.warn("⛔ Unauthorized access attempt to admin route");
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    console.log("👑 Admin fetching all jobs with user details...");
    const jobs = await Job.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(jobs);
  } catch (err) {
    console.error("🔥 Error in getAllUserJobs:", err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createJob,
  getUserJobs,
  getAllUserJobs,
};
