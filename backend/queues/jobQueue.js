const { Queue } = require("bullmq");
const {redisConnection} = require("../config/redis.js");


 const jobQueue = new Queue("jobQueue", {
  connection: redisConnection,
});

console.log("🚀 BullMQ Queue Initialized: jobQueue");


module.exports = jobQueue;