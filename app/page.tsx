// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import EventsSection from "@/components/EventsSection";
import EcoPulseSection from "@/components/EcoPulseSection";
import NatureSnapsSection from "@/components/NatureSnapsSection";
import MembershipSection from "@/components/MembershipSection";
import SupportSection from "@/components/SupportSection";
import AccountPage from "@/app/account/page";
import MessagesTab from "@/components/MessagesTab";
import NotificationsTab from "@/components/NotificationsTab";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  increment,
  where 
} from "firebase/firestore";
import { 
  Heart, 
  Menu, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Users, 
  Compass, 
  Sprout, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Bell
} from "lucide-react";

const LOGO_URL = "https://i.postimg.cc/HLsfSHMm/Whats-App-Image-2026-09-03-at-09-49-04.jpg";

interface SlideItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  imageUrl: string;
  ctaText: string;
  targetTab: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: "slide-1",
    tag: "Next Club Assembly • Wednesday @ 4:00 PM",
    title: "Aberdare Forest Basin & Water Tower Restoration",
    description: "Join our next student expedition restoring native highland biodiversity, planting indigenous seedlings, and protecting water towers.",
    date: "Saturday • Full Day Excursion",
    venue: "Main Gate • 6:30 AM Sharp",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80",
    ctaText: "View Expedition Details",
    targetTab: "events",
  },
  {
    id: "slide-2",
    tag: "Hands-on Conservation Drive",
    title: "Campus Indigenous Tree Nursery Maintenance",
    description: "Hands-on seedling potting, soil mixture preparation, and seedbed expansion at our dedicated university nursery site.",
    date: "Wednesday • 3:30 PM",
    venue: "DKUT Nature Trail Corridor",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80",
    ctaText: "Get Involved",
    targetTab: "membership",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Unread message count state for top bar pill
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Likes Counter State
  const [likesCount, setLikesCount] = useState<number>(128);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  // 1. Sync Unread Messages Count
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "member_messages"),
      where("recipientUid", "==", auth.currentUser.uid),
      where("read", "==", false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadMessages(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync Live Uploaded Images into Hero Slider
  useEffect(() => {
    const qEvents = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const qSnaps = query(collection(db, "nature_snaps"), orderBy("createdAt", "desc"));

    let liveEventSlides: SlideItem[] = [];
    let liveSnapSlides: SlideItem[] = [];

    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      liveEventSlides = snapshot.docs
        .filter((d) => Boolean(d.data().imageUrl))
        .map((d) => {
          const data = d.data();
          return {
            id: `evt-${d.id}`,
            tag: data.type === "upcoming" ? "Upcoming Club Excursion" : "Previous Highlight",
            title: data.title || "Club Excursion",
            description: data.statement12Words || "Environmental conservation, biodiversity preservation, and mountaineering.",
            date: data.date || "Scheduled Date",
            venue: data.venue || "DKUT Grounds",
            imageUrl: data.imageUrl,
            ctaText: "View Events & Details",
            targetTab: "events",
          };
        });
      updateCombinedSlides();
    });

    const unsubSnaps = onSnapshot(qSnaps, (snapshot) => {
      liveSnapSlides = snapshot.docs
        .filter((d) => Boolean(d.data().imageUrl))
        .map((d) => {
          const data = d.data();
          return {
            id: `snap-${d.id}`,
            tag: `Nature Snap • ${data.weekLabel || "Award Winner"}`,
            title: data.title || "Nature Photography",
            description: `Awarded capture by ${data.photographerName || "Club Member"}${data.cameraInfo ? ` (${data.cameraInfo})` : ""}.`,
            date: data.semester || "Semester Active",
            venue: data.location || "Conservation Trail",
            imageUrl: data.imageUrl,
            ctaText: "View Nature Gallery",
            targetTab: "snaps",
          };
        });
      updateCombinedSlides();
    });

    const updateCombinedSlides = () => {
      const merged = [...liveEventSlides, ...liveSnapSlides];
      if (merged.length > 0) {
        setSlides(merged);
      } else {
        setSlides(DEFAULT_SLIDES);
      }
    };

    return () => {
      unsubEvents();
      unsubSnaps();
    };
  }, []);

  // 3. Sync Likes Counter
  useEffect(() => {
    const liked = localStorage.getItem("dekuwec_site_liked") === "true";
    setHasLiked(liked);

    const statsRef = doc(db, "site_stats", "likes");
    const unsubLikes = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setLikesCount(docSnap.data().count ?? 128);
      } else {
        setDoc(statsRef, { count: 128 }, { merge: true });
      }
    });

    return () => unsubLikes();
  }, []);

  const handleLikeToggle = async () => {
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 500);

    const statsRef = doc(db, "site_stats", "likes");
    try {
      if (!hasLiked) {
        setHasLiked(true);
        setLikesCount((prev) => prev + 1);
        localStorage.setItem("dekuwec_site_liked", "true");
        await updateDoc(statsRef, { count: increment(1) });
      } else {
        setHasLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        localStorage.removeItem("dekuwec_site_liked");
        await updateDoc(statsRef, { count: increment(-1) });
      }
    } catch (err) {
      console.error("Failed to update likes:", err);
    }
  };

  // Auto slide cycle
  useEffect(() => {
    if (isPaused || activeTab !== "home" || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, activeTab, slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const activeItem = slides[currentSlide] || slides[0];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Left Navigation Sidebar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Top App Header with Messages, Notifications & Likes */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="DEKUWEC Logo"
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-emerald-500/40 lg:hidden shadow-xs"
              />
              <div>
                <h2 className="text-sm font-black text-slate-900 leading-none">
                  {activeTab === "home" && "DEKUWEC Portal"}
                  {activeTab === "events" && "Events & Excursions"}
                  {activeTab === "ecopulse" && "EcoPulse News & Debates"}
                  {activeTab === "snaps" && "Nature Snaps Wall"}
                  {activeTab === "membership" && "Club Membership"}
                  {activeTab === "account" && "Account Dashboard"}
                  {activeTab === "messages" && "Direct Messages"}
                  {activeTab === "notifications" && "Global Notifications"}
                  {activeTab === "support" && "Help & Inquiries"}
                </h2>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                  Dedan Kimathi University of Technology
                </p>
              </div>
            </div>
          </div>

          {/* Top Bar Right Actions: Messages, Notifications, and Likes */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Messages Button */}
            <button
              onClick={() => setActiveTab("messages")}
              className={`relative p-2 rounded-xl border transition flex items-center justify-center ${
                activeTab === "messages"
                  ? "bg-emerald-500 text-slate-950 border-emerald-600 shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title="Direct Messages"
            >
              <MessageSquare className="h-4 w-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setActiveTab("notifications")}
              className={`p-2 rounded-xl border transition flex items-center justify-center ${
                activeTab === "notifications"
                  ? "bg-emerald-500 text-slate-950 border-emerald-600 shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title="Global Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Like Pill */}
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                hasLiked
                  ? "bg-rose-50 text-rose-600 border-rose-200 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              } ${likeAnimating ? "scale-110" : "scale-100"}`}
              title="Like this portal"
            >
              <Heart
                className={`h-4 w-4 transition-transform ${
                  hasLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-500"
                }`}
              />
              <span className="font-extrabold">{likesCount.toLocaleString()}</span>
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <main className="flex-grow">
          {/* ===================== TAB 0: HOME PAGE ===================== */}
          {activeTab === "home" && (
            <div>
              {/* Single Hero Slider Displaying All Uploaded Images */}
              <section 
                className="relative min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden bg-slate-950 text-white"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="h-full w-full object-cover transform scale-105 transition-transform duration-[6500ms] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-slate-950/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30"></div>
                  </div>
                ))}

                {slides.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      aria-label="Previous Slide"
                      className="absolute left-3 sm:left-6 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                      onClick={nextSlide}
                      aria-label="Next Slide"
                      className="absolute right-3 sm:right-6 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Hero Overlay Content */}
                <div className="relative z-20 mx-auto max-w-5xl px-6 sm:px-14 py-16 sm:py-20 w-full">
                  <div className="max-w-2xl space-y-5 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      <span>{activeItem.tag}</span>
                    </div>

                    <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md transition-all duration-500">
                      {activeItem.title}
                    </h1>

                    <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed font-normal drop-shadow line-clamp-3 sm:line-clamp-none">
                      {activeItem.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-200">
                      <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span>{activeItem.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                        <span>{activeItem.venue}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
                      <button
                        onClick={() => setActiveTab(activeItem.targetTab)}
                        className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-xl transition hover:scale-[1.02]"
                      >
                        <span>{activeItem.ctaText}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setActiveTab("membership")}
                        className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-md transition"
                      >
                        Join DEKUWEC
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dot Pagination */}
                {slides.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-2">
                    {slides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentSlide(dotIdx)}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          dotIdx === currentSlide 
                            ? "w-8 bg-emerald-400" 
                            : "w-2.5 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Hub Navigator */}
              <section className="py-16 bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                  <div className="text-center max-w-xl mx-auto mb-10">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Explore DEKUWEC Hubs</h2>
                    <p className="text-sm text-slate-500 mt-1">Direct access to our club functions and activities.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div 
                      onClick={() => setActiveTab("events")}
                      className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 w-fit group-hover:scale-105 transition-transform">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-4 group-hover:text-emerald-700 transition">Events & Activities</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Upcoming mountain trails, cleanups, and previous semester photo albums.
                      </p>
                    </div>

                    <div 
                      onClick={() => setActiveTab("ecopulse")}
                      className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 w-fit group-hover:scale-105 transition-transform">
                        <Sprout className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-4 group-hover:text-emerald-700 transition">EcoPulse Buzz</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Weekly challenge quizzes, environmental news, and floor debate topics.
                      </p>
                    </div>

                    <div 
                      onClick={() => setActiveTab("snaps")}
                      className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 w-fit group-hover:scale-105 transition-transform">
                        <Compass className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-4 group-hover:text-emerald-700 transition">Nature Snaps</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Weekly student photography awards and collaborative Google Photos album.
                      </p>
                    </div>

                    <div 
                      onClick={() => setActiveTab("membership")}
                      className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 w-fit group-hover:scale-105 transition-transform">
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-4 group-hover:text-emerald-700 transition">Membership Portal</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Enroll as a new member or verify existing registration records.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Sub-view Routing */}
          {activeTab === "events" && <EventsSection />}
          {activeTab === "ecopulse" && <EcoPulseSection />}
          {activeTab === "snaps" && <NatureSnapsSection />}
          {activeTab === "membership" && <MembershipSection />}
          {activeTab === "account" && <AccountPage />}
          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "support" && <SupportSection />}
        </main>

        {/* Global Footer with Social Channels */}
        <footer className="border-t border-slate-200 bg-white py-10 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-emerald-900 font-bold text-sm">
              <img
                src={LOGO_URL}
                alt="DEKUWEC"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span>Dedan Kimathi Wildlife & Environmental Club</span>
            </div>

            {/* Social Icons Strip */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/wildlifeandenvironmentalclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 flex items-center justify-center transition border border-slate-200"
                title="Instagram"
              >
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a
                href="https://www.tiktok.com/@dekuwec_dekut?_r=1&_t=ZS-99Q1Zs2LjYP"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 flex items-center justify-center transition border border-slate-200"
                title="TikTok"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 5.2 1.83V7a4.84 4.84 0 0 1-1.3-.31z"/>
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/dekut-wildlife-and-environment-club-dekuwec-99b43a341?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 flex items-center justify-center transition border border-slate-200"
                title="LinkedIn"
              >
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>

              <a
                href="https://x.com/Dekut_WEC"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 flex items-center justify-center transition border border-slate-200"
                title="X"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>

            <p className="text-xs text-slate-500 text-center sm:text-right">
              © {new Date().getFullYear()} DEKUWEC • Dedan Kimathi University of Technology • All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>

    </div>
  );
}
