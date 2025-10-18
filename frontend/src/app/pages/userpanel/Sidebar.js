"use client";
import Link from "next/link";

export default function Sidebar({ isOpen, recentSearches = [], onSelectSearch }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 bg-[#0a0f0d] transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-40 border-r border-[#1b2b27]`}
    >
      <div className="p-6 mt-20 text-green-400 text-lg font-semibold border-t border-[#1b2b27]">
        Menu
      </div>

      <ul className="mt-4 space-y-3 text-gray-300 text-left">
        <Link href="/pages/job-found">
          <li className="px-6 py-3 hover:bg-[#2e3b34] cursor-pointer">Job Found</li>
        </Link>
        <li className="px-6 py-3 hover:bg-[#2e3b34] cursor-pointer">Job Applied</li>
      </ul>

      {/* Recent Searches Section */}
      <div className="mt-8 border-t border-[#1b2b27] pt-4">
        <h4 className="text-green-400 text-md font-semibold px-6 mb-2">
          Recent Searches
        </h4>
        {recentSearches.length > 0 ? (
          <ul className="space-y-2 text-sm text-gray-300">
            {recentSearches.map((search, idx) => (
              <li
                key={idx}
                onClick={() => onSelectSearch(search)}
                className="px-6 py-2 hover:bg-[#2e3b34] cursor-pointer rounded-md"
              >
                {search.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-xs px-6 italic">No saved searches yet</p>
        )}
      </div>
    </div>
  );
}
