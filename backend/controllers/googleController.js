// controllers/googleController.js
const { google } = require("googleapis");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

console.log("🔄 googleController.js LOADED");

/* ===================================================
   ENCRYPTION HELPERS
=================================================== */

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "00000000000000000000000000000000";

console.log("🔐 Encryption Key Loaded:", ENCRYPTION_KEY ? "YES" : "NO");

const encrypt = (text) => {
  if (!text) return null;
  try {
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
  } catch (err) {
    console.error("❌ encrypt() error:", err.message);
    return null;
  }
};

const decrypt = (payload) => {
  if (!payload) return null;
  try {
    const [ivHex, tagHex, encryptedText] = payload.split(":");
    if (!ivHex || !tagHex || !encryptedText) return null;
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
  } catch (err) {
    console.error("❌ decrypt() error:", err.message);
    return null;
  }
};

/* ===================================================
   LOGIN (no Gmail scopes)
=================================================== */

const LOGIN_SCOPES = ["email", "profile"];
const loginClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_LOGIN_REDIRECT
);

console.log("🔧 Google LOGIN OAuth Client Initialized");
console.log("🔧 Login Redirect URI:", process.env.GOOGLE_LOGIN_REDIRECT);

exports.googleLoginRedirect = async (req, res) => {
  try {
    console.log("➡️ Google Login Redirect HIT");
    const url = loginClient.generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: LOGIN_SCOPES,
    });
    console.log("🌐 Redirecting to Google Login:", url);
    return res.redirect(url);
  } catch (err) {
    console.error("❌ Google Login Redirect Error:", err);
    return res.status(500).send("Google Login Failed");
  }
};

exports.googleLoginCallback = async (req, res) => {
  try {
    console.log("⬅️ Google Login Callback HIT");
    const code = req.query.code;
    if (!code) return res.status(400).send("Invalid Google Login");

    const { tokens } = await loginClient.getToken(code);
    loginClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: loginClient, version: "v2" });
    const googleUser = await oauth2.userinfo.get();

    const email = googleUser.data.email;
    const name = googleUser.data.name || "New User";

    if (!email) return res.status(400).send("Google account has no email");

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: "user",
        password: crypto.randomBytes(32).toString("hex"),
      });
    }

    const token = jwt.sign(
      { id: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const frontend = process.env.FRONTEND_URL.replace(/\/+$/, "");
    const finalUrl = `${frontend}/auth/google?token=${encodeURIComponent(token)}`;

    console.log("➡️ Redirecting to:", finalUrl);
    return res.redirect(finalUrl);

  } catch (err) {
    console.error("❌ Google Login Callback Error:", err);
    return res.status(500).send("Login Failed");
  }
};

/* ===================================================
   GMAIL CONNECT (offline tokens)
=================================================== */

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "email",
  "profile",
];

const gmailClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

console.log("🔧 Google GMAIL OAuth Client Initialized");
console.log("🔧 Gmail Redirect URI:", process.env.GMAIL_REDIRECT_URI);

exports.gmailRedirect = async (req, res) => {
  try {
    console.log("➡️ Gmail OAuth Redirect HIT");
    console.log("👤 Auth User:", req.user);

    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(400).send("Invalid user");

    const url = gmailClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GMAIL_SCOPES,
      state: String(userId),
    });

    console.log("🌐 Redirecting to Gmail OAuth:", url);
    return res.redirect(url);
  } catch (err) {
    console.error("❌ Gmail Redirect Error:", err);
    return res.status(500).send("Gmail OAuth Redirect Failed");
  }
};

exports.gmailCallback = async (req, res) => {
  try {
    console.log("⬅️ Gmail OAuth Callback HIT");
    const code = req.query.code;
    const userId = Number(req.query.state);

    if (!code || !userId) {
      return res.status(400).send("Invalid Gmail Callback");
    }

    const { tokens } = await gmailClient.getToken(code);
    gmailClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: gmailClient, version: "v2" });
    const profile = await oauth2.userinfo.get();
    const gmailEmail = profile.data.email;

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).send("User not found");

    // Save tokens + client credentials encrypted
    user.gmailEmail = gmailEmail || user.gmailEmail;
    user.gmailAccessToken = encrypt(tokens.access_token || "");
    user.gmailRefreshToken = encrypt(tokens.refresh_token || "");
    user.gmailTokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
    user.gmailConnectedAt = new Date();

    // Save the client credentials that were used to generate these tokens
    user.clientId = encrypt(process.env.GOOGLE_CLIENT_ID || "");
    user.clientSecret = encrypt(process.env.GOOGLE_CLIENT_SECRET || "");

    await user.save();

    const frontend = process.env.FRONTEND_URL.replace(/\/+$/, "");
    return res.redirect(`${frontend}/gmail-connected?success=1`);
  } catch (err) {
    console.error("❌ Gmail Callback Error:", err);
    const frontend = process.env.FRONTEND_URL.replace(/\/+$/, "");
    return res.redirect(`${frontend}/gmail-connected?success=0`);
  }
};

/* ===================================================
   REFRESH TOKEN HELPER (shared)
=================================================== */

async function refreshGoogleTokens(user) {
  try {
    console.log("🔁 refreshGoogleTokens() called for userId:", user.userId);

    const refreshTokenEncrypted = user.gmailRefreshToken;
    const clientIdEncrypted = user.clientId;
    const clientSecretEncrypted = user.clientSecret;

    const refreshToken = decrypt(refreshTokenEncrypted);
    const clientId = decrypt(clientIdEncrypted);
    const clientSecret = decrypt(clientSecretEncrypted);

    if (!refreshToken || !clientId || !clientSecret) {
      console.log("❌ Missing refresh token / client credentials");
      return { error: "gmail_not_connected" };
    }

    // Use the clientId/clientSecret that were saved when user connected
    const oAuthClient = new google.auth.OAuth2(clientId, clientSecret);
    oAuthClient.setCredentials({ refresh_token: refreshToken });

    console.log("⏳ Requesting new access token from Google…");

    // IMPORTANT: use refreshToken(refreshToken) — returns {credentials}
    const { credentials } = await oAuthClient.refreshToken(refreshToken);

    if (!credentials || !credentials.access_token) {
      console.log("❌ Google did not return access_token:", credentials);
      return { error: "refresh_failed" };
    }

    console.log("✅ Token refreshed:", {
      hasAccessToken: !!credentials.access_token,
      expiry: credentials.expiry_date || null,
    });

    // Update DB (store encrypted)
    user.gmailAccessToken = encrypt(credentials.access_token);
    user.gmailTokenExpiry = credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3500 * 1000);
    await user.save();

    console.log("💾 Updated refreshed token in DB for user:", user.userId);

    return {
      accessToken: credentials.access_token,
      expiry: user.gmailTokenExpiry,
    };
  } catch (err) {
    console.log("❌ refreshGoogleTokens error:", err.response?.data || err.message || err);
    if (String(err.message || "").toLowerCase().includes("invalid_grant") || (err.response && err.response.data && String(err.response.data).toLowerCase().includes("invalid_grant"))) {
      return { error: "invalid_refresh_token" };
    }
    return { error: "unknown_error", details: err.message || String(err) };
  }
}

/* ===================================================
   n8n / External fetch for tokens
=================================================== */
exports.getGmailTokens = async (req, res) => {
  try {
    console.log("🚀 getGmailTokens HIT");

    const apiKey = req.headers["x-api-key"];
    console.log("🔐 API Key Received:", apiKey);

    if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
      console.error("❌ Invalid API Key");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.params.userId;
    console.log("🔍 Fetching Gmail Tokens for:", userId);

    const user = await User.findOne({ userId });

    if (!user) {
      console.error("❌ User Not Found");
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.gmailRefreshToken) {
      console.error("❌ Gmail Not Connected");
      return res.status(400).json({ error: "Gmail not connected" });
    }

    let accessToken = decrypt(user.gmailAccessToken);
    const refreshToken = decrypt(user.gmailRefreshToken);

    console.log("🔓 Tokens decrypted (accessToken present?):", !!accessToken);

    const expired =
      !user.gmailTokenExpiry ||
      new Date(user.gmailTokenExpiry).getTime() < Date.now() + 60000;

    if (expired) {
      console.log("⚠ Token expired → Refreshing...");
      const refreshed = await refreshGoogleTokens(user);

      if (refreshed.error === "invalid_refresh_token") {
        console.log("❌ Refresh token invalid - user must reconnect Gmail");
        return res.status(400).json({
          error: "gmail_reconnect_needed",
          message: "Your Gmail access expired. Please reconnect Gmail.",
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

    return res.json({
      email: user.gmailEmail,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: user.gmailTokenExpiry,
    });
  } catch (err) {
    console.error("❌ getGmailTokens ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ===================================================
   Exports
=================================================== */
module.exports = {
  googleLoginRedirect: exports.googleLoginRedirect,
  googleLoginCallback: exports.googleLoginCallback,
  gmailRedirect: exports.gmailRedirect,
  gmailCallback: exports.gmailCallback,
  getGmailTokens: exports.getGmailTokens,
  refreshGoogleTokens,
  decrypt,
  encrypt,
};
