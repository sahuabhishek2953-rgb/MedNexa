"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/patients": "Patients",
  "/prescriptions": "Prescriptions",
  "/prescriptions/upload": "Upload Prescription",
};

export function Header() {
  const pathname = usePathname();
  const title =
    Object.entries(pageTitles)
      .reverse()
      .find(([path]) => pathname.startsWith(path))?.[1] ?? "MedNexa";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-base font-semibold text-gray-700">{title}</h2>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">DR</span>
        </div>
      </div>
    </header>
  );
}
