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
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
  {/* Sidebar */}
  <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-md p-4">
    <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
    <nav className="flex flex-col space-y-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`p-3 text-left rounded-md ${
            pathname === link.href
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  </aside>

  {/* Main Content */}
  <main className="flex-1 ml-64 p-6 overflow-y-auto">
    {children}
  </main>
</div>

  );
}
