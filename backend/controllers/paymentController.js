const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../model/User");

// ✅ Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// 🧩 1. Check user plan
const checkPlan = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.id });

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Only active, non-null plan counts as payment
    if (!user.plan || !user.plan.type || user.plan.expiresAt < Date.now()) {
      console.log("⚠️ No active plan for userId:", user.userId);
      return res.json({ hasPlan: false });
    }

    console.log("✅ Payment successful for userId:", user.userId, "Plan:", user.plan.type);
    res.json({
      hasPlan: true,
      plan: user.plan.type,
      remainingJobs: user.plan.remainingJobs,
    });
  } catch (err) {
    console.error("🔥 Error in checkPlan:", err.message);
    res.status(500).json({ message: "Error checking plan", error: err.message });
  }
};




// 💳 2. Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { planType } = req.body;

    const planPrices = {
      starter: 1100, // ₹11
      professional: 1900, // ₹19
      premium: 2500, // ₹25
    };

    const amount = planPrices[planType];
    if (!amount) return res.status(400).json({ message: "Invalid plan type" });

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error creating Razorpay order", error: err.message });
  }
};

// 🔐 3. Verify payment and activate plan
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign)
      return res.status(400).json({ success: false, message: "Invalid signature" });

    // Define plan limits
    const planLimits = {
      starter: 500,
      professional: 1000,
      premium: 1500,
    };

    // Update user plan
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        plan: {
          type: planType,
          remainingJobs: planLimits[planType],
          purchasedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error verifying payment", error: err.message });
  }
};

module.exports = {
  checkPlan,
  createOrder,
  verifyPayment,
};
