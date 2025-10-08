const express = require('express');
const{ checkPlan, createOrder, verifyPayment } = require('../controllers/paymentController')
const auth = require('../middleware/authMiddleware')  

const router = express.Router();

// check user’s active plan
router.get("/check", auth, checkPlan);

// create razorpay order
router.post("/order", auth, createOrder);

// verify razorpay payment
router.post("/verify", auth, verifyPayment);

module.exports = router;
