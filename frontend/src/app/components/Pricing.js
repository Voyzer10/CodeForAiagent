"use client";

import React from "react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$11",
      features: ["100 Daily Scrapes", "Basic Filtering", "Email Support"],
      popular: false,
    },
    {
      name: "Professional",
      price: "$19",
      features: [
        "Unlimited Scrapes",
        "Advanced AI Matching",
        "Priority Alerts",
        "Resume Optimization",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$25",
      features: ["Everything in Pro", "API Access", "24/7 Dedicated Support"],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#121e12]/30 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl text-white">Choose Your Success Plan</h2>
          <p className="mt-4 text-gray-400">Scale your job search automation to match your ambition</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${plan.popular
                  ? "border-[#00FA92] bg-[#0a110a] shadow-[0_0_30px_rgba(0,250,146,0.1)] md:-translate-y-4"
                  : "border-white/10 bg-[#0a110a]/50"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00FA92] text-[#0a110a] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <h3 className={`text-xl font-medium ${plan.popular ? "text-[#00FA92]" : "text-gray-300"}`}>
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="material-symbols-outlined text-[#00FA92] text-lg">check</span>
                    <span className={plan.popular ? "text-white" : "text-gray-400"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-bold transition-all ${plan.popular
                    ? "bg-[#00FA92] text-[#0a110a] shadow-lg shadow-[#00FA92]/20 hover:bg-white"
                    : "border border-white/20 text-white hover:bg-white hover:text-black"
                  }`}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : plan.popular ? "Start Free Trial" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
