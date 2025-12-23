"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Activity,
  Server,
  ShieldCheck,
  Search,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/applicants", label: "Applicants", icon: Users },
    { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
    { href: "/admin/application-tracking", label: "Application Tracking", icon: FileText },
    { href: "/admin/Logs", label: "Logs", icon: Activity },
    { href: "/admin/api-health", label: "API Health", icon: Server },
    { href: "/admin/system-check", label: "System Check", icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Backdrop (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 shadow-sm z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-200">
            A
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">SaaS Admin</h1>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Management Console</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-140px)] scrollbar-hide">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>System Operational</span>
            <span className="ml-auto text-slate-400">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm supports-[backdrop-filter]:bg-white/60">
          <div className="px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-0.5">
                  <span>Admin</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-900 font-medium">
                    {links.find(l => l.href === pathname)?.label || "Panel"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium text-slate-900">Administrator</div>
                  <div className="text-xs text-slate-500">super@admin.com</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center text-sm font-semibold shadow-md shadow-blue-200 ring-2 ring-white">
                  SA
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

