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

    // ✅ Build query with robust ID matching
    const query = { UserID: userId };

    if (req.query.runId) {
      query.$or = [
        { runId: req.query.runId },
        { sessionId: req.query.runId },
        { sessionid: req.query.runId }
      ];
    } else if (req.query.sessionId) {
      query.$or = [
        { sessionId: req.query.sessionId },
        { sessionid: req.query.sessionId }
      ];
    }

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



module.exports = {
  createJob,
  getUserJobs,
  getAllUserJobs,
  // updateJobCredits,
};
