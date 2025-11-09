// routes/apifyRoutes.js
const express = require("express");
const router = express.Router();
const { handleApifyWebhook } = require("../controllers/apifyController");

// POST /api/apify/webhook
router.post("/webhook", handleApifyWebhook);

router.get("/test", (req, res) => {
  res.json({ message: "✅ Apify route is working fine!" });
});


module.exports = router;
