const express = require("express");
const { getLogs, getErrorLogs } = require("../controllers/logController");
const router = express.Router();

router.get("/logs", getLogs);
router.get("/error-logs", getErrorLogs);

module.exports = router;
