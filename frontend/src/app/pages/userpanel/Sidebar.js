"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar({ isOpen, onSelectSearch }) {
  const [recentSearches, setRecentSearches] = useState([]);
  useEffect(() => {
    const fetchSearches = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/userjobs/searches/me", {
          method: "GET",
          credentials: "include", // Include JWT cookie
        });
        const data = await res.json();
        if (res.ok) setRecentSearches(data.savedSearches || []);
      } catch (err) {
        console.error("Error fetching searches:", err);
      }
    };

    fetchSearches();
  }, []);
  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 bg-[#0a0f0d] transform ${isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 border-r border-[#1b2b27] flex flex-col`}
    >
      {/* Header */}
      <div className="p-6 mt-20 border-b border-[#1b2b27]">
        <h2 className="text-green-400 text-lg font-semibold">Menu</h2>
      </div>

      {/* Menu Items */}
      <ul className="flex-1 mt-4 space-y-3 text-gray-300">
        <Link href="/pages/job-found">
          <li className="px-6 py-3 hover:bg-[#2e3b34] cursor-pointer rounded-md">
            Job Found
          </li>
        </Link>
        <li className="px-6 py-3 hover:bg-[#2e3b34] cursor-pointer rounded-md">
          Job Applied
        </li>
      </ul>

      {/* Recent Searches */}
      <div className="border-t border-[#1b2b27] pt-4 pb-6 overflow-y-auto max-h-64">
        <h4 className="text-green-400 text-md font-semibold px-6 mb-3">
          Recent Searches
        </h4>
        {recentSearches.length > 0 ? (
          <ul className="space-y-2 text-sm text-gray-300">
            {recentSearches.map((search, idx) => (
              <li
                key={idx}
                onClick={() => onSelectSearch?.(search)}
                className="px-4 py-2 hover:bg-[#2e3b34] cursor-pointer rounded-md"
              >
                {search.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-xs italic">No saved searches yet</p>
        )}
      </div>
    </div>
  );
}
