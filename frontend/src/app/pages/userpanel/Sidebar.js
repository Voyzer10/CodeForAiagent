'use client';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  Send,
  User,
  Bookmark,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
if (API_BASE_URL.length > 2048) API_BASE_URL = API_BASE_URL.slice(0, 2048);
while (API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL.slice(0, -1);

export default function Sidebar({ isOpen, onSelectSearch, recentSearches: propRecentSearches }) {
  const pathname = usePathname() || '/';
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    if (propRecentSearches) {
      setRecentSearches(propRecentSearches);
      return;
    }

    const fetchSearches = async () => {
      try {
        if (!API_BASE_URL) return;
        const res = await fetch(`${API_BASE_URL}/userjobs/searches/me`, {
          method: 'GET',
          credentials: 'include', // Include JWT cookie
        });
        const data = await res.json();
        if (res.ok) setRecentSearches(data.savedSearches || []);
      } catch (err) {
        console.error('Error fetching searches:', err);
      }
    };

    fetchSearches();
  }, [propRecentSearches]); // Run when prop changes or on mount

  // Helper to check active route
  const isActive = (href) => {
    if (!href) return false;
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-hidden={!isOpen}
      // place sidebar below navbar (adjust 64px to your navbar height if needed)
      style={{ top: '64px', height: 'calc(100% - 64px)' }}
      className={`fixed left-0 w-72 bg-[#07110f] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 border-r border-[#11221b] flex flex-col`}
    >
      {/* Profile / Header */}
      <div className="px-6 pt-4 pb-4 border-b border-[#11221b]">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
            style={{
              boxShadow: '0 6px 24px rgba(0,250,146,0.08), 0 0 0 2px rgba(0,0,0,0.35) inset',
            }}
          >
            {/* avatar - using local uploaded path (you will transform this in your tooling) */}
            {/* <Image
              src="/mnt/data/0d104d51-7131-450b-a3cc-498f77dbdcef.png"
              alt="User Avatar"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            /> */}
          </div>

          <div>
            <div className="text-sm font-semibold text-[#ffffff] leading-tight">Alex Johnson</div>
            <div className="text-xs text-[#9ca3af]">Premium Member</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-auto">
        <ul className="space-y-2">
          {/* Job Found */}

          {/* User Panel */}
          <li>
            <Link
              href="/pages/userpanel"
              className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isActive('/pages/userpanel') ? '' : 'hover:bg-[#062217]'
                }`}
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md">
                <User className="w-4 h-4 text-[#7b8f86]" />
              </span>
              <span className={`flex-1 text-sm ${isActive('/pages/userpanel') ? 'text-[#eafff0] font-semibold' : 'text-[#dfe9e5]'}`}>
                User Panel
              </span>
              {isActive('/pages/userpanel') && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-md"
                  style={{ background: 'linear-gradient(180deg,#00fa92,#4ade80)' }}
                />
              )}
            </Link>
          </li>
          <li>

            <Link
              href="/pages/job-found"
              className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative overflow-hidden ${isActive('/pages/job-found') ? '' : 'hover:bg-[#062217]'
                }`}
              aria-current={isActive('/pages/job-found') ? 'page' : undefined}
            >
              <span
                className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-all ${isActive('/pages/job-found') ? 'bg-gradient-to-r from-[#00fa92] to-[#4ade80] shadow-[0_8px_40px_rgba(0,250,146,0.12)]' : 'bg-transparent'
                  }`}
              >
                <Briefcase className={`${isActive('/pages/job-found') ? 'text-[#04220e]' : 'text-[#9fffcf]'} w-4 h-4`} />
              </span>

              <span className={`flex-1 text-sm ${isActive('/pages/job-found') ? 'text-[#eafff0] font-semibold' : 'text-[#dfe9e5]'}`}>
                Job Found
              </span>

              {/* Left neon accent for active */}
              {isActive('/pages/job-found') && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-md"
                  style={{ background: 'linear-gradient(180deg,#00fa92,#4ade80)' }}
                />
              )}
            </Link>
          </li>

          {/* Job Applied (button, no route) */}
          <li>
            <button
              type="button"
              onClick={() => {
                /* keep existing UX: simply a button (no route) */
              }}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${pathname === '/job-applied' ? '' : 'hover:bg-[#062217]'}`}
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md">
                <Send className="w-4 h-4 text-[#7b8f86]" />
              </span>
              <span className="flex text-sm text-[#dfe9e5]">Job Applied</span>
            </button>
          </li>



          {/* Saved Jobs */}
          <li>
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-[#062217]"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md">
                <Bookmark className="w-4 h-4 text-[#7b8f86]" />
              </span>
              <span className="flex-1 text-sm text-[#dfe9e5]">Saved Jobs</span>
            </button>
          </li>

          {/* Notifications */}
          <li>
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-[#062217] relative"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md">
                <Bell className="w-4 h-4 text-[#7b8f86]" />
              </span>
              <span className="flex-1 text-sm text-[#dfe9e5]">Notifications</span>
              <span className="h-2 w-2 rounded-full bg-[#00fa92]" aria-hidden />
            </button>
          </li>

          {/* Settings */}
          <li>
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-[#062217]"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md">
                <Settings className="w-4 h-4 text-[#7b8f86]" />
              </span>
              <span className="flex-1 text-sm text-[#dfe9e5]">Settings</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Recent Searches */}
      <div className="px-4 pb-4 border-t border-[#11221b]">
        <h4 className="text-[#9fffcf] text-sm font-semibold px-1">Recent Searches</h4>

        <div className="mt-3 space-y-2">
          {recentSearches.length > 0 ? (
            recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSearch?.(search)}
                className="w-full text-left px-3 py-2 rounded-md bg-[#071a16] text-sm text-[#c7d7cf] hover:bg-[#062217] transition-colors"
              >
                {search.name} ({search.jobs?.length || 0})
              </button>
            ))
          ) : (
            <div className="text-xs text-[#7b8f86] italic px-2 py-2">No saved searches yet</div>
          )}
        </div>
      </div>

      {/* Logout at bottom */}
      <div className="px-4 py-4 border-t border-[#11221b]">
        <button
          type="button"
          onClick={() => {
            // keep functionality unchanged: you can wire actual logout logic elsewhere
            try {
              // example placeholder: clear cookies/localstorage if needed
            } catch (e) { }
          }}
          className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-md bg-gradient-to-r from-[#00fa92] to-[#4ade80] text-[#030604] font-semibold shadow-[0_10px_30px_rgba(0,250,146,0.12)]"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
