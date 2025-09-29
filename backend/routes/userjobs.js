const express = require("express");
const { createJob, getUserJobs } = require("../controllers/jobController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Apply auth middleware
router.post("/", auth, createJob);
router.get("/", auth, getUserJobs); // no userId param, use req.userId in controller

module.exports = router;
