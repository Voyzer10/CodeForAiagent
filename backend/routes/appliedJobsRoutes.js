// routes/appliedJobsRoutes.js
const express = require("express");
const router = express.Router();
const {
    getAppliedJobs,
    markJobAsApplied,
    checkJobApplied,
} = require("../controllers/appliedJobsController");
const { protect } = require("../middleware/authMiddleware");

// Get all applied jobs for a user
router.get("/user/:userId", protect, getAppliedJobs);

// Mark a job as applied
router.post("/mark-applied", protect, markJobAsApplied);

// Check if a job has been applied to
router.get("/check/:jobid", protect, checkJobApplied);

module.exports = router;
