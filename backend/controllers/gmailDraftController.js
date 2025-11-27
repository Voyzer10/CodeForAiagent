// controllers/gmailDraftController.js
const { google } = require("googleapis");
const mongoose = require("mongoose");
const User = require("../model/User");
const Job = require("../model/application-tracking");
const {
  refreshGoogleTokens,
  decrypt,
  encrypt,
} = require("./googleController"); // shared helpers

const crypto = require("crypto");

/* ======================================================
   CREATE GMAIL DRAFT (MAIN FUNCTION)
   POST /api/gmail/create-draft
   Body: { userId, jobid, attachmentName?, attachmentBase64? }
====================================================== */
// Helper: Find Job
async function findJob(jobid) {
  let job = await Job.findOne({ jobid });
  if (!job) job = await Job.findOne({ jobId: jobid });
  if (!job) job = await Job.findOne({ id: jobid });

  if (!job && mongoose.Types.ObjectId.isValid(jobid)) {
    try {
      job = await Job.findById(jobid);
    } catch (e) {
      // ignore
    }
  }
  return job;
}

// Helper: Ensure Tokens
async function ensureTokens(user) {
  if (!user.gmailRefreshToken) {
    return { error: "gmail_not_connected" };
  }

  let accessToken = decrypt(user.gmailAccessToken);
  const refreshTokenPlain = decrypt(user.gmailRefreshToken);

  const tokenExpired =
    !user.gmailTokenExpiry || new Date(user.gmailTokenExpiry).getTime() < Date.now() + 60000;

  if (!accessToken || tokenExpired) {
    const refreshed = await refreshGoogleTokens(user);
    if (refreshed.error) return refreshed;
    accessToken = refreshed.accessToken;
  }

  return { accessToken, refreshTokenPlain };
}

// Helper: Build Raw Email
function buildRawEmail(to, subject, body, attachmentName, attachmentBase64) {
  const boundary = "----=_NodeMailBoundary_" + Date.now();
  const parts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    "",
    body,
    ""
  ];

  if (attachmentBase64 && attachmentName) {
    let pureBase64 = attachmentBase64;
    const prefixIndex = pureBase64.indexOf("base64,");
    if (prefixIndex !== -1) {
      pureBase64 = pureBase64.slice(prefixIndex + 7);
    }

    parts.push(
      `--${boundary}`,
      `Content-Type: application/octet-stream; name="${attachmentName}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${attachmentName}"`,
      "",
      pureBase64,
      ""
    );
  }

  parts.push(`--${boundary}--`);
  const raw = parts.join("\r\n");

  let rawEncoded = Buffer.from(raw, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (rawEncoded.endsWith("==")) {
    rawEncoded = rawEncoded.slice(0, -2);
  } else if (rawEncoded.endsWith("=")) {
    rawEncoded = rawEncoded.slice(0, -1);
  }

  return rawEncoded;
}

exports.createGmailDraft = async (req, res) => {
  console.log("\n\n=======================================\n📩  createGmailDraft API HIT\n=======================================\n");

  try {
    const userId = Number(req.body.userId);
    const jobid = String(req.body.jobid);
    const { attachmentName, attachmentBase64 } = req.body;

    if (!userId || isNaN(userId) || !jobid || jobid === "undefined" || jobid === "null") {
      return res.status(400).json({ error: "userId and jobid required" });
    }

    // 1. Find Job
    const job = await findJob(jobid);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // 2. Find User
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 3. Ensure Tokens
    const tokens = await ensureTokens(user);
    if (tokens.error) {
      if (tokens.error === "invalid_refresh_token") {
        return res.status(400).json({ error: "gmail_reconnect_needed", message: "Reconnect Gmail." });
      }
      return res.status(400).json(tokens);
    }

    // 4. OAuth Client
    const clientId = decrypt(user.clientId);
    const clientSecret = decrypt(user.clientSecret);
    if (!clientId || !clientSecret) return res.status(400).json({ error: "client_credentials_missing" });

    const oAuthClient = new google.auth.OAuth2(clientId, clientSecret);
    oAuthClient.setCredentials({ access_token: tokens.accessToken, refresh_token: tokens.refreshTokenPlain });

    // 5. Create Draft
    const rawEncoded = buildRawEmail(job.email_to, job.email_subject, job.email_content || "", attachmentName, attachmentBase64);
    const gmail = google.gmail({ version: "v1", auth: oAuthClient });

    const draft = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: rawEncoded } },
    });

    const draftId = draft?.data?.id;
    return res.json({
      success: true,
      draftId,
      gmailUrl: `https://mail.google.com/mail/u/0/?fs=1&drafts=${draftId}`,
      job,
    });

  } catch (err) {
    console.error("❌ createGmailDraft ERROR:", err.message);
    if (String(err.message || "").toLowerCase().includes("invalid_grant")) {
      return res.status(400).json({ error: "gmail_reconnect_needed", message: "Reconnect Gmail." });
    }
    return res.status(500).json({ error: "Failed to create draft", details: err.message });
  }
};
