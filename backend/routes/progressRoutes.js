const express = require("express");
const { progressMap } = require("../model/progressStore");
const {
  searchErrorMap,
  jobErrorMap,
} = require("../model/errorStore");

const router = express.Router();

/* -------------------------------------------------
   Shared Secret Validator
-------------------------------------------------- */
function validateSecret(req, res) {
  const secret = req.headers["x-n8n-secret"];

  if (!secret || secret !== process.env.N8N_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return true;
}

/* -------------------------------------------------
   SEARCH PROGRESS (runId)
-------------------------------------------------- */
router.post("/update", (req, res) => {
  if (!validateSecret(req, res)) return;

  const { runId, progress, message, status } = req.body;
  if (!runId) return res.status(400).json({ error: "runId missing" });

  progressMap.set(runId, {
    progress: Number(progress) || 0,
    message: message || "Working…",
    status: status || "running",
    updatedAt: Date.now(),
  });

  return res.json({ success: true });
});

/* -------------------------------------------------
   🚨 SEARCH ERROR (runId)
-------------------------------------------------- */
router.post("/error/search", (req, res) => {
  if (!validateSecret(req, res)) return;

  const { runId, code, message } = req.body;
  if (!runId || !message) {
    return res.status(400).json({ error: "runId & message required" });
  }

  searchErrorMap.set(runId, {
    code: code || "SEARCH_FAILED",
    message,
    status: "error",
    createdAt: Date.now(),
  });

  progressMap.set(runId, {
    progress: 100,
    message: "Search failed",
    status: "error",
    updatedAt: Date.now(),
  });

  return res.json({ success: true });
});

/* -------------------------------------------------
   🚨 JOB ERROR (jobId)
-------------------------------------------------- */
router.post("/error/job", (req, res) => {
  if (!validateSecret(req, res)) return;

  const { jobId, code, message } = req.body;
  if (!jobId || !message) {
    return res.status(400).json({ error: "jobId & message required" });
  }

  jobErrorMap.set(jobId, {
    code: code || "JOB_ERROR",
    message,
    status: "error",
    createdAt: Date.now(),
  });

  return res.json({ success: true });
});

/* -------------------------------------------------
   GET SEARCH PROGRESS
-------------------------------------------------- */
router.get("/:runId", (req, res) => {
  const data = progressMap.get(req.params.runId);
  return res.json(
    data || { progress: 0, message: "Starting…", status: "running" }
  );
});

/* -------------------------------------------------
   GET SEARCH ERROR
-------------------------------------------------- */
router.get("/error/search/:runId", (req, res) => {
  const error = searchErrorMap.get(req.params.runId);
  return res.json(error ? { hasError: true, ...error } : { hasError: false });
});

/* -------------------------------------------------
   GET JOB ERROR
-------------------------------------------------- */
router.get("/error/job/:jobId", (req, res) => {
  const error = jobErrorMap.get(req.params.jobId);
  return res.json(error ? { hasError: true, ...error } : { hasError: false });
});

module.exports = router;
