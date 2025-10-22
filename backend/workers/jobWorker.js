const {Worker} = require("bullmq");
const fetch = require("node-fetch");
const {redisConnection} = require("../config/redis.js");
const Job = require("../model/job-information");
const User = require("../model/User");

const jobWorker = new Worker(
  "jobQueue",
  async (job) => {
    console.log(`🧑‍💻 [Worker] Processing job: ${job.id} for user ${job.data.userId}`);

    const { prompt, userId, sessionId } = job.data;
    const n8nWebhook =
      "http://localhost:5678/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";

    // 🔹 Step 1: Call N8N webhook
    const n8nResponse = await fetch(n8nWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, sessionId, userId }),
    });

    let parsed;
    try {
      parsed = await n8nResponse.json();
    } catch (error) {
      console.error("❌ [Worker] Invalid JSON from N8N:", error.message);
      throw new Error("Invalid response from N8N");
    }

    if (!parsed.datasetUrl) {
      console.warn("⚠️ [Worker] Missing datasetUrl in N8N response");
      return;
    }

    // 🔹 Step 2: Fetch dataset from Apify
    const datasetUrl = parsed.datasetUrl;
    const datasetResponse = await fetch(
      `${datasetUrl}?token=${process.env.APIFY_TOKEN}`
    );
    const datasetData = await datasetResponse.json();
    const jobCount = Array.isArray(datasetData) ? datasetData.length : 0;

    // 🔹 Step 3: Deduct user tokens
    const user = await User.findOne({ userId });
    if (!user) throw new Error("User not found");
    if (user.plan.remainingJobs < jobCount)
      throw new Error("Insufficient tokens");

    user.plan.remainingJobs -= jobCount;
    await user.save();

    // 🔹 Step 4: Save jobs in DB
    const jobsToSave = datasetData.map((j) => ({
      ...j,
      userId,
      sessionId,
    }));

    await JobModel.insertMany(jobsToSave);
    console.log(`💾 [Worker] Saved ${jobsToSave.length} jobs to DB`);

    return { count: jobCount, datasetUrl };
  },
  {
    connection: redisConnection,
    concurrency: 3, // number of parallel jobs handled by each worker
  }
);

module.exports = jobWorker;