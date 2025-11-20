// controllers/gmailDraftController.js
const { google } = require("googleapis");
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
exports.createGmailDraft = async (req, res) => {
  console.log("\n\n=======================================");
  console.log("📩  createGmailDraft API HIT");
  console.log("=======================================\n");

  try {
    const { userId, jobid, attachmentName, attachmentBase64 } = req.body;

    console.log("📥 Payload:", { userId, jobid, hasAttachment: !!attachmentBase64 });

    if (!userId || !jobid) {
      console.log("❌ Missing userId or jobid");
      return res.status(400).json({ error: "userId and jobid required" });
    }

    // STEP 1: Fetch job
    console.log("🔍 Finding job by jobid:", jobid);
    const job = await Job.findOne({ jobid });
    if (!job) {
      console.log("❌ Job not found:", jobid);
      return res.status(404).json({ error: "Job not found" });
    }
    console.log("✅ Job found:", { to: job.email_to, subject: job.email_subject });

    // STEP 2: Fetch user
    console.log("🔍 Finding user by userId:", userId);
    const user = await User.findOne({ userId });
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("✅ User found:", user.email);

    // STEP 3: Ensure tokens present
    if (!user.gmailRefreshToken) {
      console.log("❌ Gmail not connected for user:", userId);
      return res.status(400).json({ error: "gmail_not_connected" });
    }

    // Decrypt access token (may be null) and refresh token
    let accessToken = decrypt(user.gmailAccessToken);
    const refreshTokenPlain = decrypt(user.gmailRefreshToken);

    console.log("🔎 Access token present?:", !!accessToken);

    // STEP 4: Refresh access token if expired or missing
    const tokenExpired =
      !user.gmailTokenExpiry || new Date(user.gmailTokenExpiry).getTime() < Date.now() + 60000;

    if (!accessToken || tokenExpired) {
      console.log("⚠ Access token missing/expired → refreshing...");
      const refreshed = await refreshGoogleTokens(user);

      if (refreshed.error === "invalid_refresh_token") {
        console.log("❌ Refresh token invalid - require reconnect");
        return res.status(400).json({
          error: "gmail_reconnect_needed",
          message: "Gmail refresh token invalid. Please reconnect Gmail.",
        });
      }

      if (refreshed.error) {
        console.log("❌ Token refresh failed:", refreshed);
        return res.status(500).json({
          error: "token_refresh_failed",
          details: refreshed.details || refreshed.error,
        });
      }

      accessToken = refreshed.accessToken;
    }

    // STEP 5: Create OAuth client with (refreshed) access token
    const clientId = decrypt(user.clientId);
    const clientSecret = decrypt(user.clientSecret);

    if (!clientId || !clientSecret) {
      console.log("❌ Missing clientId/clientSecret in user record");
      return res.status(400).json({ error: "client_credentials_missing" });
    }

    const oAuthClient = new google.auth.OAuth2(clientId, clientSecret);
    oAuthClient.setCredentials({ access_token: accessToken, refresh_token: refreshTokenPlain });

    // STEP 6: Build MIME message
    const to = job.email_to;
    const subject = job.email_subject;
    const body = job.email_content || "";

    console.log("📦 Building MIME for:", { to, subject, hasAttachment: !!attachmentBase64 });

    // Use boundary and include plain text body. If you need html, adjust content-type.
    const boundary = "----=_NodeMailBoundary_" + Date.now();
    const parts = [];

    parts.push(`To: ${to}`);
    parts.push(`Subject: ${subject}`);
    parts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    parts.push("");
    parts.push(`--${boundary}`);
    parts.push(`Content-Type: text/plain; charset="UTF-8"`);
    parts.push("");
    parts.push(body);
    parts.push("");

    if (attachmentBase64 && attachmentName) {
      // NOTE: we assume attachmentBase64 is raw base64 (no data:<type>;base64,)
      parts.push(`--${boundary}`);
      parts.push(
        `Content-Type: application/octet-stream; name="${attachmentName}"`
      );
      parts.push("Content-Transfer-Encoding: base64");
      parts.push(`Content-Disposition: attachment; filename="${attachmentName}"`);
      parts.push("");
      parts.push(attachmentBase64);
      parts.push("");
    }

    parts.push(`--${boundary}--`);
    const raw = parts.join("\r\n");

    // Convert to base64url
    const rawEncoded = Buffer.from(raw, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // STEP 7: Create draft
    console.log("📤 Creating draft via Gmail API...");
    const gmail = google.gmail({ version: "v1", auth: oAuthClient });

    const draft = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: rawEncoded } },
    });

    const draftId = draft?.data?.id;
    console.log("✅ Draft created:", draftId);

    const gmailLink = `https://mail.google.com/mail/u/0/?fs=1&drafts=${draftId}`;

    // Optionally mark job as 'sent' = true/flag or save tracking etc. (not changing here)

    return res.json({
      success: true,
      draftId,
      gmailUrl: gmailLink,
      job,
    });
  } catch (err) {
    console.error("❌ createGmailDraft ERROR:", err.response?.data || err.message || err);
    // If error looks like invalid_grant during API call, notify reconnect
    if (String(err.message || "").toLowerCase().includes("invalid_grant")) {
      return res.status(400).json({
        error: "gmail_reconnect_needed",
        message: "Gmail credentials invalid. Please reconnect Gmail.",
      });
    }
    return res.status(500).json({ error: "Failed to create draft", details: err.message || String(err) });
  }
};
