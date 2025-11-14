const fs = require("fs");
const { logFile, errorFile } = require("../logger");

exports.getLogs = (req, res) => {
  try {
    const logs = fs.existsSync(logFile)
      ? fs.readFileSync(logFile, "utf-8")
      : "";
    res.status(200).json({ success: true, type: "info", logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not read logs" });
  }
};

exports.getErrorLogs = (req, res) => {
  try {
    const logs = fs.existsSync(errorFile)
      ? fs.readFileSync(errorFile, "utf-8")
      : "";
    res.status(200).json({ success: true, type: "error", logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not read error logs" });
  }
};
