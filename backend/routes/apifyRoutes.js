// routes/apifyRoutes.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../model/User");

router.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Apify Webhook Received:", req.body);

    const { meta, resource } = req.body;

    if (!meta?.UserID || !resource) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const userId = meta.UserID; // Apify payload includes this
    const datasetId = resource; // e.g. "datasets/abcd123"

    // 🔹 Fetch dataset items from Apify API
    const apifyResponse = await axios.get(
      `https://api.apify.com/v2/${datasetId}/items`,
      {
        params: { token: process.env.APIFY_API_TOKEN },
      }
    );

    const items = apifyResponse.data;
    const count = Array.isArray(items) ? items.length : 0;

    console.log(`📊 Dataset item count: ${count}`);

    // 🔹 Subtract count from user's credits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.credits = Math.max(0, user.credits - count);
    await user.save();

    console.log(`✅ User ${user.email} credits updated: ${user.credits}`);

    return res.status(200).json({
      message: "Webhook processed successfully",
      deducted: count,
      remainingCredits: user.credits,
    });
  } catch (err) {
    console.error("❌ Error in Apify webhook route:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
