const mongoose = require("mongoose");

/**
 * AuthEvent Schema - Tracks all authentication events for monitoring
 * Non-sensitive, structured logging for admin dashboard
 */
const authEventSchema = new mongoose.Schema({
    // Event Classification
    eventType: {
        type: String,
        required: true,
        enum: [
            "OAUTH_SUCCESS",           // OAuth token exchange succeeded
            "OAUTH_FAIL",              // OAuth token exchange failed
            "OAUTH_INVALID_GRANT",     // Specific invalid_grant error
            "OAUTH_NETWORK_ERROR",     // Network-related OAuth failure
            "OAUTH_RETRY_SUCCESS",     // Retry succeeded after failure
            "LOGIN_SUCCESS",           // Email/password login success
            "LOGIN_FAIL",              // Email/password login failed
            "RATE_LIMIT_AUTH",         // Rate limit hit on auth route
            "TOKEN_REFRESH_SUCCESS",   // Token refresh succeeded
            "TOKEN_REFRESH_FAIL",      // Token refresh failed
            "SESSION_CREATE_FAIL",     // Session creation failed
            "GMAIL_CONNECT_SUCCESS",   // Gmail OAuth succeeded
            "GMAIL_CONNECT_FAIL",      // Gmail OAuth failed
        ],
        index: true,
    },

    // Success/Failure
    success: {
        type: Boolean,
        required: true,
        index: true,
    },

    // Provider & Route Info
    provider: {
        type: String,
        enum: ["google", "email", "system", null],
        default: null,
    },
    route: {
        type: String,
        required: true,
    },

    // Error Information (if failed)
    errorCode: {
        type: String,
        default: null,
    },
    errorMessage: {
        type: String,
        default: null,
    },

    // User & Request Context
    userId: {
        type: Number,
        default: null,
        index: true,
    },
    requestId: {
        type: String,
        default: null,
        index: true,
    },

    // Device & Network (Privacy-Safe)
    deviceType: {
        type: String,
        enum: ["mobile", "desktop", "tablet", "unknown"],
        default: "unknown",
    },
    userAgent: {
        type: String,
        default: null,
    },
    ipAddressMasked: {
        type: String, // e.g., "103.xxx.xxx.12"
        default: null,
    },

    // Additional Metadata
    retryAttempt: {
        type: Number,
        default: 0,
    },
    processingTime: {
        type: Number, // milliseconds
        default: null,
    },

    // User Behavior Tracking
    userRetried: {
        type: Boolean,
        default: null,
    },
    userAbandoned: {
        type: Boolean,
        default: null,
    },

    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: false, // Using custom timestamp field
    collection: "auth-events",
});

// Compound indexes for common queries
authEventSchema.index({ timestamp: -1, eventType: 1 });
authEventSchema.index({ timestamp: -1, success: 1 });
authEventSchema.index({ eventType: 1, success: 1 });
authEventSchema.index({ ipAddressMasked: 1, timestamp: -1 });

// TTL index - auto-delete events older than 30 days
authEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("AuthEvent", authEventSchema);
