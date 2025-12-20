// controllers/appliedJobsController.js
const User = require("../model/User");
const Job = require("../model/application-tracking");

/**
 * GET /api/applied-jobs/user/:userId
 */
exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = String(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    console.log(`\n🔍 getAppliedJobs called for userId: ${userId}`);

    const user = await User.findOne({ userId: Number(userId) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /**
     * ✅ LONG-TERM SAFE QUERY
     * - Handles sent = true
     * - Handles sent = "true"
     * - NO mongoose casting issues
     */
    const appliedJobs = await Job.aggregate([
      {
        $match: {
          trackingId: userId,
          $expr: {
            $eq: [{ $toString: "$sent" }, "true"],
          },
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: "Company-Information",
          localField: "CompanyID",
          foreignField: "CompanyID",
          as: "companyInfo",
        },
      },
      {
        $unwind: {
          path: "$companyInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          company: {
            name: "$companyInfo.Comp_Name",
            logo: "$companyInfo.logo",
          },
        },
      },
      {
        $project: {
          companyInfo: 0,
        },
      },
    ]);

    console.log(`📦 Found ${appliedJobs.length} applied jobs.`);

    return res.json({
      success: true,
      count: appliedJobs.length,
      jobs: appliedJobs,
    });
  } catch (err) {
    console.error("❌ getAppliedJobs ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch applied jobs" });
  }
};

/**
 * POST /api/applied-jobs/mark-applied
 */
exports.markJobAsApplied = async (req, res) => {
  try {
    const { userId, jobid } = req.body;

    if (!userId || !jobid) {
      return res.status(400).json({ error: "userId and jobid required" });
    }

    let job =
      (await Job.findOne({ jobid })) ||
      (await Job.findOne({ jobId: jobid })) ||
      (await Job.findOne({ id: jobid }));

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // ✅ Store boolean (even if n8n stores string elsewhere)
    job.sent = true;
    job.trackingId = String(userId);
    await job.save();

    return res.json({
      success: true,
      message: "Job marked as applied",
      job,
    });
  } catch (err) {
    console.error("❌ markJobAsApplied ERROR:", err);
    return res.status(500).json({ error: "Failed to mark job as applied" });
  }
};

/**
 * GET /api/applied-jobs/check/:jobid
 */
exports.checkJobApplied = async (req, res) => {
  try {
    const jobid = req.params.jobid;

    let job =
      (await Job.findOne({ jobid })) ||
      (await Job.findOne({ jobId: jobid })) ||
      (await Job.findOne({ id: jobid }));

    return res.json({
      exists: !!job,
      applied: job ? job.sent === true || job.sent === "true" : false,
      job,
    });
  } catch (err) {
    console.error("❌ checkJobApplied ERROR:", err);
    return res.status(500).json({ error: "Failed to check job status" });
  }
};
