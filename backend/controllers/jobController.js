const Job = require("../model/job-information");
const fetch = require("node-fetch");
const User = require("../model/User");
const { jobQueue } = require("../queues/jobQueue");
const redis = require("../config/redis");
const { getCache, setCache } = require("../utils/cache");

console.log("🔄 jobController loaded with debugging");

const companyLookup = [
  {
    $lookup: {
      from: "Company-Information",
      localField: "CompanyID",
      foreignField: "CompanyID",
      as: "companyInfo"
    }
  },
  {
    $unwind: {
      path: "$companyInfo",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $addFields: {
      company: {
        name: "$companyInfo.Comp_Name",
        logo: "$companyInfo.logo"
      }
    }
  },
  {
    $project: {
      companyInfo: 0
    }
  }
];

/* ======================================================
   CREATE JOB  (WRITE PATH)
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

    // 🔥 invalidate both caches
    await redis.del(`jobs:user:${userId}`);
    await redis.del(`jobs:user:${userId}:session:${finalRunId}`);

    console.log("🧹 Cache invalidated for user:", userId);

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
   GET USER JOBS (REDIS USER + SESSION CACHE)
====================================================== */
const getUserJobs = async (req, res) => {
  const userId = Number(req.params.userId || req.user?.id);
  console.log("🧪 getUserJobs called for user:", userId);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  const runId = req.query.runId || req.query.sessionId || null;

  const userCacheKey = `jobs:user:${userId}`;
  const sessionCacheKey = runId
    ? `jobs:user:${userId}:session:${runId}`
    : null;

  try {
    /* -------------------------------
       1️⃣ SESSION CACHE (POLLING FAST)
    --------------------------------*/
    if (sessionCacheKey) {
      console.log("🔍 Redis GET (session):", sessionCacheKey);
      const sessionCached = await getCache(sessionCacheKey);

      if (sessionCached) {
        console.log("⚡ SESSION CACHE HIT");
        return res.status(200).json({
          jobs: sessionCached,
          cached: true,
          cacheType: "session",
        });
      }
    }

    /* -------------------------------
       2️⃣ USER CACHE
    --------------------------------*/
    console.log("🔍 Redis GET (user):", userCacheKey);
    const cachedJobs = await getCache(userCacheKey);

    if (cachedJobs) {
      console.log("⚡ USER CACHE HIT");

      // If runId requested, filter & save session cache
      if (sessionCacheKey) {
        const filtered = cachedJobs.filter(
          (j) =>
            j.runId === runId ||
            j.sessionId === runId ||
            j.sessionid === runId
        );

        console.log(
          "🧠 Creating SESSION CACHE from USER CACHE:",
          filtered.length
        );

        await setCache(sessionCacheKey, filtered, 180);
        return res.status(200).json({
          jobs: filtered,
          cached: true,
          cacheType: "user→session",
        });
      }

      return res.status(200).json({
        jobs: cachedJobs,
        cached: true,
        cacheType: "user",
      });
    }

    /* -------------------------------
       3️⃣ DB FETCH (LAST RESORT)
    --------------------------------*/
    console.log("📡 Cache MISS → Fetching from DB");

    const query = { UserID: userId };

    if (runId) {
      query.$or = [
        { runId },
        { sessionId: runId },
        { sessionid: runId },
      ];
    }

    const jobs = await Job.aggregate([
      { $match: query },
      { $sort: { postedAt: -1 } },
      ...companyLookup
    ]);

    console.log("🧠 Redis SET (user):", userCacheKey);
    await setCache(userCacheKey, jobs, 300);

    if (sessionCacheKey) {
      const sessionJobs = jobs.filter(
        (j) =>
          j.runId === runId ||
          j.sessionId === runId ||
          j.sessionid === runId
      );

      console.log("🧠 Redis SET (session):", sessionCacheKey);
      await setCache(sessionCacheKey, sessionJobs, 180);

      return res.status(200).json({
        jobs: sessionJobs,
        cached: false,
        cacheType: "db→session",
      });
    }

    return res.status(200).json({
      jobs,
      cached: false,
      cacheType: "db",
    });
  } catch (error) {
    console.error("[getUserJobs] Error:", error);
    res.status(500).json({ message: "Server error fetching user jobs" });
  }
};

/* ======================================================
   ADMIN: GET ALL USER JOBS (NO CACHE)
====================================================== */
const getAllUserJobs = async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    const jobs = await Job.aggregate([
      { $sort: { createdAt: -1 } },
      ...companyLookup
    ]);

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
