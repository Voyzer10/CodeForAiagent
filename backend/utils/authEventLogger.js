const AuthEvent = require("../model/AuthEvent");
const crypto = require("crypto");

/**
 * AuthEventLogger - Centralized, non-blocking authentication event logger
 * Fail-safe: Logging failures must NOT break auth flows
 */
class AuthEventLogger {
    /**
     * Mask IP address for privacy (e.g., "103.45.67.89" -> "103.xxx.xxx.89")
     */
    static maskIP(ip) {
        if (!ip || typeof ip !== "string") return "unknown";

        const parts = ip.split(".");
        if (parts.length === 4) {
            return `${parts[0]}.xxx.xxx.${parts[3]}`;
        }

        // For IPv6 or other formats, hash it
        return crypto.createHash("md5").update(ip).digest("hex").substring(0, 12);
    }

    /**
     * Detect device type from user agent
     */
    static getDeviceType(userAgent) {
        if (!userAgent) return "unknown";

        const ua = userAgent.toLowerCase();

        if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
            return "mobile";
        }
        if (ua.includes("tablet") || ua.includes("ipad")) {
            return "tablet";
        }
        if (ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari")) {
            return "desktop";
        }

        return "unknown";
    }

    /**
     * Generate a unique request ID for tracing
     */
    static generateRequestId() {
        return `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    }

    /**
     * Log an auth event (async, non-blocking, fail-safe)
     * 
     * @param {Object} eventData - Event details
     * @param {string} eventData.eventType - Type of auth event
     * @param {boolean} eventData.success - Whether the event succeeded
     * @param {Object} req - Express request object (optional)
     * @param {Object} additionalData - Additional metadata
     */
    static async logEvent(eventData, req = null, additionalData = {}) {
        // Use setImmediate to make it truly non-blocking
        setImmediate(async () => {
            try {
                const authEvent = {
                    eventType: eventData.eventType,
                    success: eventData.success,
                    provider: eventData.provider || null,
                    route: eventData.route || (req ? req.path : "unknown"),
                    errorCode: eventData.errorCode || null,
                    errorMessage: eventData.errorMessage || null,
                    userId: eventData.userId || null,
                    requestId: eventData.requestId || (req ? req.requestId : AuthEventLogger.generateRequestId()),
                    deviceType: req ? AuthEventLogger.getDeviceType(req.headers["user-agent"]) : "unknown",
                    userAgent: req ? req.headers["user-agent"] || null : null,
                    ipAddressMasked: req ? AuthEventLogger.maskIP(req.ip || req.headers["x-forwarded-for"]) : null,
                    retryAttempt: eventData.retryAttempt || 0,
                    processingTime: eventData.processingTime || null,
                    userRetried: additionalData.userRetried || null,
                    userAbandoned: additionalData.userAbandoned || null,
                    timestamp: new Date(),
                };

                await AuthEvent.create(authEvent);

                // Log to console for immediate visibility
                const icon = authEvent.success ? "✅" : "❌";
                console.log(`${icon} [AUTH EVENT] ${authEvent.eventType} | ${authEvent.route} | ${authEvent.deviceType} | ${authEvent.ipAddressMasked || "N/A"}`);

            } catch (err) {
                // Fail-safe: Log error but don't throw
                console.error("⚠️ AuthEventLogger failed (non-critical):", err.message);
            }
        });
    }

    /**
     * Quick helpers for common events
     */
    static async logOAuthSuccess(provider, route, userId, req, processingTime) {
        return this.logEvent({
            eventType: "OAUTH_SUCCESS",
            success: true,
            provider,
            route,
            userId,
            processingTime,
        }, req);
    }

    static async logOAuthFail(provider, route, errorCode, errorMessage, req, retryAttempt = 0) {
        return this.logEvent({
            eventType: errorCode === "invalid_grant" ? "OAUTH_INVALID_GRANT" : "OAUTH_FAIL",
            success: false,
            provider,
            route,
            errorCode,
            errorMessage,
            retryAttempt,
        }, req);
    }

    static async logLoginSuccess(userId, req, processingTime) {
        return this.logEvent({
            eventType: "LOGIN_SUCCESS",
            success: true,
            provider: "email",
            route: "/auth/login",
            userId,
            processingTime,
        }, req);
    }

    static async logLoginFail(errorMessage, req) {
        return this.logEvent({
            eventType: "LOGIN_FAIL",
            success: false,
            provider: "email",
            route: "/auth/login",
            errorMessage,
        }, req);
    }

    static async logRateLimitAuth(route, req) {
        return this.logEvent({
            eventType: "RATE_LIMIT_AUTH",
            success: false,
            route,
            errorCode: "RATE_LIMIT_EXCEEDED",
            errorMessage: "Too many requests",
        }, req);
    }

    static async logTokenRefresh(success, userId, errorCode = null) {
        return this.logEvent({
            eventType: success ? "TOKEN_REFRESH_SUCCESS" : "TOKEN_REFRESH_FAIL",
            success,
            provider: "google",
            route: "/token-refresh",
            userId,
            errorCode,
        });
    }
}

module.exports = AuthEventLogger;
