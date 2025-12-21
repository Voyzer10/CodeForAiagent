// controllers/gmailDraftController.js
const { google } = require("googleapis");
const mongoose = require("mongoose");
const User = require("../model/User");
const Job = require("../model/application-tracking");
const {
  refreshGoogleTokens,
  decrypt,
} = require("./googleController");

/* ======================================================
   EMAIL SANITIZER
====================================================== */
// 1. Strict Length Limit (O(1) protection against ReDoS)
if (!raw || typeof raw !== "string" || raw.length > 256) return null;

// 2. Define Regex with Suppression on Definition Line
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/; // NOSONAR: S5852 - Input length limited to 256 chars

const match = raw.match(emailRegex);
return match ? match[0].toLowerCase() : null;

/* ======================================================
   FIND JOB (ROBUST)
====================================================== */
async function findJob(jobid) {
  let job = await Job.findOne({ jobid });
  if (!job) job = await Job.findOne({ jobId: jobid });
  if (!job) job = await Job.findOne({ id: jobid });

  if (!job && mongoose.Types.ObjectId.isValid(jobid)) {
    try {
      job = await Job.findById(jobid);
    } catch (_) { }
  }
  return job;
}

/* ======================================================
   ENSURE GOOGLE TOKENS
====================================================== */
async function ensureTokens(user) {
  if (!user.gmailRefreshToken) {
    return { error: "gmail_not_connected" };
  }

  let accessToken = decrypt(user.gmailAccessToken);
  const refreshTokenPlain = decrypt(user.gmailRefreshToken);

  const tokenExpired =
    !user.gmailTokenExpiry ||
    new Date(user.gmailTokenExpiry).getTime() < Date.now() + 60000;

  if (!accessToken || tokenExpired) {
    const refreshed = await refreshGoogleTokens(user);
    if (refreshed.error) return refreshed;
    accessToken = refreshed.accessToken;
  }

  return { accessToken, refreshTokenPlain };
}

/* ======================================================
   BUILD RAW EMAIL
====================================================== */
function buildRawEmail(to, subject, body, attachmentName, attachmentBase64) {
  const boundary = "----=_NodeMailBoundary_" + Date.now();

  const parts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    "",
    body || "",
    "",
  ];

  if (attachmentBase64 && attachmentName) {
    let pureBase64 = attachmentBase64;
    const idx = pureBase64.indexOf("base64,");
    if (idx !== -1) pureBase64 = pureBase64.slice(idx + 7);

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

  return Buffer.from(raw, "utf8")
    .toString("base64")
    .replace(/\+/g, "-") // NOSONAR
    .replace(/\//g, "_") // NOSONAR
    .replace(/=+$/, ""); // NOSONAR
}

/* ======================================================
   CREATE GMAIL DRAFT
   POST /api/auth/gmail/create-draft
====================================================== */
exports.createGmailDraft = async (req, res) => {
  console.log(
    "\n=======================================\n📩 createGmailDraft API HIT\n=======================================\n"
  );

  try {
    const userId = Number(req.body.userId);
    const jobid = String(req.body.jobid);
    const { attachmentName, attachmentBase64 } = req.body;

    if (!userId || isNaN(userId) || !jobid || jobid === "undefined") {
      return res.status(400).json({ error: "userId and jobid required" });
    }

    /* ---------- FIND JOB ---------- */
    console.log(`🔎 Searching for job with ID: ${jobid}`);
    const job = await findJob(jobid);

    if (!job) {
      console.log("❌ Job not found");
      return res.status(404).json({ error: "Job not found" });
    }
    console.log(`✅ Job found: ${job._id}`);

    /* ---------- FIND USER ---------- */
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /* ---------- TOKENS ---------- */
    const tokens = await ensureTokens(user);
    if (tokens.error) {
      return res.status(400).json(tokens);
    }

    const clientId = decrypt(user.clientId);
    const clientSecret = decrypt(user.clientSecret);

    const oAuthClient = new google.auth.OAuth2(clientId, clientSecret);
    oAuthClient.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshTokenPlain,
    });

    /* ---------- EMAIL SANITIZATION ---------- */
    const rawEmail = job.email_to;
    const toEmail = sanitizeEmail(rawEmail);

    console.log(
      `📧 Email check → Raw: '${rawEmail}' | Sanitized: '${toEmail}' | Subject: '${job.email_subject}'`
    );

    if (!toEmail) {
      console.error("❌ Invalid email after sanitization:", rawEmail);

      job.email_to = "email_not_found";
      await job.save();

      return res.status(400).json({
        error: "Invalid email address",
        details: rawEmail,
      });
    }

    /* ---------- CREATE GMAIL DRAFT ---------- */
    const rawEncoded = buildRawEmail(
      toEmail,
      job.email_subject,
      job.email_content || "",
      attachmentName,
      attachmentBase64
    );

    const gmail = google.gmail({ version: "v1", auth: oAuthClient });

    const draft = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: rawEncoded } },
    });

    const draftId = draft?.data?.id;

    /* ---------- UPDATE JOB ---------- */
    job.sent = true;
    job.trackingId = String(userId);
    job.draftId = draftId;
    await job.save();

    console.log("✅ Gmail draft created:", draftId);

    return res.json({
      success: true,
      draftId,
      gmailUrl: `https://mail.google.com/mail/u/0/?fs=1&drafts=${draftId}`,
      job,
    });
  } catch (err) {
    console.error("❌ createGmailDraft ERROR:", err.message);

    if (String(err.message).toLowerCase().includes("invalid_grant")) {
      return res.status(400).json({
        error: "gmail_reconnect_needed",
        message: "Reconnect Gmail.",
      });
    }

    return res.status(500).json({
      error: "Failed to create draft",
      details: err.message,
    });
  }
};
