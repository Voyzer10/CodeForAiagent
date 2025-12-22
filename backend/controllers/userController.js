const User = require("../model/User");
const mongoose = require("mongoose");
const { resolveUserQuery } = require("../utils/userResolver");

const enrichJobsWithCompanyInfo = async (jobs) => {
  if (!jobs || !jobs.length) return [];

  // 1. Get unique CompanyIDs (supporting both company.CompanyID and CompanyID)
  const companyIds = [...new Set(jobs.map(j => j.CompanyID || (j.company && j.company.CompanyID)).filter(Boolean))];

  if (!companyIds.length) return jobs;

  // 2. Fetch from Company-Information collection
  const companies = await mongoose.connection.db.collection('Company-Information')
    .find({ CompanyID: { $in: companyIds } })
    .toArray();

  const companyMap = companies.reduce((acc, c) => {
    acc[c.CompanyID] = { name: c.Comp_Name, logo: c.logo };
    return acc;
  }, {});

  // 3. Re-inject into job objects
  return jobs.map(j => ({
    ...j,
    company: companyMap[j.CompanyID || (j.company && j.company.CompanyID)] || j.company || null
  }));
};
const updateSocialLinks = async (req, res) => {
  try {
    // 1️⃣ Identify user correctly
    const userId = String(req.params.userId || req.user?.id);
    if (!userId) return res.status(400).json({ error: "Missing user ID" });

    const query = resolveUserQuery(userId);
    if (!query) return res.status(400).json({ error: "Invalid user identity" });

    const user = await User.findOne(query);
    Riverside:
    if (!user) return res.status(404).json({ error: "User not found" });

    // 3️⃣ Extract socials from body
    const { github, linkedin } = req.body;
    const updateData = {};
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;

    // 4️⃣ Update
    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Social links updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update socials error:", error);
    res.status(500).json({ message: "Server error updating socials" });
  }
};



// Client ID nad client secret 
const updateClientData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { clientId, clientSecret } = req.body;

    if (!clientId || !clientSecret)
      return res.status(400).json({ message: "Both fields required" });

    const user = await User.findByIdAndUpdate(
      userId,
      { clientId, clientSecret },
      { new: true }
    );

    res.json({ message: "Client data saved", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Resolve user query safely without causing Mongoose CastError
 * @param {string|number|undefined} rawUserId
 * @returns {{ userId: number } | null}
 */
function resolveUserQuery(rawUserId) {
  // Numeric ID (number)
  if (typeof rawUserId === "number") {
    return { userId: rawUserId };
  }

  // Numeric ID (string)
  if (typeof rawUserId === "string" && /^\d+$/.test(rawUserId)) {
    return { userId: Number(rawUserId) };
  }

  return null;
}


// 🟢 Get all saved searches
const getSavedSearches = async (req, res) => {
  try {
    // 🔐 Ensure authentication
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔑 Resolve userId correctly
    const rawUserId =
      req.params.userId === "me"
        ? req.user.id
        : req.params.userId || req.user.id;

    const query = resolveUserQuery(rawUserId);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // 🛡️ Prevent IDOR (users accessing other users' data)
    if (query.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 🔍 Fetch user
    const user = await User.findOne(query).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedSearches = Array.isArray(user.savedSearches)
      ? user.savedSearches
      : [];

    // 🔄 Enrich jobs with company info
    const enrichedSearches = await Promise.all(
      savedSearches.map(async (s) => ({
        ...s,
        jobs: await enrichJobsWithCompanyInfo(s.jobs || [])
      }))
    );

    res.json({ savedSearches: enrichedSearches });
  } catch (err) {
    console.error("Error fetching saved searches:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// 🟢 Save a new search
const saveSearch = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, jobs, runId, sessionId } = req.body;

    const query = resolveUserQuery(userId);
    if (!query) return res.status(400).json({ error: "Missing or invalid user ID" });
    if (!name) return res.status(400).json({ error: "Search name required" });

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newSearch = { name, jobs, runId: runId || sessionId, createdAt: new Date() };
    user.savedSearches = user.savedSearches || [];

    user.savedSearches.unshift(newSearch);
    user.savedSearches = user.savedSearches.slice(0, 10);

    await user.save();

    res.json({ success: true, savedSearch: newSearch });
  } catch (err) {
    console.error("Error saving search:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Delete a saved search
const deleteSavedSearch = async (req, res) => {
  try {
    const query = resolveUserQuery(req.user?.id);
    const { name } = req.params;

    if (!query) return res.status(400).json({ error: "Missing or invalid user ID" });

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.savedSearches = (user.savedSearches || []).filter(
      (s) => s.name !== name
    );

    await user.save();
    res.json({ success: true, savedSearches: user.savedSearches });
  } catch (err) {
    console.error("Error deleting saved search:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Rename a session in history
const renameSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId, newName } = req.body;

    const query = resolveUserQuery(userId);
    if (!query) return res.status(400).json({ error: "Missing or invalid user ID" });
    if (!sessionId || !newName) return res.status(400).json({ error: "Session ID and new name required" });

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.plan && user.plan.history) {
      const session = user.plan.history.find(h => h.sessionId === sessionId);
      if (session) {
        session.sessionName = newName;
        await user.save();
        return res.json({ success: true, message: "Session renamed", history: user.plan.history });
      }
    }

    res.status(404).json({ error: "Session not found" });
  } catch (err) {
    console.error("Error renaming session:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Rename a saved search
const renameSavedSearch = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name } = req.params; // Old name
    const { newName } = req.body;

    const query = resolveUserQuery(userId);
    if (!query) return res.status(400).json({ error: "Missing or invalid user ID" });
    if (!newName) return res.status(400).json({ error: "New name required" });

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: "User not found" });

    const search = (user.savedSearches || []).find((s) => s.name === name);
    if (!search) return res.status(404).json({ error: "Saved search not found" });

    search.name = newName;
    await user.save();

    res.json({ success: true, savedSearches: user.savedSearches });
  } catch (err) {
    console.error("Error renaming saved search:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Toggle a saved job (Add if not exists, remove if exists)
const toggleSavedJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { job } = req.body;

    const query = resolveUserQuery(userId);
    if (!query) return res.status(400).json({ error: "Missing or invalid user ID" });
    if (!job) return res.status(400).json({ error: "Job object required" });

    // Use jobid/id as unique identifier
    const jobUUID = job.jobid || job.jobId || job.id || job._id;
    if (!jobUUID) return res.status(400).json({ error: "Job ID missing" });

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.savedJobs = user.savedJobs || [];
    const index = user.savedJobs.findIndex(sj => (sj.jobid || sj.jobId || sj.id || sj._id) === jobUUID);

    if (index === -1) {
      // Add job
      user.savedJobs.unshift(job);
      await user.save();
      res.json({ success: true, message: "Job saved", savedJobs: user.savedJobs });
    } else {
      // Remove job
      user.savedJobs.splice(index, 1);
      await user.save();
      res.json({ success: true, message: "Job removed", savedJobs: user.savedJobs });
    }
  } catch (err) {
    console.error("Error toggling saved job:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Get all saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const query = resolveUserQuery(req.params.userId || req.user?.id);
    if (!query) return res.status(400).json({ error: "Missing or invalid user ID" });

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: "User not found" });

    const savedJobs = user.savedJobs || [];
    const enrichedJobs = await enrichJobsWithCompanyInfo(savedJobs);

    res.json({ savedJobs: enrichedJobs });
  } catch (err) {
    console.error("Error fetching saved jobs:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Update user preferences (Job Titles and Locations)
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "Missing user ID" });

    const { preferredJobTitles, preferredLocations } = req.body;
    const updateData = {};

    if (preferredJobTitles !== undefined) updateData.preferredJobTitles = preferredJobTitles;
    if (preferredLocations !== undefined) {
      // Enforce max 6 locations
      updateData.preferredLocations = preferredLocations.slice(0, 6);
    }

    const query = resolveUserQuery(userId);
    if (!query) return res.status(400).json({ error: "Invalid user identity" });

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Server error updating preferences" });
  }
};

module.exports = {

  updateSocialLinks,
  updateClientData,
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
  renameSession,
  renameSavedSearch,
  toggleSavedJob,
  getSavedJobs,
  updatePreferences,
};


