"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/applicants", label: "Applicants" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/application-tracking", label: "Application Tracking" },
     { href: "/admin/Logs", label: "Logs" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r">
        <div className="px-5 py-4 border-b">
          <div className="text-lg font-semibold">SaaS Admin</div>
          <div className="text-xs text-gray-500 mt-1">Management Console</div>
        </div>
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                  active
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-current" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="text-xs text-gray-500">v1.0.0</div>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
              <span>Admin</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">
                {links.find(l => l.href === pathname)?.label || "Panel"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search..."
                className="hidden md:block w-64 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white grid place-items-center text-sm font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </div>

  );
}
