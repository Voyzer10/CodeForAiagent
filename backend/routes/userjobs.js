const express = require("express");
const { createJob, getUserJobs } = require("../controllers/jobController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/jobs → create jobs via n8n webhook + save with userId
router.post("/", createJob);

// GET /api/jobs/:userId → get all jobs for a user
router.get("/:userId", getUserJobs);

module.exports = router;
