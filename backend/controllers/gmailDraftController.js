const { google } = require("googleapis");
const crypto = require("crypto");
const User = require("../model/User");
const Job = require("../model/application-tracking");

// --------------------------------------------
// Decrypt Helper
// --------------------------------------------
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const decrypt = (payload) => {
  if (!payload) return null;
  try {
    const [ivHex, tagHex, encryptedText] = payload.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );

    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("❌ Decryption Failed:", error.message);
    return null;
  }
};



// ======================================================
// CREATE GMAIL DRAFT WITH FULL DEBUGGING
// ======================================================
exports.createGmailDraft = async (req, res) => {
  console.log("\n\n=======================================");
  console.log("📩  createGmailDraft API HIT");
  console.log("=======================================\n");

  try {
    const { userId, jobid, attachmentName, attachmentBase64 } = req.body;

    console.log("📥 Incoming Payload:");
    console.log({
      userId,
      jobid,
      attachmentName,
      hasAttachment: !!attachmentBase64
    });

    if (!userId || !jobid) {
      console.log("❌ Missing parameters (userId or jobid)");
      return res.status(400).json({ error: "userId and jobid required" });
    }

    // ---------------------------------------------------
    // STEP 1: Fetch Applied Job
    // ---------------------------------------------------
    console.log("\n🔍 Fetching job from DB using jobid:", jobid);

    const job = await Job.findOne({ jobid });

    if (!job) {
      console.log("❌ Job Not Found:", jobid);
      return res.status(404).json({ error: "Job not found" });
    }

    console.log("✅ Job Found:");
    console.log({
      to: job.email_to,
      subject: job.email_subject
    });


    // ---------------------------------------------------
    // STEP 2: Fetch User Gmail Tokens
    // ---------------------------------------------------
    console.log("\n🔍 Fetching user by userId:", userId);

    const user = await User.findOne({ userId });

    if (!user) {
      console.log("❌ User Not Found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User Found:", user.email);


    // ---------------------------------------------------
    // STEP 3: Decrypt Gmail Tokens
    // ---------------------------------------------------
    console.log("\n🔐 Decrypting Gmail credentials...");

    const clientId = decrypt(user.clientId);
    const clientSecret = decrypt(user.clientSecret);
    let accessToken = decrypt(user.gmailAccessToken);
    const refreshToken = decrypt(user.gmailRefreshToken);

    console.log("🔎 Token Status:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    if (!clientId || !clientSecret || !refreshToken) {
      console.log("❌ Missing Gmail credentials in user record");
      return res.status(400).json({ error: "Gmail not connected" });
    }


    // ---------------------------------------------------
    // STEP 4: Create OAuth Client + Refresh Token
    // ---------------------------------------------------
    console.log("\n🔧 Preparing OAuth2 Client...");

    const oAuthClient = new google.auth.OAuth2(clientId, clientSecret);
    oAuthClient.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const now = Date.now();
    const exp = user.gmailTokenExpiry?.getTime() || 0;

    console.log("⏳ Token Expiry Check:", {
      expiresAt: user.gmailTokenExpiry,
      expired: now > exp - 60000
    });

    if (!exp || now > exp - 60000) {
      console.log("🔁 Access Token expired → Refreshing...");

      const refreshed = await oAuthClient.refreshToken(refreshToken);

      accessToken = refreshed.credentials.access_token;

      user.gmailAccessToken = encrypt(accessToken);
      user.gmailTokenExpiry = new Date(refreshed.credentials.expiry_date);

      await user.save();

      console.log("✅ Token Refreshed & Saved");
    }



    // ---------------------------------------------------
    // STEP 5: Build MIME Email
    // ---------------------------------------------------
    console.log("\n📦 Building MIME Email...");

    const to = job.email_to;
    const subject = job.email_subject;
    const body = job.email_content;

    console.log("📧 Email Details:", { to, subject });

    let mimeParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: multipart/mixed; boundary="boundary123"`,
      "",
      "--boundary123",
      `Content-Type: text/plain; charset="UTF-8"`,
      "",
      body,
      ""
    ];

    if (attachmentBase64 && attachmentName) {
      console.log("📎 Adding attachment:", attachmentName);
      mimeParts.push(
        "--boundary123",
        `Content-Type: application/pdf; name="${attachmentName}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${attachmentName}"`,
        "",
        attachmentBase64,
        ""
      );
    }

    mimeParts.push("--boundary123--");

    const rawMessage = Buffer.from(mimeParts.join("\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("📦 MIME Built Successfully!");

    // ---------------------------------------------------
    // STEP 6: Create Draft in Gmail
    // ---------------------------------------------------
    console.log("\n📤 Creating Gmail Draft...");

    const gmail = google.gmail({ version: "v1", auth: oAuthClient });

    const draft = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: rawMessage } }
    });

    const draftId = draft.data.id;
    console.log("✅ Draft Created Successfully:", draftId);

    const gmailLink = `https://mail.google.com/mail/u/0/?fs=1&drafts=${draftId}`;

    console.log("\n📨 Gmail Draft URL:", gmailLink);


    // ---------------------------------------------------
    // FINAL RESPONSE
    // ---------------------------------------------------
    return res.json({
      success: true,
      draftId,
      gmailUrl: gmailLink,
      job
    });


  } catch (err) {
    console.error("\n❌ GLOBAL ERROR CAUGHT:");
    console.error(err);

    return res.status(500).json({ error: "Failed to create draft", details: err.message });
  }
};
