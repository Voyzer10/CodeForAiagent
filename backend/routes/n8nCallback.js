// routes/n8nCallback.js
const express = require("express");
const router = express.Router();
const { logToFile } = require("../logger");
const Job = require("../model/application-tracking");

router.post("/", async (req, res) => {
  console.log("✅ [n8nCallback] Raw body:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    console.log("⚠️ [n8nCallback] Empty body received");
    return res.status(400).json({ message: "Empty body" });
  }

  const data = req.body;
  logToFile(`[n8nCallback] Data received: ${JSON.stringify(data, null, 2)}`);

  try {
    // Standardize fields
    let jobid = data.jobid || data.jobId || data.id || data.job_id;
    const trackingId = data.userId || data.trackingId || "unknown"; // trackingId is often userId

    if (!jobid) {
      console.warn("⚠️ [n8nCallback] Missing jobid/jobId in payload. Generating fallback ID.");
      jobid = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }

    const updateData = {
      jobid: jobid,
      trackingId: trackingId,
      refId: data.refId,
      sent: data.sent || false, // or handle 'no_email_found' logic if needed
      email_to: data.email_to || data.email,
      email_subject: data.email_subject || data.subject,
      email_content: data.email_content || data.content || data.body,
    };

    // Upsert: Find by jobid, update if exists, insert if not
    const job = await Job.findOneAndUpdate(
      { jobid: jobid },
      updateData,
      { new: true, upsert: true }
    );

    console.log(`💾 [n8nCallback] Saved job ${jobid} to DB. Object ID: ${job._id}`);
    res.json({ success: true, job });

  } catch (err) {
    console.error("❌ [n8nCallback] Save Error:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

module.exports = router;
