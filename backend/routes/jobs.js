const express = require("express");
const router = express.Router();
const Job = require("../model/job");

// GET all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// GET a single job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// GET jobs by trackingId
router.get("/tracking/:trackingId", async (req, res) => {
  try {
    const jobs = await Job.find({ trackingId: req.params.trackingId });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs by trackingId" });
  }
});

module.exports = router;
