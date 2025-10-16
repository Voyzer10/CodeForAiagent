const User = require('../model/User');

// 🟢 Get user's custom categories
const getUserCategories = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params.userId;
    const user = await User.findOne({ userId });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ categories: user.customCategories || [] });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Add a new category
const addUserCategory = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params.userId;
    const { category } = req.body;

    if (!category) return res.status(400).json({ error: "Category required" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.customCategories.includes(category)) {
      user.customCategories.push(category);
      await user.save();
    }

    res.json({ success: true, categories: user.customCategories });
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getUserCategories, addUserCategory };
