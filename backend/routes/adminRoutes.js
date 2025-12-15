const express = require("express");
const { registerAdmin, loginAdmin, getAdmins } = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

const { getSystemHealth, getSystemResources } = require("../controllers/systemController");

// Protected routes (only admin role)
router.use(auth, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  next();
});

router.get("/all", getAdmins);
router.get("/health", getSystemHealth);
router.get("/resources", getSystemResources);

module.exports = router;
