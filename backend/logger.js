// logger.js
const fs = require("fs");
const path = require("path");

// ========== LOG DIRECTORY ==========
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ========== LOG FILES ==========
const logFile = path.join(logsDir, "logs.txt");
const errorFile = path.join(logsDir, "errorLogs.txt");
const queueLogFile = path.join(logsDir, "queueLogs.txt");

// ========== PRETTY DATE FORMAT ==========
function timestamp() {
  const d = new Date();
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ========== FILE APPEND ==========
function write(file, msg) {
  const line = `[${timestamp()}] ${msg}\n`;
  fs.appendFile(file, line, () => { });
}

// ========== CUSTOM LOG FUNCTIONS ==========
function logToFile(msg) {
  write(logFile, msg);
}

function logErrorToFile(msg) {
  write(errorFile, msg);
}

function logQueueToFile(msg) {
  write(queueLogFile, msg);
}

// ========== OVERRIDE console.log + console.error ==========
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  const msg = args.join(" ");
  write(logFile, msg);
  originalLog.apply(console, args);
};

console.error = (...args) => {
  const msg = args.join(" ");
  write(errorFile, msg);
  originalError.apply(console, args);
};

module.exports = {
  logToFile,
  logErrorToFile,
  logQueueToFile,
  logFile,
  errorFile,
  queueLogFile,
};
