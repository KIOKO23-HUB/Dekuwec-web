// components/Navbar.tsx
"use client";

import { 
  Home, 
  Calendar, 
  Radio, 
  Camera, 
  UserPlus, 
  LifeBuoy, 
  X
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const LOGO_URL = "https://i.postimg.cc/HLsfSHMm/Whats-App-Image-2026-09-03-at-09-49-04.jpg";

export default function Navbar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavbarProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "events", label: "Events & Activities", icon: Calendar },
    { id: "ecopulse", label: "EcoPulse Dispatch", icon: Radio },
    { id: "snaps", label: "Nature Snaps", icon: Camera },
    { id: "membership", label: "Membership Portal", icon: UserPlus },
    { id: "support", label: "Support & Inquiries", icon: LifeBuoy },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-5">
      <div>
        {/* Club Logo & Identity */}
        <div className="flex items-center gap-3.5 pb-6 border-b border-emerald-800/60">
          <img
            src={LOGO_URL}
            alt="DEKUWEC Official Logo"
            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-emerald-400/50 shadow-md bg-white flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="font-extrabold text-base tracking-tight text-white leading-snug truncate">
              DEKUWEC
            </h1>
            <p className="text-[11px] font-medium text-emerald-300 truncate">
              Dedan Kimathi University
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 px-3 mb-2">
            Navigation Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/40 font-black scale-[1.02]"
                    : "text-emerald-100 hover:bg-emerald-900/70 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-slate-950" : "text-emerald-400"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-emerald-800/60">
        <p className="text-[11px] text-emerald-300/80 text-center font-medium">
          Conserve • Explore • Protect
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left-Hand Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 z-40 bg-emerald-950 text-white border-r border-emerald-900 shadow-2xl">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-emerald-950 text-white shadow-2xl z-50 flex flex-col">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-emerald-900 text-emerald-200 hover:text-white"
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
