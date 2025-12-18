'use client';
import Link from 'next/link';
import Image from 'next/image';

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
  const [user, setUser] = useState(null);

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

  // Fetch user data for profile picture
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!API_BASE_URL) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) setUser(data.user);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

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
            {user?.googlePicture ? (
              <Image
                src={user.googlePicture}
                alt="User Avatar"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#00fa92] to-[#4ade80] flex items-center justify-center text-[#030604] font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold text-[#ffffff] leading-tight">{user?.name || 'Loading...'}</div>
            <div className="text-xs text-[#9ca3af]">Premium Member</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-auto no-scrollbar">
        <ul className="space-y-2">
          {/* User Panel */}
          <li>
            <Link
              href="/pages/userpanel"
              className={`group flex items-center gap-3 px-6 py-3 transition-all relative ${isActive('/pages/userpanel')
                ? 'bg-green-900/10 border-r-2 border-green-500'
                : 'hover:bg-green-900/5'
                }`}
            >
              <User className={`w-5 h-5 ${isActive('/pages/userpanel') ? 'text-green-400' : 'text-gray-500 group-hover:text-green-400'}`} />
              <span className={`text-sm ${isActive('/pages/userpanel') ? 'text-green-400 font-semibold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                User Panel
              </span>
            </Link>
          </li>

          {/* Profile */}
          <li>
            <Link
              href="/pages/profile"
              className={`group flex items-center gap-3 px-6 py-3 transition-all relative ${isActive('/pages/profile')
                ? 'bg-green-900/10 border-r-2 border-green-500'
                : 'hover:bg-green-900/5'
                }`}
            >
              <User className={`w-5 h-5 ${isActive('/pages/profile') ? 'text-green-400' : 'text-gray-500 group-hover:text-green-400'}`} />
              <span className={`text-sm ${isActive('/pages/profile') ? 'text-green-400 font-semibold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                Profile
              </span>
            </Link>
          </li>

          {/* Job Found */}
          <li>
            <Link
              href="/pages/job-found"
              className={`group flex items-center gap-3 px-6 py-3 transition-all relative ${isActive('/pages/job-found')
                ? 'bg-green-900/10 border-r-2 border-green-500'
                : 'hover:bg-green-900/5'
                }`}
            >
              <Briefcase className={`w-5 h-5 ${isActive('/pages/job-found') ? 'text-green-400' : 'text-gray-500 group-hover:text-green-400'}`} />
              <span className={`text-sm ${isActive('/pages/job-found') ? 'text-green-400 font-semibold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                Job Found
              </span>
            </Link>
          </li>

          {/* Job Applied */}
          <li>
            <Link
              href="/pages/applied-jobs"
              className={`group flex items-center gap-3 px-6 py-3 transition-all relative ${isActive('/pages/applied-jobs')
                ? 'bg-green-900/10 border-r-2 border-green-500'
                : 'hover:bg-green-900/5'
                }`}
            >
              <Send className={`w-5 h-5 ${isActive('/pages/applied-jobs') ? 'text-green-400' : 'text-gray-500 group-hover:text-green-400'}`} />
              <span className={`text-sm ${isActive('/pages/applied-jobs') ? 'text-green-400 font-semibold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                Job Applied
              </span>
            </Link>
          </li>

          {/* Saved Jobs */}
          <li>
            <Link
              href="/pages/saved-jobs"
              className={`group flex items-center gap-3 px-6 py-3 transition-all relative ${isActive('/pages/saved-jobs')
                ? 'bg-green-900/10 border-r-2 border-green-500'
                : 'hover:bg-green-900/5'
                }`}
            >
              <Bookmark className={`w-5 h-5 ${isActive('/pages/saved-jobs') ? 'text-green-400' : 'text-gray-500 group-hover:text-green-400'}`} />
              <span className={`text-sm ${isActive('/pages/saved-jobs') ? 'text-green-400 font-semibold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                Saved Jobs
              </span>
            </Link>
          </li>

          {/* Notifications */}
          <li>
            <button
              className="w-full group flex items-center gap-3 px-6 py-3 transition-all hover:bg-green-900/5"
            >
              <Bell className="w-5 h-5 text-gray-500 group-hover:text-green-400" />
              <span className="text-sm text-gray-400 group-hover:text-gray-200">Notifications</span>
              <span className="ml-auto h-2 w-2 rounded-full bg-green-500" />
            </button>
          </li>

          {/* Settings */}
          <li>
            <button
              className="w-full group flex items-center gap-3 px-6 py-3 transition-all hover:bg-green-900/5"
            >
              <Settings className="w-5 h-5 text-gray-500 group-hover:text-green-400" />
              <span className="text-sm text-gray-400 group-hover:text-gray-200">Settings</span>
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
