// workers/jobWorker.js
const { Worker } = require("bullmq");
const fetch = require("node-fetch");
const redisConnection = require("../config/redis");
const User = require("../model/User");
const { logToFile, logErrorToFile } = require("../logger");

const jobWorker = new Worker(
  "jobQueue",
  async (job) => {
    const { prompt, userId, sessionId } = job.data;
    console.log(`🧑‍💻 [Worker] Processing job: ${job.id} for user ${userId}`);
    logToFile(`[Worker] Job ${job.id} started for user ${userId}`);

    // ✅ Step 1: Send job to N8N webhook
    const n8nWebhook =
      process.env.N8N_WEBHOOK_URL ||
      "https://n8n.techm.work.gd/webhook/c6ca6392-48e4-4e44-86b9-2f436894d108";

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
      console.log(`🧠 [Worker] N8N completed job ${job.id}:`, parsed);
      logToFile(`[Worker] N8N completed job ${job.id} successfully.`);
    } catch (err) {
      console.error(`❌ [Worker] Failed to call N8N for job ${job.id}:`, err.message);
      logErrorToFile(`[Worker] N8N failed for job ${job.id}: ${err.message}`);
      throw err;
    }

    // ✅ Step 2: Extract job count and dataset info
    const jobCount = parsed?.jobCount || 0;
    const datasetId = parsed?.datasetId || "unknown";

    // =====================================================
    // 🧠 DEBUG SECTION — ACTUAL JOB COUNT AND DEDUCTION INFO
    // =====================================================
    console.log("\n====================================================");
    console.log("🧠 [DEBUG] N8N Returned:");
    console.log(`👉 jobCount: ${jobCount}`);
    console.log(`👉 datasetId: ${datasetId}`);
    console.log("====================================================");

    // ✅ Step 3: Deduct credits safely (DEBUG MODE)
    const user = await User.findById(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    const beforeCredits = user.plan?.remainingJobs ?? 0;
    const afterCredits = Math.max(0, beforeCredits - jobCount);
    user.plan.remainingJobs = afterCredits;
    await user.save();

    // 🧾 Detailed debug info
    console.log("----------------------------------------------------");
    console.log(`💳 [CREDIT DEBUG] User ID: ${userId}`);
    console.log(`💳 [CREDIT DEBUG] Credits BEFORE: ${beforeCredits}`);
    console.log(`💳 [CREDIT DEBUG] Jobs Scraped (Deducted): ${jobCount}`);
    console.log(`💳 [CREDIT DEBUG] Credits AFTER: ${afterCredits}`);
    console.log("----------------------------------------------------");

    if (afterCredits < 100) {
      console.log(
        `⚠️  [LOW BALANCE WARNING] User ${userId} has only ${afterCredits} credits left.`
      );
      console.log(
        `👉  Minimum required balance is 100 credits. Ask user to upgrade plan.`
      );
    }

    console.log(`✅ [CREDIT DEBUG] Successfully deducted ${jobCount} credits.`);
    console.log(`🔁 Remaining balance for user ${userId}: ${afterCredits}`);
    console.log("====================================================\n");

    // ✅ Step 4: Return for dashboard/logging (optional)
    return { jobCount, datasetId, remainingCredits: afterCredits };
  },
  {
    connection: redisConnection,
    concurrency: 2, // safe for local dev
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
