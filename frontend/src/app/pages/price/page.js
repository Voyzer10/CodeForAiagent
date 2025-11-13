"use client";
import { useState, useEffect } from "react";

export default function Price() {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [usdRate, setUsdRate] = useState(83); // default fallback INR/USD
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

    // ⭐ Load USD Rate from external API
    const getUsdRate = async () => {
        try {
            const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
            const data = await res.json();
            setUsdRate(data.rates.INR);
        } catch (e) {
            console.log("Failed to fetch USD rate, using fallback");
        }
    };

    useEffect(() => {
        getUsdRate();

        if (!window.Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            document.body.appendChild(script);
        }
    }, []);

    // ⭐ Payment Function
    const handlePayment = async (plan) => {
        setSelectedPlan(plan.name);
        setPaymentStatus(null);

        try {
            // Convert USD → INR → paise
            const convertedAmount = Math.round(plan.price * usdRate * 100);

            // Create Razorpay order
            const res = await fetch(`${API_BASE_URL}/api/payment/order`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: convertedAmount }),
            });

            const order = await res.json();
            if (!res.ok || !order.id) {
                throw new Error("Order creation failed");
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: convertedAmount,
                currency: "INR",
                name: "LinkedIn Job Scraper",
                description: `${plan.name} Plan`,
                order_id: order.id,

                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
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
                            alert(`Payment successful for ${plan.name}`);

                            setTimeout(() => {
                                window.location.href = "/pages/userpanel";
                            }, 800);
                        } else {
                            setPaymentStatus("failed");
                            alert("Payment Verification Failed");
                        }
                    } catch (e) {
                        setPaymentStatus("failed");
                        alert("Error verifying payment");
                    }
                },

                theme: { color: "#00ff9d" },
            };

            const razor = new window.Razorpay(options);
            razor.open();
        } catch (err) {
            console.error(err);
            setPaymentStatus("failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col items-center px-6 py-14">
            <h1 className="text-4xl font-extrabold mb-4">
                Choose Your <span className="text-[#00ff9d]">Plan</span>
            </h1>

            <p className="text-gray-400 mb-10">
                Select a plan and securely pay with Razorpay.
            </p>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className="bg-[#111827] border border-[#1b2b27] rounded-2xl p-8 hover:scale-105 transition shadow-[0_0_20px_#00ff9d22]"
                    >
                        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

                        {/* ⭐ Description Fix */}
                        <p className="text-gray-400 mb-6">{plan.description}</p>

                        {/* USD Price Display */}
                        <p className="text-4xl font-bold mb-2">${plan.price}</p>
                        <p className="text-gray-400 mb-6">/ month</p>

                        <p className="text-[#00ff9d] font-medium mb-4">
                            {plan.cards} Career Cards
                        </p>

                        {/* ⭐ Features section added */}
                        <ul className="text-gray-400 space-y-2 mb-6">
                            {plan.features.map((f) => (
                                <li key={f}>✓ {f}</li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handlePayment(plan)}
                            className="w-full py-3 bg-[#00ff9d] text-black font-semibold rounded-xl hover:bg-[#00e68a]"
                        >
                            {selectedPlan === plan.name ? "Processing..." : "Get Started"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
