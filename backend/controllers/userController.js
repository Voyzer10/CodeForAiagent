const User = require("../model/User");
const mongoose = require("mongoose");
const { resolveUserQuery } = require("../utils/userResolver");

/* ======================================================
   Helper: Enrich jobs with company info
====================================================== */
const enrichJobsWithCompanyInfo = async (jobs) => {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];

  const companyIds = [
    ...new Set(
      jobs
        .map(j => j.CompanyID || (j.company && j.company.CompanyID))
        .filter(Boolean)
    )
  ];

  if (!companyIds.length) return jobs;

  const companies = await mongoose.connection.db
    .collection("Company-Information")
    .find({ CompanyID: { $in: companyIds } })
    .toArray();

  const companyMap = companies.reduce((acc, c) => {
    acc[c.CompanyID] = {
      name: c.Comp_Name,
      logo: c.logo
    };
    return acc;
  }, {});

  return jobs.map(j => ({
    ...j,
    company:
      companyMap[j.CompanyID || (j.company && j.company.CompanyID)] ||
      j.company ||
      null
  }));
};

/* ======================================================
   Update social links
====================================================== */
const updateSocialLinks = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = resolveUserQuery(req.user.id);
    if (!query) {
      return res.status(400).json({ error: "Invalid user identity" });
    }

    const { github, linkedin } = req.body;
    const updateData = {};
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Social links updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Update socials error:", err);
    res.status(500).json({ error: "Server error updating socials" });
  }
};

/* ======================================================
   Update client credentials
====================================================== */
const updateClientData = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: "Both fields required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { clientId, clientSecret },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Client data saved", user: updatedUser });
  } catch (err) {
    console.error("Update client data error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Get saved searches
====================================================== */
const getSavedSearches = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rawUserId =
      req.params.userId === "me"
        ? req.user.id
        : req.params.userId ?? req.user.id;

    const query = resolveUserQuery(rawUserId);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // 🛡️ IDOR protection (numeric + ObjectId safe)
    if (
      query.userId !== undefined &&
      Number(query.userId) !== Number(req.user.id)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (
      query._id !== undefined &&
      String(query._id) !== String(req.user._id)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await User.findOne(query).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedSearches = Array.isArray(user.savedSearches)
      ? user.savedSearches
      : [];

    const enrichedSearches = await Promise.all(
      savedSearches.map(async s => ({
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

/* ======================================================
   Save a search
====================================================== */
const saveSearch = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, jobs, runId, sessionId } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Search name required" });
    }

    const query = resolveUserQuery(req.user.id);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newSearch = {
      name,
      jobs,
      runId: runId || sessionId,
      createdAt: new Date()
    };

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

/* ======================================================
   Delete saved search
====================================================== */
const deleteSavedSearch = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = resolveUserQuery(req.user.id);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.savedSearches = (user.savedSearches || []).filter(
      s => s.name !== req.params.name
    );

    await user.save();
    res.json({ success: true, savedSearches: user.savedSearches });
  } catch (err) {
    console.error("Error deleting saved search:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Rename session
====================================================== */
const renameSession = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { sessionId, newName } = req.body;
    if (!sessionId || !newName) {
      return res.status(400).json({ error: "Session ID and new name required" });
    }

    const query = resolveUserQuery(req.user.id);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const session = user.plan?.history?.find(h => h.sessionId === sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.sessionName = newName;
    await user.save();

    res.json({ success: true, message: "Session renamed", history: user.plan.history });
  } catch (err) {
    console.error("Error renaming session:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Rename saved search
====================================================== */
const renameSavedSearch = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { newName } = req.body;
    if (!newName) {
      return res.status(400).json({ error: "New name required" });
    }

    const query = resolveUserQuery(req.user.id);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const search = (user.savedSearches || []).find(
      s => s.name === req.params.name
    );
    if (!search) {
      return res.status(404).json({ error: "Saved search not found" });
    }

    search.name = newName;
    await user.save();

    res.json({ success: true, savedSearches: user.savedSearches });
  } catch (err) {
    console.error("Error renaming saved search:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Toggle saved job
====================================================== */
const toggleSavedJob = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { job } = req.body;
    if (!job) {
      return res.status(400).json({ error: "Job object required" });
    }

    const query = resolveUserQuery(req.user.id);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const jobUUID = job.jobid || job.jobId || job.id || job._id;
    if (!jobUUID) {
      return res.status(400).json({ error: "Job ID missing" });
    }

    user.savedJobs = user.savedJobs || [];
    const index = user.savedJobs.findIndex(
      sj => (sj.jobid || sj.jobId || sj.id || sj._id) === jobUUID
    );

    if (index === -1) {
      user.savedJobs.unshift(job);
    } else {
      user.savedJobs.splice(index, 1);
    }

    await user.save();
    res.json({ success: true, savedJobs: user.savedJobs });
  } catch (err) {
    console.error("Error toggling saved job:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Get saved jobs
====================================================== */
const getSavedJobs = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = resolveUserQuery(req.user.id);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const enrichedJobs = await enrichJobsWithCompanyInfo(user.savedJobs || []);
    res.json({ savedJobs: enrichedJobs });
  } catch (err) {
    console.error("Error fetching saved jobs:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Update preferences
====================================================== */
const updatePreferences = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { preferredJobTitles, preferredLocations } = req.body;
    const updateData = {};

    if (preferredJobTitles !== undefined) {
      updateData.preferredJobTitles = preferredJobTitles;
    }

    if (preferredLocations !== undefined) {
      updateData.preferredLocations = preferredLocations.slice(0, 6);
    }

    const query = resolveUserQuery(req.user.id);
    if (!query) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Preferences updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Update preferences error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Update Profile (Name/Theme)
====================================================== */
const updateProfile = async (req, res) => {
  try {
    const { name, theme } = req.body;
    const query = resolveUserQuery(req.user.id);
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (theme !== undefined) updateData.theme = theme;

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Submit Support Ticket
====================================================== */
const submitSupportTicket = async (req, res) => {
  try {
    const { subject, category, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and message are required" });
    }

    const query = resolveUserQuery(req.user.id);
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: "User not found" });

    const SupportTicket = require("../model/SupportTicket");
    const ticket = await SupportTicket.create({
      userId: user.userId,
      name: user.name,
      email: user.email,
      subject,
      category,
      message
    });

    res.json({ success: true, message: "Ticket submitted successfully", ticketId: ticket._id });
  } catch (err) {
    console.error("Support ticket error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Resume Management
====================================================== */
const updateResume = async (req, res) => {
  try {
    const { url, filename, size } = req.body;
    if (!url) return res.status(400).json({ error: "Resume URL is required" });

    const query = resolveUserQuery(req.user.id);
    const updatedUser = await User.findOneAndUpdate(
      query,
      {
        $set: {
          resume: {
            url,
            filename,
            size,
            uploadDate: new Date()
          }
        }
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: "Resume synchronized", user: updatedUser });
  } catch (err) {
    console.error("Update resume error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const removeResume = async (req, res) => {
  try {
    const query = resolveUserQuery(req.user.id);
    const updatedUser = await User.findOneAndUpdate(
      query,
      {
        $set: {
          resume: { url: null, filename: null, size: null, uploadDate: null }
        }
      },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Resume detached", user: updatedUser });
  } catch (err) {
    console.error("Remove resume error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Exports
====================================================== */
const disconnectGmail = async (req, res) => {
  try {
    const query = resolveUserQuery(req.user.id);
    await User.findOneAndUpdate(query, {
      $set: {
        gmailEmail: null,
        gmailAccessToken: null,
        gmailRefreshToken: null,
        gmailTokenExpiry: null,
        clientId: null,
        clientSecret: null
      }
    });
    res.json({ success: true, message: "Gmail disconnected" });
  } catch (err) {
    console.error("Disconnect Gmail error:", err);
    res.status(500).json({ error: "Server error" });
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
  updateProfile,
  submitSupportTicket,
  updateResume,
  removeResume,
  disconnectGmail,
};
