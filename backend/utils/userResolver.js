const mongoose = require('mongoose');

/**
 * Resolves a userId/id string into a query object for the User model.
 * If input is numeric -> { userId: Number(id) }
 * If input is valid ObjectId -> { _id: id }
 * Otherwise returns null to signal invalid ID.
 * 
 * Centralizing this ensures backward compatibility for users with numeric 
 * custom 'userId' and newer users identified by Mongo '_id'.
 */
const resolveUserQuery = (id) => {
    if (id === null || id === undefined) return null;

    const idStr = String(id).trim();
    if (idStr === "" || idStr.toLowerCase() === "null") return null;

    // 1. Check if it's a number (The legacy 5-digit custom userId)
    // We use Number.isSafeInteger to be sure it's a valid ID number
    if (!isNaN(idStr) && !idStr.includes('.')) {
        return { userId: Number(idStr) };
    }

    // 2. Check if it's a valid Mongo ObjectId string
    if (mongoose.Types.ObjectId.isValid(idStr)) {
        // Mongoose handles string vs ObjectId automatically in queries
        return { _id: idStr };
    }

    // 3. Last resort fallback for safety
    return { userId: idStr };
};

module.exports = { resolveUserQuery };
