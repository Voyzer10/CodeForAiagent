"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#0a110a] py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12 text-left">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#00FA92]">smart_toy</span>
                            <span className="text-xl font-bold text-white tracking-tight">JobScraper AI</span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-xs mb-6">
                            Empowering professionals to navigate the job market with the speed and intelligence of artificial intelligence.
                        </p>
                        <div className="flex gap-4">
                            {['share', 'rss_feed', 'language'].map((icon, idx) => (
                                <a key={idx} className="text-gray-400 hover:text-[#00FA92] transition-colors" href="#">
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/about" className="hover:text-[#00FA92] transition-colors text-gray-400">Features</Link></li>
                            <li><Link href="/price" className="hover:text-[#00FA92] transition-colors text-gray-400">Pricing</Link></li>
                            <li><a className="hover:text-[#00FA92] transition-colors text-gray-400" href="#">Integrations</a></li>
                            <li><a className="hover:text-[#00FA92] transition-colors text-gray-400" href="#">Changelog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/about" className="hover:text-[#00FA92] transition-colors text-gray-400">About Us</Link></li>
                            <li><a className="hover:text-[#00FA92] transition-colors text-gray-400" href="#">Careers</a></li>
                            <li><a className="hover:text-[#00FA92] transition-colors text-gray-400" href="#">Blog</a></li>
                            <li><Link href="/contact" className="hover:text-[#00FA92] transition-colors text-gray-400">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a className="hover:text-[#00FA92] transition-colors text-gray-400" href="#">Help Center</a></li>
                            <li><a className="hover:text-[#00FA92] transition-colors text-gray-400" href="#">Terms of Service</a></li>
                            <li><a className="hover:text-[#00FA92] transition-colors text-gray-400" href="#">Privacy Policy</a></li>
                            <li><a className="hover:text-[#00FA92] transition-colors text-gray-400" href="#">Status</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">© 2025 JobScraper AI. All rights reserved.</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="h-2 w-2 rounded-full bg-[#00FA92] animate-pulse"></span>
                        Powered by intelligent automation
                    </div>
                </div>
            </div>
        </footer>
    );
}

