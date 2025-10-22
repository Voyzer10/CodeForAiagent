const express = require("express");
const {
  createJob,
  getUserJobs,
  getAllUserJobs,
 // updateJobCredits,
} = require("../controllers/jobController");
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");
const {
  getUserCategories,
  addUserCategory,
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
} = require("../controllers/userController");

const router = express.Router();

// ✅ Create a job
router.post("/", auth, createJob);

// ✅ Get logged-in user’s jobs
router.get("/", auth, getUserJobs);

// ✅ User categories
router.get("/categories/:userId", auth, getUserCategories);
router.post("/categories/:userId", auth, addUserCategory);

// ✅ Saved searches
router.get("/searches", auth, getSavedSearches); // for frontend call
router.get("/searches/:userId", auth, getSavedSearches);
router.post("/searches/save", auth, saveSearch);
router.delete("/searches/:name", auth, deleteSavedSearch);

// ✅ Get jobs for a specific user (keep last)
router.get("/:userId", auth, getUserJobs);

// ✅ Webhook
//router.post("/update-job-credits", updateJobCredits);

// ✅ Admin routes
router.get("/all", auth, adminAuth, getAllUserJobs);

module.exports = router;
