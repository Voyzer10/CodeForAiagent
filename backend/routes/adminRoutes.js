const express = require("express");
const { registerAdmin, loginAdmin, getAdmins } = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected routes (only admin role)
router.get("/all", auth, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  next();
}, getAdmins);

module.exports = router;
