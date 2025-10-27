// logger.js
const fs = require("fs");
const path = require("path");

// Detect if running on Vercel (read-only file system)
const IS_VERCEL = !!process.env.VERCEL;

let logsDir, logFile, errorFile;

if (!IS_VERCEL) {
  // ✅ Local/dev environment — allow file logging
  logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  logFile = path.join(logsDir, "logs.txt");
  errorFile = path.join(logsDir, "errorLogs.txt");
}

// Write to file (only locally)
function writeLog(file, message) {
  const time = new Date().toISOString();
  const line = `[${time}] ${message}\n`;
  if (!IS_VERCEL) {
    fs.appendFileSync(file, line);
  } else {
    // ✅ On Vercel, just console.log (shows up in dashboard)
    console.log(line);
  }
}

function logToFile(message) {
  writeLog(logFile, message);
}

function logErrorToFile(message) {
  writeLog(errorFile, message);
}

module.exports = { logToFile, logErrorToFile };
