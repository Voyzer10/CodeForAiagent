// controllers/creditsController.js
const User = require("../model/User");
const { logToFile, logErrorToFile } = require("../logger");

/**
 * Deduct credits from user based on jobs scraped.
 * Called by JobWorker or API route.
 */
exports.deductCredits = async (userId, jobCount, sessionId = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    const beforeCredits = user.plan?.remainingJobs ?? 0;

    // Check if user has enough credits
    if (beforeCredits < jobCount) {
      logErrorToFile(
        `[CreditsController] User ${userId} has insufficient credits (${beforeCredits}) for ${jobCount} jobs`
      );
      return {
        success: false,
        message: "Not enough credits to process this job batch.",
        remaining: beforeCredits,
        minRequired: 100,
      };
    }

    // Deduct
    const afterCredits = Math.max(0, beforeCredits - jobCount);
    user.plan.remainingJobs = afterCredits;

    // Optional: add session log
    if (!user.plan.history) user.plan.history = [];
    user.plan.history.push({
      sessionId,
      deducted: jobCount,
      timestamp: new Date(),
    });

    // Optional: mark low balance if < 100
    user.plan.lowBalance = afterCredits < 100;

    await user.save();

    logToFile(
      `[CreditsController] Deducted ${jobCount} credits from ${userId}. Remaining=${afterCredits}`
    );

    return {
      success: true,
      deducted: jobCount,
      remaining: afterCredits,
      lowBalance: afterCredits < 100,
      message:
        afterCredits < 100
          ? "Balance low. Please upgrade your plan."
          : "Credits updated successfully.",
    };
  } catch (err) {
    logErrorToFile(`[CreditsController] Error: ${err.message}`);
    return { success: false, message: err.message };
  }
};
