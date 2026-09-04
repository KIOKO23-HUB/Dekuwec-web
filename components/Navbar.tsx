// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  Home, 
  Calendar, 
  Radio, 
  Camera, 
  UserPlus, 
  UserCircle,
  MessageSquare,
  Bell,
  LifeBuoy, 
  X
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  user?: any;
}

const LOGO_URL = "https://i.postimg.cc/HLsfSHMm/Whats-App-Image-2026-09-03-at-09-49-04.jpg";

export const SOCIAL_CHANNELS = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/wildlifeandenvironmentalclub/",
    svg: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@dekuwec_dekut?_r=1&_t=ZS-99Q1Zs2LjYP",
    svg: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 5.2 1.83V7a4.84 4.84 0 0 1-1.3-.31z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/dekut-wildlife-and-environment-club-dekuwec-99b43a341?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    svg: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
      </svg>
    ),
  },
  {
    name: "X (Twitter)",
    url: "https://x.com/Dekut_WEC",
    svg: (
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  user: propUser,
}: NavbarProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const activeUser = propUser || (isLoaded ? clerkUser : null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!activeUser?.id) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${activeUser.id}`);
        const data = await res.json();
        if (data.messages) {
          const unreadCount = data.messages.filter((m: any) => !m.read).length;
          setUnreadMessages(unreadCount);
        }
      } catch (err) {
        console.error("Failed to load unread messages:", err);
      }
    };

    fetchUnread();
  }, [activeUser?.id]);

  // Main navigation list without Messages, Notifications, and Account Dashboard
  const primaryNavItems = [
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

        <nav className="mt-6 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 px-3 mb-2">
            Navigation Menu
          </p>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/40 font-black scale-[1.02]"
                    : "text-emerald-100 hover:bg-emerald-900/70 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-slate-950" : "text-emerald-400"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section with Account Dashboard and Follow Handles */}
      <div className="space-y-4 pt-5 border-t border-emerald-800/60">
        <button
          onClick={() => handleSelect("account")}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
            activeTab === "account"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/40 font-black scale-[1.02]"
              : "bg-emerald-900/50 text-emerald-100 hover:bg-emerald-900 hover:text-white border border-emerald-700/50"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <UserCircle className={`h-5 w-5 flex-shrink-0 ${activeTab === "account" ? "text-slate-950" : "text-emerald-400"}`} />
            <span className="truncate">Account Dashboard</span>
          </div>
        </button>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-3 text-center">
            Follow Our Community
          </p>
          <div className="flex items-center justify-center gap-2">
            {SOCIAL_CHANNELS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                className="h-9 w-9 rounded-xl bg-emerald-900/90 hover:bg-emerald-500 hover:text-slate-950 text-emerald-200 flex items-center justify-center transition shadow-xs border border-emerald-700/60"
              >
                {s.svg}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 z-40 bg-emerald-950 text-white border-r border-emerald-900 shadow-2xl">
        {navContent}
      </aside>

      {/* Floating Top Quick Actions Bar for Header (Messages & Notifications) */}
      <div className="fixed top-4 right-6 z-30 hidden lg:flex items-center gap-2">
        <button
          onClick={() => setActiveTab("messages")}
          className={`relative p-2.5 rounded-xl border transition shadow-md flex items-center justify-center ${
            activeTab === "messages"
              ? "bg-emerald-500 text-slate-950 border-emerald-400"
              : "bg-slate-900/90 text-emerald-300 border-emerald-800/80 hover:bg-emerald-950 hover:text-white"
          }`}
          title="Messages"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
              {unreadMessages}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`relative p-2.5 rounded-xl border transition shadow-md flex items-center justify-center ${
            activeTab === "notifications"
              ? "bg-emerald-500 text-slate-950 border-emerald-400"
              : "bg-slate-900/90 text-emerald-300 border-emerald-800/80 hover:bg-emerald-950 hover:text-white"
          }`}
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-emerald-950 text-white shadow-2xl z-50 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-emerald-900">
              <div className="flex items-center gap-2 px-2">
                <button
                  onClick={() => setActiveTab("messages")}
                  className="relative p-2 rounded-lg bg-emerald-900 text-emerald-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 px-1 rounded-full bg-rose-500 text-white text-[8px]">
                      {unreadMessages}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className="p-2 rounded-lg bg-emerald-900 text-emerald-200"
                >
                  <Bell className="h-4 w-4" />
                </button>
              </div>
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
