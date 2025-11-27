"use client";
import { useEffect, useState } from "react";
import UserNavbar from "../userpanel/Navbar";
import Sidebar from "../userpanel/Sidebar";

export default function Price() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [usdRate, setUsdRate] = useState(null); // live USD -> INR rate
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // your API base (keep as you currently have it)
  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
  while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

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

  // Fetch live USD -> INR rate (used only for displaying an estimated INR value)
  useEffect(() => {
    let mounted = true;
    const fetchRate = async () => {
      try {
        // reliable free endpoint; replace if you have a paid key
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (!mounted) return;
        if (data && data.rates && typeof data.rates.INR === "number") {
          setUsdRate(data.rates.INR);
        } else {
          // fallback if unexpected response
          setUsdRate(83);
        }
      } catch (e) {
        console.warn("Failed to fetch USD rate, using fallback 83", e);
        if (mounted) setUsdRate(83);
      }
    };
    fetchRate();
    return () => {
      mounted = false;
    };
  }, []);

  // Load Razorpay script once
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay script loaded");
      document.body.appendChild(script);
    }
  }, []);

  // Helper: show estimated INR for UI (rounded)
  const estimatedINR = (usd) => {
    if (!usdRate) return "…";
    return Math.round(usd * usdRate);
  };

  // Payment flow:
  // 1) Send { planType } to backend (this is what backend expects)
  // 2) Backend returns order (with order.amount in paise and order.id)
  // 3) Open Razorpay with backend-provided order.amount & order.id
  const handlePayment = async (plan) => {
    setSelectedPlan(plan.name);
    setPaymentStatus(null);
    setLoadingOrder(true);

    try {
      // 1) Request order creation from backend — send planType only (backend calculates actual amount)
      const res = await fetch(`${API_BASE_URL}/payment/order`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: plan.name.toLowerCase() }),
      });

      const order = await res.json();
      if (!res.ok) {
        // backend returns 400/422 with a message; bubble it up
        const errMsg = (order && (order.message || order.error)) || "Order creation failed";
        throw new Error(errMsg);
      }

      if (!order || !order.id || !order.amount) {
        throw new Error("Invalid order returned from server");
      }

      // 2) Build Razorpay options using backend order (so Razorpay shows exact amount server decided)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount, // should be in paise (INR) as returned by backend
        currency: order.currency || "INR",
        name: "LinkedIn Job Scraper",
        description: `${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response) {
          // Called when payment succeeds in Razorpay UI
          try {
            // Verify payment with backend
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

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setPaymentStatus("success");
              alert(`🎉 Payment successful for ${plan.name}!`);
              // redirect to userpanel (your app uses /pages/userpanel)
              setTimeout(() => (window.location.href = "/pages/userpanel"), 900);
            } else {
              setPaymentStatus("failed");
              alert("⚠️ Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Error verifying payment:", err);
            setPaymentStatus("failed");
            alert("❌ Error verifying payment.");
          }
        },
        modal: {
          // Keep checkout behavior friendly
          ondismiss: function () {
            // user closed the payment modal
            setPaymentStatus(null);
            setSelectedPlan(null);
          },
        },
        theme: { color: "#00ff9d" },
      };

      // 3) Open checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStatus("failed");
      // helpful user message
      alert(`Payment Error: ${err.message || "Order creation failed"}`);
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col items-center px-6 py-14">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />
      <h1 className="text-4xl font-extrabold mb-4 mt-28">
        Choose Your <span className="text-[#00ff9d]">Plan</span>
      </h1>

      <p className="text-gray-400 mb-6">
        Select a plan and securely pay with Razorpay. (UI shows USD; checkout charges INR)
      </p>

      {/* Payment statuses */}
      {paymentStatus === "success" && (
        <div className="bg-green-900/30 border border-green-500 text-green-400 px-6 py-4 rounded-xl mb-6">
          🎉 Payment successful! You’ve unlocked the {selectedPlan} plan.
        </div>
      )}
      {paymentStatus === "failed" && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 px-6 py-4 rounded-xl mb-6">
          ❌ Payment failed. Please try again or contact support.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {plans.map((plan) => {
          const estINR = usdRate ? estimatedINR(plan.price) : "…";
          return (
            <div
              key={plan.name}
              className={`bg-[#111827] border ${selectedPlan === plan.name ? "border-[#00ff9d]" : "border-[#1b2b27]"
                } rounded-2xl p-8 shadow-[0_0_20px_#00ff9d22] hover:scale-105 transition`}
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

              {/* description (you asked to show it) */}
              <p className="text-gray-400 mb-4">{plan.description}</p>

              {/* USD price display (unchanged) */}
              <p className="text-4xl font-bold mb-1">${plan.price}</p>
              {/* show estimated INR alongside */}
              <p className="text-gray-400 mb-4">
                ≈ {usdRate ? `₹${estINR}` : "₹…"} (estimated at current rate)
              </p>

              <p className="text-[#00ff9d] font-medium mb-4">{plan.cards} Career Cards</p>

              {/* features */}
              <ul className="text-gray-400 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={loadingOrder}
                className="w-full py-3 bg-[#00ff9d] text-black font-semibold rounded-xl hover:bg-[#00e68a] transition disabled:opacity-60"
              >
                {loadingOrder && selectedPlan === plan.name ? "Processing..." : "Get Started"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-14 text-sm text-gray-400 max-w-2xl text-center">
        <p>
          Prices are shown in USD for clarity. Final charge is processed in INR at checkout using the
          amount returned by the server (based on current conversion or your server&apos;s pricing logic).
        </p>
      </div>
    </div>
  );
}
