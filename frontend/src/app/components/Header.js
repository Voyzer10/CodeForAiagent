"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[rgba(18,30,18,0.6)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00FA92]/10 text-[#00FA92] group-hover:bg-[#00FA92] group-hover:text-black transition-all">
              <span className="material-symbols-outlined text-3xl">smart_toy</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">JobScraper AI</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-[#00FA92] transition-colors">Product</Link>
            <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-[#00FA92] transition-colors">Features</Link>
            <Link href="/pages/price" className="text-sm font-medium text-gray-300 hover:text-[#00FA92] transition-colors">Pricing</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-300 hover:text-[#00FA92] transition-colors">About</Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="hidden md:block text-sm font-medium text-white hover:text-[#00FA92] transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => router.push('/auth/register')}
              className="flex h-10 items-center justify-center rounded-lg bg-[#00FA92] px-5 text-sm font-bold text-[#0a110a] transition-transform hover:scale-105 hover:bg-white"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
