// components/Navbar.tsx
"use client";

import Link from "next/link";
import { Trees, CalendarDays, Radio, Camera, LifeBuoy, UserPlus, Shield } from "lucide-react";

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: "events", label: "Events & Activities", icon: CalendarDays },
    { id: "ecopulse", label: "EcoPulse", icon: Radio },
    { id: "snaps", label: "Nature Snaps", icon: Camera },
    { id: "support", label: "Support & Contact", icon: LifeBuoy },
    { id: "membership", label: "Membership", icon: UserPlus },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-900/10 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-emerald-800 font-bold text-lg sm:text-xl tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <Trees className="h-5 w-5" />
          </div>
          <span>DEKUWEC</span>
        </Link>

        {/* Tab Buttons for Desktop */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab && setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-semibold shadow-xs"
                    : "hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Button & Admin */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab && setActiveTab("membership")}
            className="flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-emerald-800 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Join / Portal</span>
          </button>

          <Link
            href="/admin"
            title="Admin Dashboard"
            className="p-2 text-slate-400 hover:text-emerald-700 transition rounded-lg hover:bg-slate-100"
          >
            <Shield className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Mobile Tab Scroll Bar */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-2 bg-slate-50 text-xs font-medium">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab && setActiveTab(item.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md transition ${
              activeTab === item.id
                ? "bg-emerald-700 text-white font-semibold"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
