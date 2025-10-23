const { Worker } = require("bullmq");
const fetch = require("node-fetch");
const { redisConnection } = require("../config/redis.js");
const Job = require("../model/job-information");
const User = require("../model/User");

const jobWorker = new Worker(
  "jobQueue",
  async (job) => {
    const { prompt, userId, sessionId } = job.data;
    console.log(`🧑‍💻 [Worker] Processing job: ${job.id} for user ${userId}`);

    const n8nWebhook = "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";
    let parsed = null;

    // 🔹 Step 1: Try calling N8N webhook
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
      console.error(`⚠️ [Worker] N8N not reachable or returned error: ${err.message}`);
      parsed = {}; // fallback to Apify path
    }

    // 🔹 Step 2: Validate dataset URL or build fallback
    let datasetUrl = parsed.datasetUrl;
    if (!datasetUrl) {
      console.warn(`[Worker] N8N missing datasetUrl for job ${job.id}, falling back to APIFY_WEBHOOK_KEY`);
      const base = process.env.APIFY_WEBHOOK_KEY;
      if (!base) throw new Error("Missing APIFY_WEBHOOK_KEY in env");
      datasetUrl = `${base}token=${process.env.APIFY_TOKEN}&userId=${userId}&sessionId=${sessionId}`;
    }

    // 🔹 Step 3: Fetch dataset from Apify
    let datasetData;
    try {
      const datasetResponse = await fetch(datasetUrl);
      if (!datasetResponse.ok) {
        throw new Error(`Apify responded with status ${datasetResponse.status}`);
      }
      datasetData = await datasetResponse.json();
    } catch (err) {
      console.error(`❌ [Worker] Failed to fetch dataset for job ${job.id}:`, err.message);
      throw err;
    }

    const jobCount = Array.isArray(datasetData) ? datasetData.length : 0;
    console.log(`📦 [Worker] Retrieved ${jobCount} jobs from dataset`);

    // 🔹 Step 4: Deduct user tokens
    const user = await User.findOne({ userId });
    if (!user) throw new Error("User not found");
    if (user.plan.remainingJobs < jobCount) throw new Error("Insufficient tokens");

    user.plan.remainingJobs -= jobCount;
    await user.save();
    console.log(`💰 [Worker] Deducted ${jobCount} tokens from user ${userId}. Remaining: ${user.plan.remainingJobs}`);

    // 🔹 Step 5: Save jobs in DB
    const jobsToSave = datasetData.map((j) => ({ ...j, userId, sessionId }));
    if (jobsToSave.length > 0) {
      await Job.insertMany(jobsToSave);
      console.log(`💾 [Worker] Saved ${jobsToSave.length} jobs to DB`);
    } else {
      console.warn(`[Worker] No jobs to save for user ${userId}`);
    }

    return { count: jobCount, datasetUrl };
  },
  {
    connection: redisConnection,
    concurrency: 2, // safer for local dev
  }
);

jobWorker.on("completed", (job) => console.log(`🎉 Job ${job.id} completed successfully`));
jobWorker.on("failed", (job, err) => console.error(`❌ Job ${job?.id} failed:`, err.message));

console.log("🚀 BullMQ Worker started, waiting for jobs...");
module.exports = jobWorker;
