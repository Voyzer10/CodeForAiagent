// workers/jobWorker.js
const { Worker } = require("bullmq");
const fetch = require("node-fetch");
const redisConnection = require("../config/redis");
const { logToFile, logErrorToFile } = require("../logger");

const BACKEND_URL = process.env.BACKEND_URL || "https://techm.work.gd/api";
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "https://n8n.techm.work.gd/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";

const jobWorker = new Worker(
  "jobQueue",
  async (job) => {
    const { prompt, userId, sessionId } = job.data;
    console.log(`🧑‍💻 [Worker] Processing job: ${job.id} for user ${userId}`);
    logToFile(`[Worker] Job ${job.id} started for user ${userId}`);

    // ✅ Step 1: Trigger N8N Workflow
    let parsed = {};
    try {
      console.log(`🌐 [Worker] Calling N8N webhook: ${N8N_WEBHOOK_URL}`);

      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, sessionId, userId }),
      });

      if (!n8nResponse.ok) {
        throw new Error(`N8N responded with status ${n8nResponse.status}`);
      }

      parsed = await n8nResponse.json();
      console.log(`🧠 [Worker] N8N completed job ${job.id}`);
      logToFile(`[Worker] N8N completed job ${job.id} successfully.`);
    } catch (err) {
      console.error(`❌ [Worker] Failed to call N8N:`, err.message);
      logErrorToFile(`[Worker] N8N failed for job ${job.id}: ${err.message}`);
      throw err;
    }

    // ✅ Step 2: Extract job count and dataset info
    const jobCount = Number(parsed?.jobCount || 0);
    const datasetId = parsed?.datasetId || "unknown";

    console.log("====================================================");
    console.log("🧠 [DEBUG] N8N Returned:");
    console.log(`👉 jobCount: ${jobCount}`);
    console.log(`👉 datasetId: ${datasetId}`);
    console.log("====================================================");

    // ✅ Step 3: Deduct credits via backend API
    try {
      console.log(`💳 [Worker] Deducting ${jobCount} credits for user ${userId}`);

      const creditResponse = await fetch(`${BACKEND_URL}/credits/deduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.INTERNAL_API_KEY || "internal-key"}`,
        },
        body: JSON.stringify({ userId, jobCount, sessionId }),
      });

      const creditData = await creditResponse.json();

      if (!creditResponse.ok) {
        throw new Error(
          `Credit API failed (${creditResponse.status}): ${creditData.message}`
        );
      }

      console.log("----------------------------------------------------");
      console.log(`💳 [CREDITS] Deducted: ${creditData.deducted}`);
      console.log(`💳 [CREDITS] Remaining: ${creditData.remaining}`);
      console.log("----------------------------------------------------");

      if (creditData.lowBalance) {
        console.log(
          `⚠️  [LOW BALANCE] User ${userId} balance low (${creditData.remaining})`
        );
      }

      logToFile(
        `[Worker] Credits updated for ${userId} → Remaining: ${creditData.remaining}`
      );

      return {
        jobCount,
        datasetId,
        remainingCredits: creditData.remaining,
      };
    } catch (err) {
      console.error(`❌ [Worker] Credit deduction failed:`, err.message);
      logErrorToFile(
        `[Worker] Credit deduction failed for ${userId}: ${err.message}`
      );
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

// Worker Event Logs
jobWorker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed successfully`);
  logToFile(`[Worker] Job ${job.id} completed successfully.`);
});

jobWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
  logErrorToFile(`[Worker] Job ${job?.id} failed: ${err.message}`);
});

console.log("🚀 BullMQ Worker started (N8N mode), waiting for jobs...");

module.exports = jobWorker;
