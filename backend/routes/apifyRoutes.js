// routes/apifyRoutes.js
const express = require("express");
const router = express.Router();
const { handleApifyWebhook } = require("../controllers/apifyController");

// POST /api/apify/webhook
router.post("/webhook", handleApifyWebhook);

module.exports = router;
