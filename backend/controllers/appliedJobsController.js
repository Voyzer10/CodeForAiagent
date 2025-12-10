// controllers/appliedJobsController.js
const User = require("../model/User");
const Job = require("../model/application-tracking");

/**
 * GET /api/applied-jobs/user/:userId
 * Fetch all jobs that have Gmail drafts created (applied jobs)
 */
exports.getAppliedJobs = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        // Find user to verify they exist
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find all jobs where drafts were created (sent = true indicates draft was created)
        // You can adjust this query based on your tracking logic
        const appliedJobs = await Job.find({
            trackingId: String(userId),
            sent: true
        }).sort({ createdAt: -1 });

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
 * Mark a job as applied (draft created)
 */
exports.markJobAsApplied = async (req, res) => {
    try {
        const { userId, jobid } = req.body;

        if (!userId || !jobid) {
            return res.status(400).json({ error: "userId and jobid required" });
        }

        // Find the job
        let job = await Job.findOne({ jobid });
        if (!job) {
            job = await Job.findOne({ jobId: jobid });
        }
        if (!job) {
            job = await Job.findOne({ id: jobid });
        }

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Mark as sent (applied)
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
 * Check if a specific job has been applied to
 */
exports.checkJobApplied = async (req, res) => {
    try {
        const jobid = req.params.jobid;

        console.log(`🔎 Searching for job with ID: ${jobid}`);

        // Check for job existence (processed by N8N)
        // We do NOT require 'sent: true' here because 'sent' is often set AFTER draft creation
        let job = await Job.findOne({ jobid });
        if (!job) {
            job = await Job.findOne({ jobId: jobid });
        }
        if (!job) {
            job = await Job.findOne({ id: jobid });
        }

        if (job) {
            console.log(`[${new Date().toISOString()}] ✅ Job found: ${job._id}`);
            console.log(`[${new Date().toISOString()}] 📧 Draft Details -> To: '${job.email_to}', Subject: '${job.email_subject}'`);
        } else {
            console.log(`[${new Date().toISOString()}] ❌ Job NOT found in Application-Tracking yet.`);
        }

        return res.json({
            exists: !!job,
            applied: !!job?.sent,
            job: job || null,
        });
    } catch (err) {
        console.error("❌ checkJobApplied ERROR:", err);
        return res.status(500).json({ error: "Failed to check job status" });
    }
};
