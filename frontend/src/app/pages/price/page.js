"use client";
import { useState, useEffect } from "react";

export default function Price() {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [usdRate, setUsdRate] = useState(1); // Live USD conversion

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const plans = [
        {
            name: "STARTER",
            price: 11,
            cards: 500,
            description: "Perfect for beginners",
            features: [
                "100 AI-powered job applications",
                "LinkedIn profile optimization",
                "Basic analytics dashboard",
                "Email support",
            ],
        },
        {
            name: "PROFESSIONAL",
            price: 19,
            cards: 1000,
            description: "Most popular choice",
            features: [
                "1000 AI-powered job applications",
                "Advanced profile optimization",
                "Detailed analytics & insights",
                "Access to cover letter templates",
            ],
        },
        {
            name: "PREMIUM",
            price: 25,
            cards: 1500,
            description: "Maximum power & features",
            features: [
                "1500 AI-powered job applications",
                "Premium optimization & reports",
                "Advanced analytics & targeting",
                "Personalized career support",
            ],
        },
    ];

    // -----------------------------
    // 🌍 Fetch Live USD Rate
    // -----------------------------
    useEffect(() => {
        fetch("https://open.er-api.com/v6/latest/USD")
            .then((res) => res.json())
            .then((data) => setUsdRate(data.rates.INR || 83)) // fallback INR
            .catch(() => setUsdRate(83));
    }, []);

    // Razorpay Script
    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => console.log("Razorpay script loaded");
            document.body.appendChild(script);
        }
    }, []);

    // -----------------------------
    // 💳 Payment Handler
    // -----------------------------
    const handlePayment = async (plan) => {
        setSelectedPlan(plan.name);
        setPaymentStatus(null);

        try {
            // Convert USD → INR → paise for razorpay
            const convertedAmount = Math.round(plan.price * usdRate * 100);

            // 1️⃣ Create Razorpay Order
            const res = await fetch(`${API_BASE_URL}/payment/order`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planType: plan.name.toLowerCase(),
                    amount: convertedAmount,
                }),
            });

            if (!res.ok) throw new Error("Order creation failed");
            const order = await res.json();

            // 2️⃣ Razorpay Config
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "LinkedIn Job Scraper",
                description: `${plan.name} Plan`,
                order_id: order.id,

                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planType: plan.name.toLowerCase(),
                            }),
                        });

                        const data = await verifyRes.json();
                        if (verifyRes.ok && data.success) {
                            setPaymentStatus("success");
                            alert(`Payment Successful for ${plan.name}!`);

                            setTimeout(() => {
                                window.location.href = "/pages/userpanel";
                            }, 1000);
                        } else {
                            throw new Error("Verification failed");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        setPaymentStatus("failed");
                        alert("Payment verification failed.");
                    }
                },

                theme: { color: "#00ff9d" },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (err) {
            console.error("Payment error:", err);
            setPaymentStatus("failed");
            alert("Payment failed, try again.");
        }
    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col items-center px-6 py-14">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4">
                Choose Your <span className="text-[#00ff9d]">Plan</span>
            </h1>

            <p className="text-gray-400 text-center max-w-2xl mb-12">
                Select a plan and securely pay with Razorpay.
            </p>

            {paymentStatus === "success" && (
                <div className="bg-green-900/30 border border-green-500 text-green-400 px-6 py-4 rounded-xl mb-6">
                    🎉 Payment Successful! You purchased {selectedPlan}.
                </div>
            )}

            {paymentStatus === "failed" && (
                <div className="bg-red-900/30 border border-red-500 text-red-400 px-6 py-4 rounded-xl mb-6">
                    ❌ Payment failed. Please try again.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`bg-[#111827] border ${
                            selectedPlan === plan.name ? "border-[#00ff9d]" : "border-[#1b2b27]"
                        } rounded-2xl p-8 shadow-[0_0_20px_#00ff9d22] hover:scale-105 transition`}
                    >
                        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                        <p className="text-gray-400 mb-6">{plan.description}</p>

                        {/* 🔥 SHOW USD PRICE EXACTLY */}
                        <p className="text-4xl font-bold mb-2">${plan.price}</p>
                        <p className="text-gray-400 mb-6">/ month</p>

                        <p className="text-[#00ff9d] font-medium mb-4">
                            {plan.cards} Career Cards
                        </p>

                        <button
                            onClick={() => handlePayment(plan)}
                            className="w-full py-3 bg-[#00ff9d] text-black font-semibold rounded-xl hover:bg-[#00e68a] transition"
                        >
                            {selectedPlan === plan.name ? "Processing..." : "Get Started"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
