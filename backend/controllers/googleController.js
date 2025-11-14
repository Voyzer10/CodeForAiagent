const { google } = require("googleapis");
const User = require("../model/User");
const crypto = require("crypto");

/* ===================================================
   ENCRYPTION HELPERS
=================================================== */
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "00000000000000000000000000000000"; // fallback (must be 32-byte hex)

const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${tag}:${encrypted}`;
};

const decrypt = (payload) => {
  if (!payload) return null;
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
};

/* ===================================================
   GOOGLE OAUTH CLIENT
=================================================== */
const oauthClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "email",
  "profile",
];

/* ===================================================
   STEP 1 — Redirect logged-in user → Google Consent
=================================================== */
exports.googleRedirect = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const url = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      state: userId, // attaches logged-in user ID
    });

    return res.redirect(url);
  } catch (err) {
    console.error("Google Redirect Error:", err);
    return res.status(500).send("Google OAuth Redirect Failed");
  }
};

/* ===================================================
   STEP 2 — Google → callback → Save tokens
=================================================== */
exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const userId = req.query.state;

    if (!code || !userId) {
      return res.status(400).send("Invalid OAuth Callback");
    }

    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    // fetch gmail email
    const oauth2 = google.oauth2({ auth: oauthClient, version: "v2" });
    const profileInfo = await oauth2.userinfo.get();
    const gmailEmail = profileInfo.data.email;

    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    // Save Gmail OAuth Tokens
    user.gmailEmail = gmailEmail;
    user.gmailAccessToken = encrypt(tokens.access_token);
    if (tokens.refresh_token) {
      user.gmailRefreshToken = encrypt(tokens.refresh_token);
    }
    if (tokens.expiry_date) {
      user.gmailTokenExpiry = new Date(tokens.expiry_date);
    }
    user.gmailConnectedAt = new Date();

    await user.save();

    const frontend = process.env.FRONTEND_URL || "https://techm.work.gd";

    return res.redirect(`${frontend}/gmail-connected?success=1`);
  } catch (err) {
    console.error("Google Callback Error:", err);

    const frontend = process.env.FRONTEND_URL || "https://techm.work.gd";
    return res.redirect(`${frontend}/gmail-connected?success=0`);
  }
};

/* ===================================================
   STEP 6 — n8n → Fetch Gmail Tokens (Secure)
=================================================== */
exports.getGmailTokens = async (req, res) => {
  try {
    // Check API KEY for security
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.gmailRefreshToken)
      return res.status(400).json({ error: "Gmail not connected" });

    // Decrypt tokens
    let accessToken = decrypt(user.gmailAccessToken);
    const refreshToken = decrypt(user.gmailRefreshToken);

    // Check token expiry
    const expired =
      !user.gmailTokenExpiry ||
      new Date(user.gmailTokenExpiry).getTime() < Date.now() + 60000;

    // Refresh token if needed
    if (expired) {
      console.log("Refreshing Gmail OAuth token for user:", userId);

      const tempClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      const refreshed = await tempClient.refreshToken(refreshToken);
      accessToken = refreshed.credentials.access_token;

      // Update new expiry
      user.gmailAccessToken = encrypt(accessToken);
      if (refreshed.credentials.expiry_date) {
        user.gmailTokenExpiry = new Date(
          refreshed.credentials.expiry_date
        );
      }

      await user.save();
    }

    return res.json({
      email: user.gmailEmail,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: user.gmailTokenExpiry,
    });
  } catch (err) {
    console.error("getGmailTokens error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
