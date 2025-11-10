// routes/creditsRoutes.js
const express = require("express");
const router = express.Router();
const { deductCredits } = require("../controllers/creditsController");

/**
 * POST /api/credits/deduct
 * Body: { userId, jobCount, sessionId }
 */
router.post("/deduct", async (req, res) => {
  const { userId, jobCount, sessionId } = req.body;
  if (!userId || !jobCount)
    return res.status(400).json({ message: "userId and jobCount required" });

  const result = await deductCredits(userId, jobCount, sessionId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

module.exports = router;
