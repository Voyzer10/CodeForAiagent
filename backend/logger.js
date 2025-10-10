// logger.js
const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const logFile = path.join(logsDir, "logs.txt");
const errorFile = path.join(logsDir, "errorLogs.txt");

function writeLog(file, message) {
  const time = new Date().toISOString();
  const line = `[${time}] ${message}\n`;
  fs.appendFileSync(file, line);
}

function logToFile(message) {
  writeLog(logFile, message);
}

function logErrorToFile(message) {
  writeLog(errorFile, message);
}

module.exports = { logToFile, logErrorToFile, logFile, errorFile };
