const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../model/User");

// ✅ Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// 🧩 1️⃣ Check User’s Active Plan
const checkPlan = async (req, res) => {
  try {
    console.log("🟢 /check called by user:", req.user?.id);

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      console.warn("⚠️ User not found:", req.user?.id);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.plan || !user.plan.type || user.plan.expiresAt < Date.now()) {
      console.log("⚠️ No active plan for userId:", user.userId);
      return res.json({ hasPlan: false });
    }

    console.log("✅ Active plan found:", user.plan);
    res.json({
      hasPlan: true,
      plan: user.plan.type,
      remainingJobs: user.plan.remainingJobs,
    });
  } catch (err) {
    console.error("🔥 Error in checkPlan:", err);
    res.status(500).json({ message: "Error checking plan", error: err.message });
  }
};

// 💳 2️⃣ Create Razorpay Order with USD→INR conversion
const createOrder = async (req, res) => {
  try {
    console.log("🟢 /order hit");
    const { planType } = req.body;

    if (!planType) return res.status(400).json({ message: "planType is required" });

    // USD prices (same as frontend)
    const usdPrices = {
      starter: 11,
      professional: 19,
      premium: 25,
    };

    const usdAmount = usdPrices[planType];
    if (!usdAmount) return res.status(400).json({ message: "Invalid plan type" });

    // Fetch live USD→INR rate
    const rateRes = await fetch("https://open.er-api.com/v6/latest/USD");
    const rateJson = await rateRes.json();
    const usdToInr = rateJson?.rates?.INR || 83; // fallback

    const finalInr = Math.round(usdAmount * usdToInr); // INR
    const amountInPaise = finalInr * 100;

    console.log(`💰 USD=${usdAmount}, Rate=${usdToInr}, INR=${finalInr}, Paise=${amountInPaise}`);

    const order = await razorpay.orders.create({
      amount: amountInPaise,  // Razorpay amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error("🔥 Error creating Razorpay order:", err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
};


// 🔐 3️⃣ Verify Payment (with signature & plan activation)
const verifyPayment = async (req, res) => {
  try {
    console.log("🟢 /verify hit");
    console.log("📦 Incoming verify payload:", req.body);
    console.log("👤 Auth user:", req.user);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn("⚠️ Missing Razorpay fields in request body");
      return res.status(400).json({ success: false, message: "Missing payment data" });
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    console.log("🔑 Expected signature:", expectedSign);
    console.log("📜 Provided signature:", razorpay_signature);

    if (razorpay_signature !== expectedSign) {
      console.warn("❌ Signature mismatch!");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const planLimits = {
      starter: 500,
      professional: 1000,
      premium: 1500,
    };

    console.log("💾 Updating plan for userId:", req.user.id);

    const updatedUser = await User.findOneAndUpdate(
      { userId: req.user.id },
      {
        plan: {
          type: planType,
          remainingJobs: planLimits[planType],
          purchasedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.warn("⚠️ User not found while updating plan:", req.user.id);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("✅ Payment verified and plan activated:", updatedUser.plan);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("🔥 Error verifying payment:", err);
    res.status(500).json({ message: "Error verifying payment", error: err.message });
  }
};

module.exports = { checkPlan, createOrder, verifyPayment };
