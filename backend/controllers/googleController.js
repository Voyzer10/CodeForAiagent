// controllers/googleController.js
const { google } = require("googleapis");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/* ===================================================
   ⚡ ENCRYPTION HELPERS
=================================================== */

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "00000000000000000000000000000000";

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

// Google Login Callback
exports.googleLoginCallback = async (req, res) => {
  try {
    const code = req.query.code;

    const { tokens } = await loginClient.getToken(code);
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
    } else {
      // Update picture if user already exists
      if (picture && user.googlePicture !== picture) {
        user.googlePicture = picture;
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    let frontend = process.env.FRONTEND_URL;
    if (frontend.endsWith("/")) {
      frontend = frontend.slice(0, -1);
    }
    return res.redirect(`${frontend}/auth/google?token=${encodeURIComponent(token)}`);

  } catch (err) {
    console.error("❌ Google Login Callback Error:", err);
    return res.status(500).send("Login Failed");
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
  try {
    const code = req.query.code;
    const userId = Number(req.query.state);

    const { tokens } = await gmailClient.getToken(code);
    gmailClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: gmailClient, version: "v2" });
    const profile = await oauth2.userinfo.get();
    const gmailEmail = profile.data.email;
    const picture = profile.data.picture || null;

    const user = await User.findOne({ userId });

    if (!user) {
      console.error("❌ User not found for userId:", userId);
      let frontend = process.env.FRONTEND_URL;
      if (frontend.endsWith("/")) {
        frontend = frontend.slice(0, -1);
      }
      return res.redirect(`${frontend}/gmail-connected?success=0`);
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

    let frontend = process.env.FRONTEND_URL;
    if (frontend.endsWith("/")) {
      frontend = frontend.slice(0, -1);
    }
    return res.redirect(`${frontend}/gmail-connected?success=1`);

  } catch (err) {
    console.error("❌ Gmail Callback Error:", err);
    let frontend = process.env.FRONTEND_URL;
    if (frontend.endsWith("/")) {
      frontend = frontend.slice(0, -1);
    }
    return res.redirect(`${frontend}/gmail-connected?success=0`);
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
