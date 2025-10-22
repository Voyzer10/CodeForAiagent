const { Worker } = require("bullmq");
const fetch = require("node-fetch");
const redisConnection = require("../config/redis.js");
const Job = require("../model/job-information");
const User = require("../model/User");

const jobWorker = new Worker(
  "jobQueue",
  async (job) => {
    console.log(`🧑‍💻 [Worker] Processing job: ${job.id} for user ${job.data.userId}`);

    const { prompt, userId, sessionId } = job.data;
    const n8nWebhook = "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";

    // 🔹 Step 1: Call N8N webhook with full error handling
    let parsed;
    try {
      const n8nResponse = await fetch(n8nWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, sessionId, userId }),
      });

      if (!n8nResponse.ok) {
        throw new Error(`N8N responded with status ${n8nResponse.status}`);
      }

      parsed = await n8nResponse.json();
    } catch (err) {
      console.error(`❌ [Worker] Failed to call N8N for job ${job.id}:`, err.message);
      throw err; // <-- this ensures BullMQ marks the job as failed
    }

    // 🔹 Step 2: Validate dataset URL
    if (!parsed.datasetUrl) {
      const msg = `[Worker] Missing datasetUrl in N8N response for job ${job.id}`;
      console.error(msg);
      throw new Error(msg); // fail job if dataset URL is missing
    }

    const datasetUrl = parsed.datasetUrl;

    // 🔹 Step 3: Fetch dataset from Apify
    let datasetData;
    try {
      const datasetResponse = await fetch(`${datasetUrl}?token=${process.env.APIFY_TOKEN}`);
      if (!datasetResponse.ok) {
        throw new Error(`Apify responded with status ${datasetResponse.status}`);
      }
      datasetData = await datasetResponse.json();
    } catch (err) {
      console.error(`❌ [Worker] Failed to fetch dataset for job ${job.id}:`, err.message);
      throw err;
    }

    const jobCount = Array.isArray(datasetData) ? datasetData.length : 0;

    // 🔹 Step 4: Deduct user tokens
    const user = await User.findOne({ userId });
    if (!user) throw new Error("User not found");
    if (user.plan.remainingJobs < jobCount) throw new Error("Insufficient tokens");

    user.plan.remainingJobs -= jobCount;
    await user.save();

    // 🔹 Step 5: Save jobs in DB
    const jobsToSave = datasetData.map(j => ({ ...j, userId, sessionId }));
    await Job.insertMany(jobsToSave);

    console.log(`💾 [Worker] Saved ${jobsToSave.length} jobs to DB`);
    return { count: jobCount, datasetUrl };
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

jobWorker.on("completed", job => console.log(`🎉 Job ${job.id} completed successfully`));
jobWorker.on("failed", (job, err) => console.error(`❌ Job ${job.id} failed:`, err.message));

console.log("🚀 BullMQ Worker started, waiting for jobs...");

module.exports = jobWorker;
