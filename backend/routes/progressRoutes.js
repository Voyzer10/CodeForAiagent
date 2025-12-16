const express = require("express");
const { progressMap } = require("../model/progressStore");

const router = express.Router();

/* -------------------------------------------------
   POST /api/progress/update
   Called by n8n to update progress
-------------------------------------------------- */
router.post("/update", (req, res) => {
  try {
    const secret = req.headers["x-n8n-secret"];

    // 🔐 Secret validation
    if (!secret) {
      console.error("❌ Progress update failed: Missing X-N8N-SECRET");
      return res.status(401).json({ error: "Missing secret" });
    }

    if (secret !== process.env.N8N_SECRET) {
      console.error("❌ Progress update failed: Invalid secret");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { runId, progress, message, status } = req.body;

    // 🧪 Validation
    if (!runId) {
      console.error("❌ Progress update failed: runId missing", req.body);
      return res.status(400).json({ error: "runId missing" });
    }

    // ✅ Store progress
    progressMap.set(runId, {
      progress: Number(progress) || 0,
      message: message || "Working…",
      status: status || "running",
      updatedAt: Date.now(),
    });

    console.log(
      `📩 Progress updated | runId=${runId} | ${progress}% | ${message}`
    );

    return res.json({
      success: true,
      runId,
      progress,
    });
  } catch (err) {
    console.error("🔥 Progress update crash:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------
   GET /api/progress/:runId
   Called by frontend polling
-------------------------------------------------- */
router.get("/:runId", (req, res) => {
  try {
    const { runId } = req.params;

    if (!runId) {
      return res.status(400).json({
        progress: 0,
        message: "runId missing",
        status: "error",
      });
    }

    const data = progressMap.get(runId);

    // 🟡 No progress yet (job just started)
    if (!data) {
      console.log(`ℹ️ Progress check: no data yet for runId=${runId}`);
      return res.json({
        progress: 0,
        message: "Starting job…",
        status: "running",
      });
    }

    console.log(
      `📤 Progress fetched | runId=${runId} | ${data.progress}%`
    );

    return res.json(data);
  } catch (err) {
    console.error("🔥 Progress fetch crash:", err);
    return res.status(500).json({
      progress: 0,
      message: "Failed to fetch progress",
      status: "error",
    });
  }
});

module.exports = router;
