// workers/jobWorker.js
require("dotenv").config();
const { Worker } = require("bullmq");
const fetch = require("node-fetch");
const redisConnection = require("../config/redis");
const { logToFile, logErrorToFile } = require("../logger");

const BACKEND_URL = process.env.BACKEND_URL || "https://techm.work.gd/api/";
const N8N_WEBHOOK_URL ="https://n8n.techm.work.gd/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";

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

    // ✅ Step 2: Extract jobCount, datasetId, sessionId
    let jobCount = 0;
    let datasetId = "unknown";
    let sessionIdFromN8n = sessionId;

    try {
      if (Array.isArray(parsed)) {
        const jobInfo = parsed.find(
          (item) => item.json && typeof item.json.jobCount !== "undefined"
        );
        jobCount = Number(jobInfo?.json?.jobCount || 0);
        datasetId = jobInfo?.json?.datasetId || "unknown";
        sessionIdFromN8n = jobInfo?.json?.sessionId || sessionId;
      } else if (parsed?.jobCount) {
        jobCount = Number(parsed.jobCount);
        datasetId = parsed.datasetId || "unknown";
        sessionIdFromN8n = parsed.sessionId || sessionId;
      }

      console.log("====================================================");
      console.log("🧠 [DEBUG] Parsed N8N Response:");
      console.log(JSON.stringify(parsed, null, 2));
      console.log("----------------------------------------------------");
      console.log(`👉 jobCount: ${jobCount}`);
      console.log(`👉 datasetId: ${datasetId}`);
      console.log(`👉 sessionId: ${sessionIdFromN8n}`);
      console.log("====================================================");
    } catch (e) {
      console.error("⚠️ [Worker] Error parsing N8N response:", e.message);
      logErrorToFile(`[Worker] Failed to parse N8N response: ${e.message}`);
    }

    // ✅ Step 3: Validate jobCount before deduction
    if (!jobCount || jobCount <= 0) {
      const msg = `⚠️ [Worker] jobCount=0 → No jobs returned from N8N for user ${userId}.`;
      console.warn(msg);
      logErrorToFile(msg);
      return {
        success: false,
        message: "No jobs to deduct credits for.",
        jobCount,
        datasetId,
      };
    }

    // ✅ Step 4: Deduct credits via backend API (credit logic handled only in backend)
    try {
      console.log(`💳 [Worker] Deducting ${jobCount} credits for user ${userId}`);
      console.log(`🔗 Calling: ${BACKEND_URL}/api/credits/deduct`);

      const creditResponse = await fetch(`${BACKEND_URL}/api/credits/deduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobCount, sessionId: sessionIdFromN8n }),
      });

      const creditData = await creditResponse.json();

      console.log("----------------------------------------------------");
      console.log("💳 [CREDITS] Backend Response:", creditData);
      console.log("----------------------------------------------------");

      if (!creditResponse.ok || !creditData.success) {
        throw new Error(
          `Credit API failed (${creditResponse.status}): ${creditData.message}`
        );
      }

      logToFile(
        `[Worker] Credits deducted for user ${userId}: ${jobCount} used, remaining ${creditData.remaining}`
      );
      console.log(`✅ [Worker] Credits updated successfully for user ${userId}`);

      if (creditData.lowBalance) {
        console.warn(
          `⚠️ [LOW BALANCE] User ${userId} has low balance (${creditData.remaining})`
        );
      }

      return {
        success: true,
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

// ✅ Worker Event Logs
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
