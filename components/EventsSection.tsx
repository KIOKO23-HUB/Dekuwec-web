// components/EventsSection.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Calendar, ExternalLink, MapPin, CheckCircle2, Users } from "lucide-react";

export interface ClubEvent {
  id: string;
  title: string;
  statement12Words: string;
  date: string;
  venue: string;
  imageUrl: string;
  type: "upcoming" | "previous";
  externalLink?: string;
  semester?: string;
  createdAt?: any;
}

const SAMPLE_UPCOMING: ClubEvent[] = [
  {
    id: "up-1",
    title: "Aberdare Waterfall Trek & Clean-Up",
    statement12Words: "Embark on an epic expedition preserving natural mountain water catchments.",
    date: "Sept 19, 2026",
    venue: "Aberdare Range Trails",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    type: "upcoming",
  },
  {
    id: "up-2",
    title: "Campus Indigenous Tree Planting",
    statement12Words: "Targeting 500 indigenous seedlings across the Dedan Kimathi green corridor.",
    date: "Oct 03, 2026",
    venue: "DKUT Grounds",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    type: "upcoming",
  },
  {
    id: "up-3",
    title: "Youth Wildlife Policy Roundtable",
    statement12Words: "Debating local climate adaptation measures with frontline conservation advocates.",
    date: "Oct 17, 2026",
    venue: "Resource Centre Hall 2",
    imageUrl: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80",
    type: "upcoming",
  },
];

const SAMPLE_PREVIOUS: ClubEvent[] = [
  {
    id: "prev-1",
    title: "Karuru Falls Habitat Exploration",
    statement12Words: "Navigated deep valley terrain assessing high-altitude forest biodiversity and ecology.",
    date: "June 2026",
    venue: "Aberdare National Park",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    type: "previous",
    externalLink: "https://photos.google.com",
    semester: "Jan-April 2026",
  },
  {
    id: "prev-2",
    title: "Nyeri River Basin Community Clean-up",
    statement12Words: "Students cleared 120 kilograms of plastic waste protecting river flow.",
    date: "April 2026",
    venue: "Chania Riverbanks",
    imageUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    type: "previous",
    externalLink: "https://photos.google.com",
    semester: "Jan-April 2026",
  },
];

interface SliderProps {
  title: string;
  subtitle: string;
  badge: string;
  events: ClubEvent[];
  participatingIds: { [key: string]: boolean };
  onToggleParticipate: (event: ClubEvent) => void;
}

function EventSlider({ title, subtitle, badge, events, participatingIds, onToggleParticipate }: SliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getTruncatedStatement = (text: string) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > 12 ? words.slice(0, 12).join(" ") + "..." : text;
  };

  return (
    <div className="mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
            {badge}
          </span>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous Slide"
            className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next Slide"
            className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {events.map((evt) => {
          const isParticipating = participatingIds[evt.id];
          return (
            <div
              key={evt.id}
              className="w-[300px] sm:w-[350px] flex-shrink-0 snap-start rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={evt.imageUrl}
                  alt={evt.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-sm font-extrabold text-white leading-snug drop-shadow-md">
                    "{getTruncatedStatement(evt.statement12Words)}"
                  </p>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {evt.title}
                  </h4>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {evt.type === "upcoming" ? (
                    <button
                      onClick={() => onToggleParticipate(evt)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isParticipating
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                      }`}
                    >
                      {isParticipating ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          <span>Participating (Click to Cancel)</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          <span>Want to Participate</span>
                        </>
                      )}
                    </button>
                  ) : (
                    evt.externalLink && (
                      <a
                        href={evt.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        <span>View Highlights & Gallery</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EventsSection() {
  const { user, isLoaded } = useUser();
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[]>(SAMPLE_UPCOMING);
  const [previousEvents, setPreviousEvents] = useState<ClubEvent[]>(SAMPLE_PREVIOUS);
  const [participatingIds, setParticipatingIds] = useState<{ [key: string]: boolean }>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          const liveUpcoming = data.events.filter((e: ClubEvent) => e.type === "upcoming");
          const livePrevious = data.events.filter((e: ClubEvent) => e.type === "previous");
          setUpcomingEvents(liveUpcoming.length > 0 ? liveUpcoming : SAMPLE_UPCOMING);
          setPreviousEvents(livePrevious.length > 0 ? livePrevious : SAMPLE_PREVIOUS);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    };

    fetchEvents();
  }, []);

  const handleToggleParticipate = async (evt: ClubEvent) => {
    if (!user) {
      alert("Please log in to record your event participation.");
      return;
    }

    try {
      const res = await fetch("/api/events/participate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: evt.id,
          eventTitle: evt.title,
          userId: user.id,
          userName: user.fullName || user.firstName || "Club Member",
          userEmail: user.primaryEmailAddress?.emailAddress || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update participation");

      setParticipatingIds((prev) => ({
        ...prev,
        [evt.id]: data.participating,
      }));

      setSuccessToast(
        data.participating
          ? `Successfully registered your interest for "${evt.title}"!`
          : `Cancelled participation for "${evt.title}".`
      );
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert("Failed to update participation: " + err.message);
    }
  };

  return (
    <section id="events-section" className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Events & Outdoor Activities
          </h2>
          <p className="mt-3 text-slate-600">
            Follow our scheduled expeditions, climate actions, and past semester milestones.
          </p>
        </div>

        {successToast && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900 font-bold px-2">✕</button>
          </div>
        )}

        <EventSlider
          title="Upcoming Club Events"
          subtitle="Join our next excursions, cleanups, and community gatherings. Click 'Want to Participate' to notify the admins."
          badge="In the Pipeline"
          events={upcomingEvents}
          participatingIds={participatingIds}
          onToggleParticipate={handleToggleParticipate}
        />

        <EventSlider
          title="Previous Events & Highlights"
          subtitle="Snapshots and records from earlier sessions this semester."
          badge="Completed Journeys"
          events={previousEvents}
          participatingIds={participatingIds}
          onToggleParticipate={handleToggleParticipate}
        />

        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Previous Events Archive</h4>
              <p className="text-xs sm:text-sm text-slate-500">
                Access external reports, photo albums, and summaries from past initiatives.
              </p>
            </div>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full self-start sm:self-auto">
              Refreshed Each Semester
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {previousEvents.map((evt) => (
              <div
                key={`archive-${evt.id}`}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/75 px-3 rounded-lg transition"
              >
                <div>
                  <h5 className="font-semibold text-slate-800 text-sm">{evt.title}</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {evt.date} • {evt.venue} {evt.semester ? `(${evt.semester})` : ""}
                  </p>
                </div>
                {evt.externalLink ? (
                  <a
                    href={evt.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition"
                  >
                    <span>View Photos & Report</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No external link</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
