// controllers/googleController.js
const { google } = require("googleapis");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AuthEventLogger = require("../utils/authEventLogger");

/* ===================================================
   ⚡ ENCRYPTION HELPERS
=================================================== */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.error("❌ CRITICAL: ENCRYPTION_KEY is missing in environment variables.");
  if (process.env.NODE_ENV === "production") {
    throw new Error("ENCRYPTION_KEY is required in production");
  }
}

// encrypt (AES-256-GCM)
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
    console.error("❌ encrypt() error:", err);
    return null;
  }
};

// decrypt (AES-256-GCM)
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
  } catch (err) {
    console.error("❌ decrypt() error:", err);
    return null;
  }
};

/* ===================================================
   ⚡ GOOGLE LOGIN (NO GMAIL SCOPE)
=================================================== */

const LOGIN_SCOPES = ["email", "profile"];

const loginClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_LOGIN_REDIRECT
);

// Google Login Redirect
exports.googleLoginRedirect = async (req, res) => {
  try {
    const url = loginClient.generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: LOGIN_SCOPES,
    });

    return res.redirect(url);
  } catch (err) {
    console.error("❌ Google Login Redirect Error:", err);
    return res.status(500).send("Google Login Failed");
  }
};

// Helper: Retry OAuth token exchange with exponential backoff
async function getTokenWithRetry(oauthClient, code, maxRetries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 OAuth token exchange attempt ${attempt}/${maxRetries}`);
      const { tokens } = await oauthClient.getToken(code);
      console.log("✅ OAuth token exchange successful");
      return { success: true, tokens };
    } catch (err) {
      lastError = err;
      const errorMsg = (err?.message || "").toLowerCase();
      const errorCode = err?.code;

      // Classify error types
      if (errorMsg.includes("invalid_grant")) {
        console.error(`⚠️ invalid_grant error (attempt ${attempt}):`, {
          error: err.message,
          code: errorCode,
          hint: "OAuth code may be expired, reused, or clock skew issue"
        });

        // Don't retry invalid_grant - it won't succeed
        return {
          success: false,
          error: "invalid_grant",
          message: "Authentication code expired or already used. Please try signing in again.",
          userMessage: "Authentication session expired. Please try again."
        };
      }

      if (errorMsg.includes("redirect_uri_mismatch")) {
        console.error("❌ redirect_uri_mismatch - Configuration error");
        return {
          success: false,
          error: "config_error",
          message: "OAuth configuration error",
          userMessage: "Authentication service temporarily unavailable. Please contact support."
        };
      }

      // Network or temporary errors - retry with backoff
      if (attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.warn(`⏳ Retrying in ${backoffMs}ms due to: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  // All retries failed
  console.error("❌ All OAuth token exchange attempts failed:", lastError?.message);
  return {
    success: false,
    error: "network_error",
    message: lastError?.message || "Unknown error",
    userMessage: "We're having trouble connecting. Please try again in a moment."
  };
}

// Google Login Callback
exports.googleLoginCallback = async (req, res) => {
  const startTime = Date.now();
  let frontend = process.env.FRONTEND_URL || "http://localhost:3000";
  if (frontend && frontend.endsWith("/")) {
    frontend = frontend.slice(0, -1);
  }

  try {
    const code = req.query.code;

    if (!code) {
      console.error("❌ No authorization code received");
      AuthEventLogger.logOAuthFail("google", "/auth/login/google/callback", "no_code", "No authorization code", req);
      return res.redirect(`${frontend}/auth/login?error=no_code`);
    }

    // Attempt token exchange with retry logic
    const result = await getTokenWithRetry(loginClient, code);

    if (!result.success) {
      // Log OAuth failure
      const errorType = result.error || "unknown";
      console.error(`❌ OAuth failed: ${errorType}`);
      AuthEventLogger.logOAuthFail("google", "/auth/login/google/callback", result.error, result.message, req);
      return res.redirect(`${frontend}/auth/login?error=${errorType}`);
    }

    const { tokens } = result;
    loginClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: loginClient, version: "v2" });
    const googleUser = await oauth2.userinfo.get();

    const email = googleUser.data.email;
    const name = googleUser.data.name || "New User";
    const picture = googleUser.data.picture || null;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: "user",
        password: crypto.randomBytes(32).toString("hex"),
        googlePicture: picture,
      });
      console.log(`✅ New user created via Google OAuth: ${email}`);
    } else {
      // Update picture if user already exists
      if (picture && user.googlePicture !== picture) {
        user.googlePicture = picture;
        await user.save();
      }
      console.log(`✅ Existing user logged in: ${email}`);
    }

    const token = jwt.sign(
      { id: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Log successful OAuth + login
    const processingTime = Date.now() - startTime;
    AuthEventLogger.logOAuthSuccess("google", "/auth/login/google/callback", user.userId, req, processingTime);

    return res.redirect(`${frontend}/auth/google?token=${encodeURIComponent(token)}`);

  } catch (err) {
    console.error("❌ Google Login Callback Critical Error:", err);
    AuthEventLogger.logOAuthFail("google", "/auth/login/google/callback", "critical_error", err.message, req);
    // Redirect with generic error - don't expose internal details
    return res.redirect(`${frontend}/auth/login?error=auth_failed`);
  }
};

/* ===================================================
   ⚡ GMAIL CONNECT (OFFLINE REFRESH TOKEN)
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

// Gmail OAuth Redirect
exports.gmailRedirect = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    const url = gmailClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GMAIL_SCOPES,
      state: String(userId),
    });

    return res.redirect(url);
  } catch (err) {
    console.error("❌ Gmail Redirect Error:", err);
    return res.status(500).send("Gmail OAuth Redirect Failed");
  }
};

// Gmail OAuth Callback
exports.gmailCallback = async (req, res) => {
  let frontend = process.env.FRONTEND_URL || "http://localhost:3000";
  if (frontend && frontend.endsWith("/")) {
    frontend = frontend.slice(0, -1);
  }

  try {
    const code = req.query.code;
    const userId = Number(req.query.state);

    if (!code) {
      console.error("❌ No authorization code in Gmail callback");
      return res.redirect(`${frontend}/gmail-connected?success=0&error=no_code`);
    }

    // Use retry logic for Gmail token exchange too
    const result = await getTokenWithRetry(gmailClient, code);

    if (!result.success) {
      console.error(`❌ Gmail OAuth failed: ${result.error}`);
      return res.redirect(`${frontend}/gmail-connected?success=0&error=${result.error}`);
    }

    const { tokens } = result;
    gmailClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: gmailClient, version: "v2" });
    const profile = await oauth2.userinfo.get();
    const gmailEmail = profile.data.email;
    const picture = profile.data.picture || null;

    const user = await User.findOne({ userId });

    if (!user) {
      console.error("❌ User not found for userId:", userId);
      return res.redirect(`${frontend}/gmail-connected?success=0&error=user_not_found`);
    }

    user.gmailEmail = gmailEmail;

    // Update profile picture if available
    if (picture) {
      user.googlePicture = picture;
    }

    // Only update access token if Google sent it
    if (tokens.access_token) {
      user.gmailAccessToken = encrypt(tokens.access_token);
    }

    // Only update refresh token if Google sent it (Google normally sends only ONCE)
    if (tokens.refresh_token) {
      user.gmailRefreshToken = encrypt(tokens.refresh_token);
    }

    if (tokens.expiry_date) {
      user.gmailTokenExpiry = new Date(tokens.expiry_date);
    }

    // Encrypt credentials
    user.clientId = encrypt(process.env.GOOGLE_CLIENT_ID);
    user.clientSecret = encrypt(process.env.GOOGLE_CLIENT_SECRET);

    await user.save();

    console.log(`✅ Gmail connected successfully for user ${userId}`);
    return res.redirect(`${frontend}/gmail-connected?success=1`);

  } catch (err) {
    console.error("❌ Gmail Callback Critical Error:", err);
    return res.redirect(`${frontend}/gmail-connected?success=0&error=critical`);
  }
};

/* ===================================================
   ⚡ REFRESH ACCESS TOKEN (LATEST METHOD)
=================================================== */

async function refreshGoogleTokens(user) {
  try {
    console.log("🔁 refreshGoogleTokens → user:", user.userId);

    const refreshToken = decrypt(user.gmailRefreshToken);
    const clientId = decrypt(user.clientId);
    const clientSecret = decrypt(user.clientSecret);

    if (!refreshToken || !clientId || !clientSecret) {
      return { error: "missing_credentials" };
    }

    const oAuthClient = new google.auth.OAuth2(clientId, clientSecret);

    oAuthClient.setCredentials({ refresh_token: refreshToken });

    console.log("⏳ Requesting updated access token…");

    const { credentials } = await oAuthClient.refreshAccessToken();

    if (!credentials.access_token) {
      return { error: "refresh_failed" };
    }

    user.gmailAccessToken = encrypt(credentials.access_token);
    user.gmailTokenExpiry = new Date(
      credentials.expiry_date || Date.now() + 3500 * 1000
    );

    await user.save();

    return {
      accessToken: credentials.access_token,
      expiry: user.gmailTokenExpiry,
    };
  } catch (err) {
    const msg = (err?.message || "").toLowerCase();

    if (msg.includes("invalid_grant")) {
      return { error: "invalid_refresh_token" };
    }

    return { error: "unknown_error", details: err.message };
  }
}

/* ===================================================
   ⚡ GET TOKENS FOR N8N
=================================================== */

exports.getGmailTokens = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.N8N_API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = Number(req.params.userId);
    const user = await User.findOne({ userId });

    if (!user || !user.gmailRefreshToken) {
      return res.status(400).json({ error: "gmail_not_connected" });
    }

    let accessToken = decrypt(user.gmailAccessToken);

    const expired =
      !user.gmailTokenExpiry ||
      new Date(user.gmailTokenExpiry).getTime() < Date.now() + 60000;

    if (!accessToken || expired) {
      const refreshed = await refreshGoogleTokens(user);

      if (refreshed.error) {
        return res.status(400).json(refreshed);
      }

      accessToken = refreshed.accessToken;
    }

    return res.json({
      email: user.gmailEmail,
      access_token: accessToken,
      refresh_token: decrypt(user.gmailRefreshToken),
      expires_at: user.gmailTokenExpiry,
    });

  } catch (err) {
    console.error("❌ getGmailTokens ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ===================================================
   EXPORTS
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
