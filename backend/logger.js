// logger.js
const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Normal + Error log files
const logFile = path.join(logsDir, "logs.txt");
const errorFile = path.join(logsDir, "errorLogs.txt");

// NEW: queue log file
const queueLogFile = path.join(logsDir, "queueLogs.txt");

// Generic file writer
function writeLog(file, message) {
  const time = new Date().toISOString();
  fs.appendFile(file, `[${time}] ${message}\n`, (err) => {
    if (err) console.error("Log write failed:", err);
  });
}

// Writers
function logToFile(msg) {
  writeLog(logFile, msg);
}

function logErrorToFile(msg) {
  writeLog(errorFile, msg);
}

function logQueueToFile(msg) {
  writeLog(queueLogFile, msg);
}

module.exports = {
  logToFile,
  logErrorToFile,
  logQueueToFile,
  logFile,
  errorFile,
  queueLogFile,
};
