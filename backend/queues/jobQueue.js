// jobQueue.js
const { Queue } = require("bullmq");
const { redisConnection } = require("../config/redis.js");

const jobQueue = new Queue("jobQueue", {
  connection: redisConnection,
});

(async () => {
  console.log("Waiting:", await jobQueue.getWaitingCount());
  console.log("Active:", await jobQueue.getActiveCount());
  console.log("Failed:", await jobQueue.getFailedCount());
  console.log("Completed:", await jobQueue.getCompletedCount());
})();;

module.exports = { jobQueue }; // ✅ Export as an object