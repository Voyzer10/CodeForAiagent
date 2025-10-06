"use client";

export default function Sidebar({ isOpen }) {
  if (!isOpen) return null; // Don't render if closed

  return (
    <aside className="w-64 left-0 top-0 bg-gray-200 p-4 shadow-md h-screen">
      <h2 className="font-semibold mb-4 text-gray-800">Menu</h2>
      <ul className="space-y-2">
        <li className="py-2 px-3 rounded hover:bg-gray-300 cursor-pointer">
          Job Found
        </li>
        <li className="py-2 px-3 rounded hover:bg-gray-300 cursor-pointer">
          Job Applied
        </li>
      </ul>
    </aside>
  );
}
