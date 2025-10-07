"use client";

export default function Sidebar({ isOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-72  bg-[#0a0f0d] border-r border-[#1b2b27]  transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-40`}
    >
      <div className="p-6 mt-20 text-green-400 text-lg font-semibold  border-t border-[#1b2b27]">
        Menu
      </div>
      <ul className="mt-4 space-y-3 text-gray-300 text-left">
        <li className="px-6 py-3  hover:bg-[#2e3b34]  cursor-pointer ">
          Job Found
        </li>
        <li className="px-6 py-3   hover:bg-[#2e3b34] cursor-pointer ">
          Job Applied
        </li>
      </ul>
    </div>
  );
}
