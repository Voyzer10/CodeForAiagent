const express = require("express");
const { createJob, getUserJobs, getAllUserJobs } = require("../controllers/jobController");
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

const router = express.Router();

// Authenticated user routes
router.post("/", auth, createJob);
router.get("/", auth, getUserJobs);

// Admin only route
router.get("/all", auth, adminAuth, getAllUserJobs);

module.exports = router;
