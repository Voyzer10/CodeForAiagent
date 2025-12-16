const express = require("express");
const { progressMap } = require("../model/progressStore");

const router = express.Router();

router.post("/update", (req, res) => {
  const secret = req.headers["x-n8n-secret"];
  if (secret !== process.env.N8N_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { runId, progress, message, status } = req.body;
  if (!runId) return res.status(400).json({ error: "runId required" });

  progressMap.set(runId, {
    progress,
    message,
    status,
    updatedAt: Date.now(),
  });

  res.json({ success: true });
});

router.get("/stream/:runId", (req, res) => {
  const { runId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    const data = progressMap.get(runId);
    if (data) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

module.exports = router;
