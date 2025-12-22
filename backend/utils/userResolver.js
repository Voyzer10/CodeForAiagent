const mongoose = require("mongoose");

/**
 * Resolves a raw user identifier into a SAFE Mongo query.
 *
 * Supported:
 *  - Legacy numeric userId (Number)
 *  - MongoDB ObjectId (_id)
 *
 * Explicitly REJECTS:
 *  - "me"
 *  - non-numeric strings
 *  - invalid ObjectIds
 *
 * @param {string|number|undefined|null} rawId
 * @returns {{ userId: number } | { _id: string } | null}
 */
const resolveUserQuery = (rawId) => {
  if (rawId === null || rawId === undefined) return null;

  const idStr = String(rawId).trim();
  if (idStr === "" || idStr.toLowerCase() === "null") return null;

  // 1️⃣ Legacy numeric userId (SAFE)
  if (/^\d+$/.test(idStr)) {
    const num = Number(idStr);
    if (Number.isSafeInteger(num)) {
      return { userId: num };
    }
    return null;
  }

  // 2️⃣ MongoDB ObjectId (SAFE)
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    return { _id: idStr };
  }

  // ❌ Anything else is INVALID (NO FALLBACK)
  return null;
};

module.exports = { resolveUserQuery };
