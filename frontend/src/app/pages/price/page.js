"use client";
import { useState } from "react";

export default function Price() {
    const [selectedPlan, setSelectedPlan] = useState(null);

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

    // Razorpay Payment Handler
    const handlePayment = async (plan) => {
        setSelectedPlan(plan.name);

        try {
            // 1️⃣ Create order on backend
            const res = await fetch("http://localhost:5000/api/payment/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // send cookies for auth
                body: JSON.stringify({ planType: plan.name.toLowerCase() }),
            });

            const order = await res.json();
            if (!order.id) throw new Error("Order creation failed");

            // 2️⃣ Configure Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "LinkedIn Job Scraper",
                description: `${plan.name} Plan`,
                order_id: order.id,
                handler: async function (response) {
                    try {

                        console.log("🟢 Sending payment verification request...", {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            planType: plan.name.toLowerCase(),
                        });
                        // 3️⃣ Verify payment on backend
                        const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planType: plan.name.toLowerCase(),
                            }),
                        });
                        console.log("📤 Request sent, waiting for response...");
                        const data = await verifyRes.json();
                        console.log("📥 Verification response received:", data);
                        if (verifyRes.ok && data.success) {
                            alert(`✅ Payment Successful for ${plan.name}!`);
                            window.location.reload(); // refresh user panel
                        } else {
                            console.warn("⚠️ Payment verification failed:", data);
                            alert("⚠️ Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        console.error("Error verifying payment:", err);
                        alert("❌ Payment verification failed.");
                    }
                },
                prefill: {
                    name: "Your Name",
                    email: "user@example.com",
                },
                theme: {
                    color: "#00ff9d",
                },
            };

            const razor = new window.Razorpay(options);
            razor.open();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Failed to start payment. Please try again.");
        }
    };

    // Ensure Razorpay script is loaded
    const loadRazorpay = () => {
        if (!window.Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => console.log("Razorpay script loaded");
            document.body.appendChild(script);
        }
    };

    // Load script once
    if (typeof window !== "undefined") loadRazorpay();

    return (
        <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col items-center px-6 py-12">
            {/* Header */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4">
                Choose Your <span className="text-[#00ff9d]">Plan</span>
            </h1>
            <p className="text-gray-400 text-center max-w-2xl mb-12">
                Select a plan and securely pay with Razorpay.
            </p>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`bg-[#111827] border ${selectedPlan === plan.name
                            ? "border-[#00ff9d]"
                            : "border-[#1b2b27]"
                            } rounded-2xl p-8 shadow-[0_0_20px_#00ff9d22] hover:scale-105 transition`}
                    >
                        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                        <p className="text-gray-400 mb-6">{plan.description}</p>
                        <p className="text-4xl font-bold mb-2">${plan.price}</p>
                        <p className="text-gray-400 mb-6">/ month</p>
                        <p className="text-[#00ff9d] font-medium mb-4">
                            {plan.cards} Career Cards
                        </p>
                        <ul className="text-gray-400 space-y-2 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature}>✓ {feature}</li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handlePayment(plan)}
                            className="w-full py-3 bg-[#00ff9d] text-black font-semibold rounded-xl hover:bg-[#00e68a] transition"
                        >
                            {selectedPlan === plan.name ? "Processing..." : "Get Started"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="bg-[#111827] border border-[#1b2b27] rounded-xl p-6 mt-16 max-w-3xl text-center shadow-[0_0_15px_#00ff9d33]">
                <h4 className="text-[#00ff9d] font-medium mb-2">
                    💡 What are Career Cards?
                </h4>
                <p className="text-gray-400 text-sm">
                    1 Career Card = 1 Job Application using our AI-powered LinkedIn Job
                    Scraper. Each represents a fully automated job application with
                    personalized content and optimization to increase your success rate.
                </p>
            </div>

            {/* CTA */}
            <div className="mt-20 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                    Start automating your LinkedIn job applications{" "}
                    <span className="text-[#00ff9d]">today</span>
                </h2>
                <p className="text-gray-400 mb-8">
                    Join thousands of professionals who have accelerated their careers
                    with our AI-powered platform.
                </p>
            </div>

            {/* Footer */}
            <footer className="mt-16 border-t border-[#1b2b27] pt-6 text-center text-gray-500 text-sm">
                © 2024 LinkedIn Job Scraper. All rights reserved.
            </footer>
        </div>
    );
}
