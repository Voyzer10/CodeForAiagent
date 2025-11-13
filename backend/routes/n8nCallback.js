// routes/n8nCallback.js
const express = require("express");
const router = express.Router();
const { logToFile } = require("../logger");

router.post("/", async (req, res) => {
  console.log("✅ [n8nCallback] Raw body:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    console.log("⚠️ [n8nCallback] Empty body received");
    return res.status(400).json({ message: "Empty body" });
  }

  const data = req.body;
  logToFile(`[n8nCallback] Data received: ${JSON.stringify(data, null, 2)}`);

  console.log("✅ [n8nCallback] Parsed Data:", data);
  res.json({ success: true });
});

module.exports = router;

