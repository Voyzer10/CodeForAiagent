const express = require("express");
const router = express.Router();
const Job = require("../model/application-tracking");
const { logToFile } = require("../logger");

router.post("/", async (req, res) => {
  // 🔒 Secure Webhook: Validation
  const incomingSecret = req.headers["x-webhook-secret"];
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (expectedSecret && incomingSecret !== expectedSecret) {
    console.warn("⚠️ Unauthorized webhook attempt blocked.");
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("📩 [n8nCallback] Raw body:", req.body);

  if (!req.body) return res.status(400).json({ message: "Empty body" });

  const data = req.body;

  // Extract consistent UUID
  let jobid =
    data.jobid ||
    data.jobId ||
    data.id ||
    data.job_id;

  if (!jobid) {
    jobid = `fallback-${Date.now()}`;
    console.warn("⚠️ Missing jobid. Using fallback:", jobid);
  }

  const updateData = {
    jobid,
    trackingId: data.userId || data.trackingId,
    refId: data.refId,
    sent: data.sent || false,
    email_to: data.email_to || data.email,
    email_subject: data.email_subject || data.subject,
    email_content: data.email_content || data.content || data.body,
  };

  try {
    const job = await Job.findOneAndUpdate(
      { jobid },
      updateData,
      { new: true, upsert: true }
    );

    console.log("💾 Saved N8N job:", job);
    res.json({ success: true, job });
  } catch (err) {
    console.error("❌ Callback Error:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

module.exports = router;
