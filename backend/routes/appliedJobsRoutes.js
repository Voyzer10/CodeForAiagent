// routes/appliedJobsRoutes.js
const express = require("express");
const router = express.Router();
const {
    getAppliedJobs,
    markJobAsApplied,
    checkJobApplied,
} = require("../controllers/appliedJobsController");
const auth = require("../middleware/authMiddleware");

// Get all applied jobs for a user
router.get("/user/:userId", auth, getAppliedJobs);

// Mark a job as applied
router.post("/mark-applied", auth, markJobAsApplied);

// Check if a job has been applied to
router.get("/check/:jobid", auth, checkJobApplied);

module.exports = router;
