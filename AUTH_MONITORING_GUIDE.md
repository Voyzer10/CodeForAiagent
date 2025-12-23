# 🔍 Authentication Monitoring System - Implementation Guide

## ✅ Phase 1: Backend Logging Infrastructure (COMPLETED)

### Files Created:
1. **`backend/model/AuthEvent.js`** - MongoDB schema for auth events
2. **`backend/utils/authEventLogger.js`** - Centralized logging utility

### Files Modified:
1. **`backend/controllers/googleController.js`** - Added OAuth logging
2. **`backend/controllers/authController.js`** - Added login/password logging

### What's Working:
- ✅ All auth events are now being logged to MongoDB
- ✅ Non-blocking, async logging (fails silently if DB is down)
- ✅ IP masking for privacy (`103.xxx.xxx.12` format)
- ✅ Device type detection (mobile/desktop/tablet)
- ✅ Request ID generation for tracing
- ✅ Processing time tracking
- ✅ TTL index (auto-delete after 30 days)

### Event Types Logged:
- `OAUTH_SUCCESS` / `OAUTH_FAIL`
- `OAUTH_INVALID_GRANT`
- `LOGIN_SUCCESS` / `LOGIN_FAIL`
- `RATE_LIMIT_AUTH`
- `TOKEN_REFRESH_SUCCESS` / `TOKEN_REFRESH_FAIL`
- `GMAIL_CONNECT_SUCCESS` / `GMAIL_CONNECT_FAIL`

---

## 📊 Phase 2: Admin API Endpoints (IN PROGRESS)

### Next Steps:

#### 1. Create Auth Monitoring API (`backend/routes/authMonitoring.js`)

```javascript
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuthMiddleware");
const AuthEvent = require("../model/AuthEvent");

// Admin-only middleware
router.use(auth);
router.use(adminAuth);

// GET /api/auth-monitoring/overview
// Returns: total logins, success rate, failure rate (24h/7d)
router.get("/overview", async (req, res) => {
  const { timeframe = "24h" } = req.query;
  const hoursAgo = timeframe === "24h" ? 24 : 168;
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const stats = await AuthEvent.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: "$success",
        count: { $sum: 1 },
      },
    },
  ]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const successes = stats.find((s) => s._id === true)?.count || 0;
  const failures = stats.find((s) => s._id === false)?.count || 0;

  res.json({
    total,
    successes,
    failures,
    successRate: total > 0 ? ((successes / total) * 100).toFixed(2) : 0,
    failureRate: total > 0 ? ((failures / total) * 100).toFixed(2) : 0,
    timeframe,
  });
});

// GET /api/auth-monitoring/errors
// Returns: Breakdown of errors by type
router.get("/errors", async (req, res) => {
  const { timeframe = "24h" } = req.query;
  const hoursAgo = timeframe === "24h" ? 24 : 168;
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const errors = await AuthEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: since },
        success: false,
      },
    },
    {
      $group: {
        _id: "$errorCode",
        count: { $sum: 1 },
        latestError: { $last: "$errorMessage" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({ errors });
});

// GET /api/auth-monitoring/devices
// Returns: Mobile vs Desktop breakdown
router.get("/devices", async (req, res) => {
  const { timeframe = "24h" } = req.query;
  const hoursAgo = timeframe === "24h" ? 24 : 168;
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const devices = await AuthEvent.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: "$deviceType",
        total: { $sum: 1 },
        failures: {
          $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] },
        },
      },
    },
  ]);

  res.json({ devices });
});

// GET /api/auth-monitoring/recent-failures
// Returns: Recent auth failures for drill-down
router.get("/recent-failures", async (req, res) => {
  const { limit = 50, errorCode } = req.query;

  const query = { success: false };
  if (errorCode) {
    query.errorCode = errorCode;
  }

  const failures = await AuthEvent.find(query)
    .sort({ timestamp: -1 })
    .limit(Number(limit))
    .select("-__v")
    .lean();

  res.json({ failures });
});

// GET /api/auth-monitoring/alerts
// Returns: Real-time alerts (high failure rate, spikes, etc.)
router.get("/alerts", async (req, res) => {
  const alerts = [];
  const last5Min = new Date(Date.now() - 5 * 60 * 1000);

  // Check failure rate in last 5 minutes
  const recentEvents = await AuthEvent.countDocuments({
    timestamp: { $gte: last5Min },
  });
  const recentFailures = await AuthEvent.countDocuments({
    timestamp: { $gte: last5Min },
    success: false,
  });

  const failureRate = recentEvents > 0 ? (recentFailures / recentEvents) * 100 : 0;

  if (failureRate > 30) {
    alerts.push({
      severity: "high",
      type: "HIGH_FAILURE_RATE",
      message: `Auth failure rate is ${failureRate.toFixed(1)}% in last 5 minutes`,
      count: recentFailures,
    });
  }

  // Check for invalid_grant spike
  const invalidGrantCount = await AuthEvent.countDocuments({
    timestamp: { $gte: last5Min },
    errorCode: "invalid_grant",
  });

  if (invalidGrantCount > 5) {
    alerts.push({
      severity: "medium",
      type: "INVALID_GRANT_SPIKE",
      message: `${invalidGrantCount} invalid_grant errors in last 5 minutes`,
      count: invalidGrantCount,
    });
  }

  res.json({ alerts });
});

module.exports = router;
```

#### 2. Register Route in `server.js`

```javascript
const authMonitoringRoutes = require("./routes/authMonitoring");
app.use("/api/auth-monitoring", authMonitoringRoutes);
```

---

## 🎨 Phase 3: Admin Frontend Dashboard (TO DO)

### File to Create:
`frontend/src/app/admin/auth-monitoring/page.js`

### Features:
- Auth Health Overview (success rate, failure rate)
- Error Breakdown Chart
- Device Split (mobile vs desktop)
- Recent Failures Table
- Real-Time Alerts

### Tech Stack:
- React + Tailwind CSS
- Charts: Recharts or Chart.js
- Auto-refresh every 30 seconds

---

## 🚀 Testing Checklist

### Backend:
- [ ] Auth events are being created in MongoDB
- [ ] IP addresses are properly masked
- [ ] Device types are correctly detected
- [ ] Admin APIs return correct data
- [ ] Non-admin users cannot access monitoring endpoints

### Frontend:
- [ ] Dashboard loads without errors
- [ ] Charts display correct data
- [ ] Auto-refresh works
- [ ] Mobile-friendly UI
- [ ] Drill-down functionality works

---

## 📐 Database Indexes

Already created in AuthEvent model:
```javascript
{ timestamp: -1, eventType: 1 }
{ timestamp: -1, success: 1 }
{ eventType: 1, success: 1 }
{ ipAddressMasked: 1, timestamp: -1 }
{ timestamp: 1 } // TTL index (30-day retention)
```

---

## 🔒 Security Considerations

✅ **Already Implemented:**
- IP masking (103.xxx.xxx.12)
- Admin-only API access
- No token/password storage
- Sanitized error messages

✅ **To Verify:**
- Admin middleware is enforcing role check
- Rate limiting on monitoring endpoints
- CORS configured correctly

---

## 📊 Sample Data Structure

### Auth Event Document:
```json
{
  "_id": "...",
  "eventType": "OAUTH_SUCCESS",
  "success": true,
  "provider": "google",
  "route": "/auth/login/google/callback",
  "errorCode": null,
  "errorMessage": null,
  "userId": 12345,
  "requestId": "req_1703366400000_a1b2c3d4",
  "deviceType": "mobile",
  "userAgent": "Mozilla/5.0...",
  "ipAddressMasked": "103.xxx.xxx.89",
  "retryAttempt": 0,
  "processingTime": 1234,
  "timestamp": "2025-12-23T17:00:00.000Z"
}
```

---

## 🎯 Next Actions

1. **Create Admin API Routes** (authMonitoring.js)
2. **Create Admin Middleware** (if not exists)
3. **Build Frontend Dashboard**
4. **Test End-to-End**
5. **Deploy to Production**

---

**Status:** Backend logging ✅ | Admin API 🔄 | Frontend ⏳  
**Priority:** HIGH - Required for Production Stability
