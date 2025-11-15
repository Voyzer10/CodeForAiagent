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
  console.log("🔐 Encrypting text...");
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
  console.log("🔓 Decrypting payload...");
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
   FLOW A → GOOGLE LOGIN (NO Gmail scopes)
=================================================== */

const LOGIN_SCOPES = ["email", "profile"];

console.log("📡 LOGIN_SCOPES:", LOGIN_SCOPES);

const loginClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_LOGIN_REDIRECT
);

console.log("🔧 Google LOGIN OAuth Client Initialized");
console.log("🔧 Login Redirect URI:", process.env.GOOGLE_LOGIN_REDIRECT);

/* ------------------------------------------
   1️⃣ REDIRECT TO GOOGLE LOGIN
------------------------------------------- */
exports.googleLoginRedirect = async (req, res) => {
  try {
    console.log("➡️ Google Login Redirect HIT");

    // DEBUGGING LOGS – MUST BE BEFORE ANY RETURN
    console.log(">>> GOOGLE_LOGIN_REDIRECT =", JSON.stringify(process.env.GOOGLE_LOGIN_REDIRECT));
    console.log(">>> GMAIL_REDIRECT_URI =", JSON.stringify(process.env.GMAIL_REDIRECT_URI));

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


/* ------------------------------------------
   2️⃣ GOOGLE LOGIN CALLBACK
------------------------------------------- */
exports.googleLoginCallback = async (req, res) => {
  try {
    console.log("⬅️ Google Login Callback HIT");
    console.log("📩 Query Params:", req.query);

    const code = req.query.code;

    if (!code) return res.status(400).send("Invalid Google Login Callback");

    const { tokens } = await loginClient.getToken(code);

    console.log("🔑 Token Received? access_token =", tokens.access_token ? "YES" : "NO");

    loginClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: loginClient, version: "v2" });
    const googleUser = await oauth2.userinfo.get();

    console.log("👤 Google User:", googleUser.data);

    const email = googleUser.data.email;
    const name = googleUser.data.name || "New User";

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        role: "user",
        password: crypto.randomBytes(32).toString("hex"), // SAFE
      });
    }

    const token = jwt.sign(
      { id: Number(user.userId), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const frontend = process.env.FRONTEND_URL;
    return res.redirect(`${frontend}/auth/google?token=${token}`);

  } catch (err) {
    console.error("❌ Google Login Callback Error:", err.message);
    return res.status(500).send("Login Failed");
  }
};


/* ===================================================
   FLOW B → GMAIL CONNECT (OFFLINE TOKENS)
=================================================== */

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "email",
  "profile",
];

console.log("📡 GMAIL_SCOPES:", GMAIL_SCOPES);

const gmailClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

console.log("🔧 Google GMAIL OAuth Client Initialized");
console.log("🔧 Gmail Redirect URI:", process.env.GMAIL_REDIRECT_URI);

/* ------------------------------------------
   1️⃣ REDIRECT TO GOOGLE CONSENT (GMAIL)
------------------------------------------- */
exports.gmailRedirect = async (req, res) => {
  try {
    console.log("➡️ Gmail OAuth Redirect HIT");
    console.log("👤 Auth User:", req.user);

    const userId = req.user._id.toString();
    console.log("🔗 Gmail Connect for UserID:", userId);

    const url = gmailClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GMAIL_SCOPES,
      state: userId,
    });

    console.log("🌐 Redirecting to Gmail OAuth:", url);

    return res.redirect(url);
  } catch (err) {
    console.error("❌ Gmail Redirect Error:", err);
    return res.status(500).send("Gmail OAuth Redirect Failed");
  }
};

/* ------------------------------------------
   2️⃣ GMAIL CALLBACK — SAVE TOKENS
------------------------------------------- */
exports.gmailCallback = async (req, res) => {
  try {
    console.log("⬅️ Gmail OAuth Callback HIT");
    console.log("📩 Query Params:", req.query);

    const code = req.query.code;
    const userId = req.query.state;

    if (!code || !userId) {
      console.error("❌ Missing code/userId:", { code, userId });
      return res.status(400).send("Invalid Gmail Callback");
    }

    console.log("🔑 OAuth Code:", code);
    console.log("👤 State UserID:", userId);

    const { tokens } = await gmailClient.getToken(code);
    console.log("🔑 Gmail Tokens:", tokens);

    gmailClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: gmailClient, version: "v2" });
    const profile = await oauth2.userinfo.get();

    console.log("📩 Gmail Profile:", profile.data);

    const gmailEmail = profile.data.email;

    const user = await User.findById(userId);
    console.log("🔍 Found User:", !!user);

    user.gmailEmail = gmailEmail;
    user.gmailAccessToken = encrypt(tokens.access_token);

    if (tokens.refresh_token) {
      console.log("🔁 Refresh Token Received");
      user.gmailRefreshToken = encrypt(tokens.refresh_token);
    }

    if (tokens.expiry_date) {
      user.gmailTokenExpiry = new Date(tokens.expiry_date);
    }

    user.gmailConnectedAt = new Date();

    await user.save();
    console.log("💾 Gmail OAuth Saved for User:", userId);

    const frontend = process.env.FRONTEND_URL;
    return res.redirect(`${frontend}/gmail-connected?success=1`);
  } catch (err) {
    console.error("❌ Gmail Callback Error:", err);
    const frontend = process.env.FRONTEND_URL;
    return res.redirect(`${frontend}/gmail-connected?success=0`);
  }
};

/* ===================================================
   SECURE n8n TOKEN FETCH
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

    const user = await User.findById(userId);

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

    console.log("🔓 Tokens decrypted");

    const expired =
      !user.gmailTokenExpiry ||
      new Date(user.gmailTokenExpiry).getTime() < Date.now() + 60000;

    if (expired) {
      console.log("⚠ Token expired → Refreshing...");

      const tempClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      const refreshed = await tempClient.refreshToken(refreshToken);
      console.log("🔁 Tokens refreshed:", refreshed.credentials);

      accessToken = refreshed.credentials.access_token;

      user.gmailAccessToken = encrypt(accessToken);
      if (refreshed.credentials.expiry_date) {
        user.gmailTokenExpiry = new Date(refreshed.credentials.expiry_date);
      }

      await user.save();
      console.log("💾 Updated refreshed tokens in DB");
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
