// components/NatureSnapsSection.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Trophy, 
  Sparkles, 
  User, 
  Calendar,
  Image as ImageIcon
} from "lucide-react";

export interface NatureSnap {
  id: string;
  title: string;
  photographerName: string;
  weekLabel: string;
  semester: string;
  location: string;
  imageUrl: string;
  cameraInfo?: string;
  createdAt?: any;
}

const SAMPLE_SNAPS: NatureSnap[] = [
  {
    id: "snap-1",
    title: "Crowned Hornbill at Sunrise",
    photographerName: "Faith Wambui",
    weekLabel: "Week 4 Winner",
    semester: "Aug - Dec 2026",
    location: "DKUT Conservation Trail",
    imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1000&q=80",
    cameraInfo: "Shot on Nikon D3500",
  },
  {
    id: "snap-2",
    title: "Morning Mist Over Karuru Falls",
    photographerName: "Brian Kiprop",
    weekLabel: "Week 3 Winner",
    semester: "Aug - Dec 2026",
    location: "Aberdare National Park",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80",
    cameraInfo: "Shot on Canon EOS 200D",
  },
  {
    id: "snap-3",
    title: "Camouflaged Chameleon in Native Shrub",
    photographerName: "Sharon Nduta",
    weekLabel: "Week 2 Winner",
    semester: "Aug - Dec 2026",
    location: "Kimathi River Sanctuary",
    imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=80",
    cameraInfo: "Shot on Galaxy S22 Ultra",
  },
  {
    id: "snap-4",
    title: "Highland Colobus Troop Feeding",
    photographerName: "Kevin Mwangi",
    weekLabel: "Week 1 Winner",
    semester: "Aug - Dec 2026",
    location: "Kabiru-ini Forest Edge",
    imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1000&q=80",
    cameraInfo: "Shot on Sony Alpha A6400",
  },
];

export default function NatureSnapsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [snaps, setSnaps] = useState<NatureSnap[]>(SAMPLE_SNAPS);

  const GOOGLE_PHOTOS_ALBUM_URL = "https://photos.google.com";

  useEffect(() => {
    const fetchSnaps = async () => {
      try {
        const res = await fetch("/api/nature-snaps");
        const data = await res.json();
        if (data.snaps && data.snaps.length > 0) {
          setSnaps(data.snaps);
        }
      } catch (err) {
        console.error("Failed to load nature snaps:", err);
      }
    };

    fetchSnaps();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="snaps-section" className="py-14 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200">
              <Camera className="h-3.5 w-3.5 text-emerald-700" />
              DEKUWEC Visuals
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Nature Snaps Gallery
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
              Showcasing the finest student-captured biodiversity, wilderness expeditions, and weekly award-winning nature photography.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous Slide"
              className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next Slide"
              className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {snaps.map((snap) => (
            <div
              key={snap.id}
              className="w-[320px] sm:w-[420px] flex-shrink-0 snap-start rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-900">
                <img
                  src={snap.imageUrl}
                  alt={snap.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-slate-950 backdrop-blur-sm shadow">
                    <Trophy className="h-3.5 w-3.5" />
                    {snap.weekLabel}
                  </span>
                  <span className="text-[11px] font-medium text-white/90 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
                    {snap.semester}
                  </span>
                </div>

                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h3 className="text-lg sm:text-xl font-black leading-tight drop-shadow-sm">
                    {snap.title}
                  </h3>
                  <p className="text-xs text-emerald-200 mt-1 font-medium">
                    📍 {snap.location}
                  </p>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Photographer</p>
                    <p className="text-sm font-bold text-slate-800">{snap.photographerName}</p>
                  </div>
                </div>

                {snap.cameraInfo && (
                  <span className="text-[11px] text-slate-400 border border-slate-100 bg-slate-50 px-2 py-1 rounded-md">
                    {snap.cameraInfo}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-8 sm:p-12 shadow-md">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-800/80 border border-emerald-700/60 mb-3">
                <ImageIcon className="h-3.5 w-3.5" />
                Community Photo Cloud
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Explore the Full DEKUWEC Google Photos Album
              </h3>
              <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                Have nature or wildlife shots from our excursions or around campus? Upload your captures to our collaborative Google Photos album. Best submissions are reviewed and awarded every Wednesday!
              </p>
            </div>

            <a
              href={GOOGLE_PHOTOS_ALBUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-emerald-900 shadow-lg hover:bg-emerald-50 transition-all flex-shrink-0"
            >
              <span>Open Google Photos Album</span>
              <ExternalLink className="h-4 w-4 text-emerald-700" />
            </a>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" /> 1. Shoot & Upload
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Capture native wildlife, indigenous trees, insects, or landscapes and add them directly to the Google Photos album.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> 2. Weekly Peer Review
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              The executive board shortlists standout shots to be spotlighted and credited on our digital wall.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" /> 3. Awarded in Meetings
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              The winning photographer receives official recognition and club souvenirs during our weekly physical sessions.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
