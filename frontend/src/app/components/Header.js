"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed py-3 top-0 left-0 w-full bg-[#030604] shadow-md z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-[#00fa92]">JobScraper AI </h1>
        <ul className="flex space-x-6 text-[#00fa92] font-bold text-lg">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">Features</Link>
          </li>
          <li>
            <Link href="/pages/price">Prices</Link>

          </li>
          <li>
            <Link href="/contact">Demo</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>

        <div>
          <Link href="/auth/login" className="hover:bg-[#00fa92] text-[#00fa92]  font-bold text-lg hover:text-[#030604] px-4 py-2 rounded-md">
            Login
          </Link>
          <Link href="/auth/register" className="hover:bg-[#00fa92] text-[#00fa92] font-bold text-lg  hover:text-[#030604] px-4 py-2 rounded-md">
            Register 
          </Link>
        </div>

      </nav>
    </header>
  );
}
