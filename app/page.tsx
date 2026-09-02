// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import EventsSection from "@/components/EventsSection";
import EcoPulseSection from "@/components/EcoPulseSection";
import NatureSnapsSection from "@/components/NatureSnapsSection";
import MembershipSection from "@/components/MembershipSection";
import SupportSection from "@/components/SupportSection";
import { 
  Trees, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Users, 
  Compass, 
  Sprout,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Slide data for the hero background slider
const HERO_SLIDES = [
  {
    id: "slide-1",
    tag: "Next Club Assembly • Wednesday @ 4:00 PM",
    badge: "Conservation • Exploration • Youth Impact",
    title: "Aberdare Forest Basin & Water Tower Restoration",
    description: "Join our next student expedition restoring native highland biodiversity, planting indigenous seedlings, and protecting water towers.",
    date: "Saturday • Full Day Field Excursion",
    venue: "Main Gate • 6:30 AM Sharp",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80",
    ctaText: "View Expedition Details",
    targetTab: "events",
  },
  {
    id: "slide-2",
    tag: "Hands-on Conservation Drive",
    badge: "Climate Action Milestone",
    title: "Campus Indigenous Tree Nursery Maintenance",
    description: "Hands-on seedling potting, soil mixture preparation, and seedbed expansion at our dedicated university nursery site.",
    date: "Wednesday • 3:30 PM",
    venue: "DKUT Nature Trail Corridor",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80",
    ctaText: "Get Involved",
    targetTab: "membership",
  },
  {
    id: "slide-3",
    tag: "EcoPulse Debate & Challenges",
    badge: "Youth Leadership Summit",
    title: "Wildlife Habitat Advocacy & Climate Policy Talks",
    description: "Weekly peer discussions on frontline environmental policy, carbon markets, and awarding this week's nature photography winners.",
    date: "Every Wednesday Session",
    venue: "Resource Centre Hall 2",
    imageUrl: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1920&q=80",
    ctaText: "Read EcoPulse Buzz",
    targetTab: "ecopulse",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide cycle every 6 seconds (pauses when hovering over the hero)
  useEffect(() => {
    if (isPaused || activeTab !== "home") return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, activeTab]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-grow">
        {/* ===================== TAB 0: HOME PAGE (DEFAULT) ===================== */}
        {activeTab === "home" && (
          <div>
            {/* Full-Bleed Hero Background Slider */}
            <section 
              className="relative min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden bg-slate-950 text-white"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Background Slides */}
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover transform scale-105 transition-transform duration-[6000ms] ease-out"
                  />
                  {/* Multistage Gradient Overlays for High Contrast Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-slate-950/40"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30"></div>
                </div>
              ))}

              {/* Slider Left Arrow */}
              <button
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="absolute left-4 sm:left-8 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 shadow-lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Slider Right Arrow */}
              <button
                onClick={nextSlide}
                aria-label="Next Slide"
                className="absolute right-4 sm:right-8 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 shadow-lg"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Foreground Hero Content */}
              <div className="relative z-20 mx-auto max-w-7xl px-8 sm:px-14 py-20 w-full">
                <div className="max-w-2xl space-y-6">
                  
                  {/* Sub-badge */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span>{HERO_SLIDES[currentSlide].tag}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md transition-all duration-500">
                    {HERO_SLIDES[currentSlide].title}
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal drop-shadow">
                    {HERO_SLIDES[currentSlide].description}
                  </p>

                  {/* Date & Location Pill */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200">
                    <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      <span>{HERO_SLIDES[currentSlide].date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      <span>{HERO_SLIDES[currentSlide].venue}</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="pt-2 flex flex-wrap gap-4">
                    <button
                      onClick={() => setActiveTab(HERO_SLIDES[currentSlide].targetTab)}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl transition hover:scale-[1.02]"
                    >
                      <span>{HERO_SLIDES[currentSlide].ctaText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab("membership")}
                      className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition"
                    >
                      Join DEKUWEC
                    </button>
                  </div>

                </div>
              </div>

              {/* Bottom Dot Indicators (like Microsoft Store) */}
              <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-2">
                {HERO_SLIDES.map((_, dotIdx) => (
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
            </section>

            {/* Hub Navigator Section */}
            <section className="py-16 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Explore DEKUWEC Hubs</h2>
                  <p className="text-sm text-slate-500 mt-1">Direct access to our club functions and activities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        {/* Tab Views */}
        {activeTab === "events" && <EventsSection />}
        {activeTab === "ecopulse" && <EcoPulseSection />}
        {activeTab === "snaps" && <NatureSnapsSection />}
        {activeTab === "membership" && <MembershipSection />}
        {activeTab === "support" && <SupportSection />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <Trees className="h-5 w-5 text-emerald-700" />
            <span>Dedan Kimathi Wildlife & Environmental Club (DEKUWEC)</span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} DEKUWEC • Dedan Kimathi University of Technology • All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}