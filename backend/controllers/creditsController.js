// controllers/creditsController.js
const User = require("../model/User");
const { logToFile, logErrorToFile } = require("../logger");

exports.deductCredits = async (userId, jobCount, sessionId = null) => {
  try {
    const user = await User.findOne({ userId }); // ✅ find by your numeric userId
    if (!user) throw new Error(`User not found: ${userId}`);

    if (!user.plan) user.plan = {};
    if (!user.plan.remainingJobs) user.plan.remainingJobs = 0;
    if (!user.plan.history) user.plan.history = [];

    const beforeCredits = user.plan.remainingJobs;
    const numericJobCount = Number(jobCount) || 0;

    // Prevent duplicate deductions for same session
    const alreadyDeducted = user.plan.history.some(
      (h) => h.sessionId === sessionId
    );
    if (alreadyDeducted) {
      logToFile(`[CreditsController] Session ${sessionId} already processed.`);
      return {
        success: true,
        message: "Session already processed",
        deducted: 0,
        remaining: beforeCredits,
      };
    }

    // Ensure valid job count
    if (numericJobCount <= 0) {
      return { success: false, message: "Invalid job count provided." };
    }

    // Check credits
    if (beforeCredits < numericJobCount) {
      logErrorToFile(
        `[CreditsController] User ${userId} insufficient credits: ${beforeCredits}`
      );
      return {
        success: false,
        message: "Not enough credits to process this job batch.",
        remaining: beforeCredits,
        minRequired: 100,
      };
    }

    // Deduct and update
    const afterCredits = Math.max(0, beforeCredits - numericJobCount);
    user.plan.remainingJobs = afterCredits;
    user.plan.lowBalance = afterCredits < 100;
    user.plan.history.push({
      sessionId,
      deducted: numericJobCount,
      timestamp: new Date(),
    });

    await user.save();

    logToFile(
      `[CreditsController] Deducted ${numericJobCount} credits from ${userId}. Remaining=${afterCredits}`
    );

    return {
      success: true,
      deducted: numericJobCount,
      remaining: afterCredits,
      lowBalance: user.plan.lowBalance,
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

// --- ADD THIS BELOW exports.deductCredits ---

exports.getCredits = async (userId) => {
  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return { success: false, message: "User not found", credits: 0 };
    }

    const remaining = user?.plan?.remainingJobs || 0;

    return {
      success: true,
      credits: remaining,
      lowBalance: remaining < 100,
    };
  } catch (err) {
    logErrorToFile(`[CreditsController:getCredits] ${err.message}`);
    return { success: false, message: err.message, credits: 0 };
  }
};
