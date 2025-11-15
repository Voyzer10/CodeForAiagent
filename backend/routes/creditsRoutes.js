// routes/creditsRoutes.js
const express = require("express");
const router = express.Router();
const { deductCredits, getCredits } = require("../controllers/creditsController");
const { logToFile, logErrorToFile } = require("../logger");
console.log("✅ creditsRoutes.js successfully loaded");

/**
 * Completely open endpoint — no auth required
 * POST /api/credits/deduct
 * Body: { userId, jobCount, sessionId }
 */
// router.get("/test", (req, res) => {
//   res.send("✅ Credits API route working");
// });
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

router.get("/check", async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const result = await getCredits(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("🔥 Credits Check Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
