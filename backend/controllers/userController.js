const User = require("../model/User");


const updateSocialLinks = async (req, res) => {
  try {
    // 1️⃣ Identify user correctly
    const userId = req.params.userId || req.user?.id;
    if (!userId) return res.status(400).json({ error: "Missing user ID" });

    // 2️⃣ Determine lookup field dynamically
    // If your User model has a numeric "userId" field → use that.
    // Otherwise, use MongoDB's _id field.
    const query = isNaN(userId) 
      ? { _id: userId } 
      : { userId: Number(userId) };

    const user = await User.findOne(query);
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

// 🟢 Get user's custom categories
const getUserCategories = async (req, res) => {
  try {
    const userId = Number(req.params.userId) || req.user?.id;
    if (!userId) return res.status(400).json({ error: "Missing user ID" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ categories: user.customCategories || [] });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Add a new custom category
const addUserCategory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { category } = req.body;

    if (!userId) return res.status(400).json({ error: "Missing user ID" });
    if (!category) return res.status(400).json({ error: "Category required" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.customCategories = user.customCategories || [];

    const exists = user.customCategories.some(
      (c) => c.toLowerCase() === category.toLowerCase()
    );

    if (!exists) {
      user.customCategories.push(category);
      await user.save();
    }

    res.json({ success: true, categories: user.customCategories });
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Get all saved searches
const getSavedSearches = async (req, res) => {
  try {
    const userId = Number(req.params.userId) || req.user?.id;
    if (!userId) return res.status(400).json({ error: "Missing user ID" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ savedSearches: user.savedSearches || [] });
  } catch (err) {
    console.error("Error fetching saved searches:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Save a new search
const saveSearch = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, jobs } = req.body;

    if (!userId) return res.status(400).json({ error: "Missing user ID" });
    if (!name) return res.status(400).json({ error: "Search name required" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newSearch = { name, jobs, createdAt: new Date() };
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
    const userId = req.user?.id;
    const { name } = req.params;

    if (!userId) return res.status(400).json({ error: "Missing user ID" });

    const user = await User.findOne({ userId });
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

module.exports = {

  updateSocialLinks,
  getUserCategories,
  addUserCategory,
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
};
