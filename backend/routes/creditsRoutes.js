// routes/creditsRoutes.js
const express = require("express");
const router = express.Router();
const { deductCredits } = require("../controllers/creditsController");
const { logToFile, logErrorToFile } = require("../logger");

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || "internal-key";

/**
 * POST /api/credits/deduct
 * Body: { userId, jobCount, sessionId }
 */
router.post("/deduct", async (req, res) => {
  try {
    // Authorization (for internal backend use)
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (token !== INTERNAL_KEY) {
      logErrorToFile(`[CreditsRoutes] Unauthorized attempt detected`);
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const { userId, jobCount, sessionId } = req.body;
    if (!userId || jobCount == null) {
      return res
        .status(400)
        .json({ message: "userId and jobCount are required" });
    }

    const result = await deductCredits(userId, jobCount, sessionId);

    if (result.success) {
      logToFile(
        `[CreditsRoutes] Credit deduction successful for ${userId}, remaining=${result.remaining}`
      );
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    logErrorToFile(`[CreditsRoutes] Unexpected error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
