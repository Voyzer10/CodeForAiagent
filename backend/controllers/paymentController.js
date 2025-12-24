const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../model/User");
const axios = require("axios");

let razorpayInstance = null;

/* =====================================================
   🧠 Lazy Razorpay Initialization (SAFE)
   ===================================================== */
function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay environment variables missing");
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
}

/* =====================================================
   🧩 1️⃣ Check User’s Active Plan
   ===================================================== */
const checkPlan = async (req, res) => {
  try {
    console.log("🟢 /check called by user:", req.user?.id);

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.plan || user.plan.expiresAt < Date.now()) {
      return res.json({ hasPlan: false });
    }

    res.json({
      hasPlan: true,
      plan: user.plan.type,
      remainingJobs: user.plan.remainingJobs,
    });
  } catch (err) {
    console.error("🔥 checkPlan error:", err);
    res.status(500).json({ message: "Error checking plan" });
  }
};

/* =====================================================
   💳 2️⃣ Create Razorpay Order
   ===================================================== */
const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const { planType } = req.body;

    const pricesUSD = {
      starter: 11,
      professional: 19,
      premium: 25,
    };

    const usdAmount = pricesUSD[planType];
    if (!usdAmount) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    let usdToInr = 83; // fallback

    try {
      const rateRes = await axios.get("https://open.er-api.com/v6/latest/USD");
      usdToInr = rateRes.data?.rates?.INR || usdToInr;
    } catch {
      console.warn("⚠️ Exchange rate API failed, using fallback");
    }

    const amountInPaise = Math.round(usdAmount * usdToInr * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error("🔥 createOrder error:", err);
    res.status(500).json({ message: "Error creating order" });
  }
};

/* =====================================================
   🔐 3️⃣ Verify Payment & Activate Plan
   ===================================================== */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secretKey = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY;
    const expectedSign = crypto
      .createHmac("sha256", secretKey)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const planLimits = {
      starter: 500,
      professional: 1000,
      premium: 1500,
    };

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
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("🔥 verifyPayment error:", err);
    res.status(500).json({ message: "Error verifying payment" });
  }
};

module.exports = { checkPlan, createOrder, verifyPayment };
