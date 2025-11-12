// routes/creditsRoutes.js
const express = require("express");
const router = express.Router();
const { deductCredits } = require("../controllers/creditsController");
const { logToFile, logErrorToFile } = require("../logger");
console.log("✅ creditsRoutes.js successfully loaded");

/**
 * Completely open endpoint — no auth required
 * POST /api/credits/deduct
 * Body: { userId, jobCount, sessionId }
 */
router.get("/test", (req, res) => {
  res.send("✅ Credits API route working");
});
router.post("/deduct", async (req, res) => {
  try {
    const { userId, jobCount, sessionId } = req.body;

    if (!userId || jobCount == null) {
      return res
        .status(400)
        .json({ message: "userId and jobCount are required" });
    }

    logToFile(
      `[CreditsRoutes:DEBUG] Deduct request for userId=${userId}, jobCount=${jobCount}, sessionId=${sessionId}`
    );

    const result = await deductCredits(userId, jobCount, sessionId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    console.error("🔥 Error in credits route:", err.message);
    logErrorToFile(`[CreditsRoutes:ERROR] ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
