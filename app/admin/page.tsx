// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  CalendarPlus, 
  HelpCircle, 
  Camera, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Trees,
  Trash2,
  UploadCloud,
  Globe2,
  ExternalLink,
  Flame,
  Plus
} from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [authError, setAuthError] = useState(false);

  // Tab state: 'events' | 'discussions' | 'quiz' | 'snaps'
  const [adminTab, setAdminTab] = useState<"events" | "discussions" | "quiz" | "snaps">("events");

  // Global states
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Realtime Data Stores ---
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [discussionsList, setDiscussionsList] = useState<any[]>([]);
  const [snapsList, setSnapsList] = useState<any[]>([]);

  // --- Form 1: Event Fields ---
  const [eventTitle, setEventTitle] = useState("");
  const [eventStatement, setEventStatement] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventType, setEventType] = useState<"upcoming" | "previous">("upcoming");
  const [eventLink, setEventLink] = useState("");

  // --- Form 2: Multi-Feed Discussions / Global Affairs ---
  const [discTitle, setDiscTitle] = useState("");
  const [discCategory, setDiscCategory] = useState<"Kenya" | "Global" | "Campus" | "Debate">("Debate");
  const [discPrompt, setDiscPrompt] = useState("");
  const [discMeetingInfo, setDiscMeetingInfo] = useState("Wednesday • 4:00 PM • Resource Centre");

  // --- Form 3: EcoPulse Quiz ---
  const [quizWeek, setQuizWeek] = useState("Week 5");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");

  // --- Form 4: Nature Snap Winner ---
  const [snapTitle, setSnapTitle] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [snapWeek, setSnapWeek] = useState("Week 5 Winner");
  const [snapSemester, setSnapSemester] = useState("Aug - Dec 2026");
  const [snapLocation, setSnapLocation] = useState("");
  const [snapImageUrl, setSnapImageUrl] = useState("");
  const [cameraInfo, setCameraInfo] = useState("");

  // Authentication check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || "dekuwec_secret_key_2026";
    if (passkey === validKey || passkey === "dekuwec2026") {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to Events
    const qEvents = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      setEventsList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to Discussions & News Feed
    const qDisc = query(collection(db, "discussions_feed"), orderBy("createdAt", "desc"));
    const unsubDisc = onSnapshot(qDisc, (snapshot) => {
      setDiscussionsList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to Nature Snaps
    const qSnaps = query(collection(db, "nature_snaps"), orderBy("createdAt", "desc"));
    const unsubSnaps = onSnapshot(qSnaps, (snapshot) => {
      setSnapsList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubEvents();
      unsubDisc();
      unsubSnaps();
    };
  }, [isAuthenticated]);

  // Generic Image Uploader to Firebase Storage
  const handleImageUpload = async (
    file: File, 
    setUrlCallback: (url: string) => void
  ) => {
    if (!file) return;
    setUploadingImage(true);
    setErrorMsg(null);

    try {
      const fileRef = ref(storage, `dekuwec_uploads/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload error:", error);
          setErrorMsg("Failed to upload image. Check Firebase Storage permissions.");
          setUploadingImage(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setUrlCallback(downloadUrl);
          setUploadingImage(false);
          setSuccessMsg("Image uploaded successfully from device!");
        }
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed");
      setUploadingImage(false);
    }
  };

  // --- ACTIONS: ADD & DELETE ---

  // Event: Save
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventImageUrl) {
      setErrorMsg("Please upload or provide an image URL.");
      return;
    }
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await addDoc(collection(db, "events"), {
        title: eventTitle.trim(),
        statement12Words: eventStatement.trim(),
        date: eventDate.trim(),
        venue: eventVenue.trim(),
        imageUrl: eventImageUrl,
        type: eventType,
        externalLink: eventLink.trim() || null,
        createdAt: serverTimestamp(),
      });
      setSuccessMsg("Event added to live site!");
      setEventTitle("");
      setEventStatement("");
      setEventDate("");
      setEventVenue("");
      setEventImageUrl("");
      setEventLink("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  // Event: Delete
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to remove this event from the website?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      setSuccessMsg("Event deleted.");
    } catch (err: any) {
      setErrorMsg("Failed to delete event.");
    }
  };

  // Discussion / News Item: Save
  const handleSaveDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await addDoc(collection(db, "discussions_feed"), {
        title: discTitle.trim(),
        category: discCategory,
        prompt: discPrompt.trim(),
        meetingInfo: discMeetingInfo.trim(),
        createdAt: serverTimestamp(),
      });
      setSuccessMsg("New discussion/news item added to the feed!");
      setDiscTitle("");
      setDiscPrompt("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to post item");
    } finally {
      setLoading(false);
    }
  };

  // Discussion: Delete
  const handleDeleteDiscussion = async (id: string) => {
    if (!confirm("Delete this feed topic?")) return;
    try {
      await deleteDoc(doc(db, "discussions_feed", id));
      setSuccessMsg("Topic removed from feed.");
    } catch (err: any) {
      setErrorMsg("Failed to delete topic.");
    }
  };

  // Nature Snap: Save
  const handleSaveSnap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapImageUrl) {
      setErrorMsg("Please upload a winning photograph.");
      return;
    }
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await addDoc(collection(db, "nature_snaps"), {
        title: snapTitle.trim(),
        photographerName: photographer.trim(),
        weekLabel: snapWeek.trim(),
        semester: snapSemester.trim(),
        location: snapLocation.trim(),
        imageUrl: snapImageUrl,
        cameraInfo: cameraInfo.trim() || null,
        createdAt: serverTimestamp(),
      });
      setSuccessMsg("Awarded snap published!");
      setSnapTitle("");
      setPhotographer("");
      setSnapLocation("");
      setSnapImageUrl("");
      setCameraInfo("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save snap");
    } finally {
      setLoading(false);
    }
  };

  // Nature Snap: Delete
  const handleDeleteSnap = async (id: string) => {
    if (!confirm("Delete this photo from Nature Snaps?")) return;
    try {
      await deleteDoc(doc(db, "nature_snaps", id));
      setSuccessMsg("Photo removed from gallery.");
    } catch (err: any) {
      setErrorMsg("Failed to delete photo.");
    }
  };

  // Quiz: Save
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await addDoc(collection(db, "weekly_quizzes"), {
        weekNumber: quizWeek.trim(),
        question: quizQuestion.trim(),
        options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
        correctIndex: Number(correctIndex),
        explanation: explanation.trim(),
        active: true,
        createdAt: serverTimestamp(),
      });
      setSuccessMsg("Weekly quiz updated!");
      setQuizQuestion("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setExplanation("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update quiz");
    } finally {
      setLoading(false);
    }
  };

  // ==================== AUTH WALL ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-center text-white">DEKUWEC Admin Console</h1>
          <p className="text-xs text-slate-400 text-center mt-1">Authorized Executive Access Only</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Secret Passkey
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin passkey..."
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Invalid passkey. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to main portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD VIEW ====================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-emerald-950 text-white border-b border-emerald-900 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <Trees className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-none">DEKUWEC Executive Desk</h2>
              <span className="text-[11px] text-emerald-300">Live Database Controller</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-emerald-200 hover:text-white bg-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-700 transition"
            >
              View Site
            </Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-xs text-rose-300 hover:text-rose-100 bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-800 transition"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-grow">
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-200/90 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => { setAdminTab("events"); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "events" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarPlus className="h-4 w-4" />
            <span>Manage Events ({eventsList.length})</span>
          </button>

          <button
            onClick={() => { setAdminTab("discussions"); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "discussions" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe2 className="h-4 w-4" />
            <span>Discussions & News Feed</span>
          </button>

          <button
            onClick={() => { setAdminTab("snaps"); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "snaps" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Nature Snaps ({snapsList.length})</span>
          </button>

          <button
            onClick={() => { setAdminTab("quiz"); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "quiz" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Weekly Quiz</span>
          </button>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ==================== TAB 1: MANAGE EVENTS ==================== */}
        {adminTab === "events" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Event Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-xl font-black text-slate-900">Add New Event / Expedition</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">Upload posters and details for upcoming or past events.</p>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Category</label>
                    <select
                      value={eventType}
                      onChange={(e: any) => setEventType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="upcoming">Upcoming Event (Active)</option>
                      <option value="previous">Previous Event (Semester Archive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aberdare Waterfall Trek"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    12-Word Bold Statement
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Embark on an epic expedition preserving natural mountain water catchments."
                    value={eventStatement}
                    onChange={(e) => setEventStatement(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date & Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Saturday, Oct 17 • 6:30 AM"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Venue / Route</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aberdare Range Trails"
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                {/* Device File Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Event Poster / Photo (Upload from Device)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition">
                      <UploadCloud className="h-4 w-4 text-emerald-600" />
                      <span>{uploadingImage ? "Uploading..." : "Select File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, setEventImageUrl);
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-400">or paste URL below</span>
                  </div>

                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={eventImageUrl}
                    onChange={(e) => setEventImageUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm mt-2"
                  />

                  {eventImageUrl && (
                    <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={eventImageUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Archive / Photos Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://photos.google.com/..."
                    value={eventLink}
                    onChange={(e) => setEventLink(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Publish Event</span>
                </button>
              </form>
            </div>

            {/* Live Events List & Delete Controls (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h4 className="font-bold text-slate-900">Current Published Events</h4>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold">
                  {eventsList.length} Total
                </span>
              </div>

              {eventsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center italic">
                  No events added yet. Add your first event on the left.
                </p>
              ) : (
                <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                  {eventsList.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-3 hover:border-slate-300 transition"
                    >
                      <img
                        src={evt.imageUrl}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover flex-shrink-0 bg-slate-200"
                      />
                      <div className="flex-grow min-w-0">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          evt.type === "upcoming" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                        }`}>
                          {evt.type}
                        </span>
                        <h5 className="font-bold text-slate-900 text-xs truncate mt-1">{evt.title}</h5>
                        <p className="text-[11px] text-slate-500">{evt.date}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: MULTI-FEED DISCUSSIONS & GLOBAL TOPICS ==================== */}
        {adminTab === "discussions" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Create Discussion Form (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-xl font-black text-slate-900">Post Feed Topic or Global Event</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Add several active debate questions, Kenyan conservation updates, or world headlines.
              </p>

              <form onSubmit={handleSaveDiscussion} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Channel / Category</label>
                    <select
                      value={discCategory}
                      onChange={(e: any) => setDiscCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="Debate">Weekly Meeting Debate</option>
                      <option value="Kenya">Kenya Conservation Frontline</option>
                      <option value="Global">Global Wildlife & Climate Event</option>
                      <option value="Campus">DKUT Campus Sustainability</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Schedule / Tag</label>
                    <input
                      type="text"
                      required
                      placeholder="Wednesday • 4:00 PM • RC"
                      value={discMeetingInfo}
                      onChange={(e) => setDiscMeetingInfo(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Topic Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carbon Credits: Climate Solution or Corporate Greenwashing?"
                    value={discTitle}
                    onChange={(e) => setDiscTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Discussion Prompt / News Summary
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide context, key statistics, and open-floor questions for members to debate..."
                    value={discPrompt}
                    onChange={(e) => setDiscPrompt(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Add to Live Feed</span>
                </button>
              </form>
            </div>

            {/* Live Feed Stream & Deletions (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h4 className="font-bold text-slate-900">Active News & Debate Topics ({discussionsList.length})</h4>
              </div>

              {discussionsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center italic">
                  No active topics posted yet. Add items to populate the EcoPulse feed.
                </p>
              ) : (
                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {discussionsList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            item.category === "Debate" 
                              ? "bg-amber-100 text-amber-900" 
                              : item.category === "Kenya"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-blue-100 text-blue-900"
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-[11px] text-slate-400">{item.meetingInfo}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteDiscussion(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Feed Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div>
                        <h5 className="font-bold text-slate-900 text-sm leading-snug">"{item.title}"</h5>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                          {item.prompt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 3: NATURE SNAPS ==================== */}
        {adminTab === "snaps" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Upload Winner Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-xl font-black text-slate-900">Feature Winning Nature Snap</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Showcase student photography on the left-to-right sliding wall.
              </p>

              <form onSubmit={handleSaveSnap} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Photo Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Crowned Hornbill at Sunrise"
                      value={snapTitle}
                      onChange={(e) => setSnapTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Photographer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Faith Wambui"
                      value={photographer}
                      onChange={(e) => setPhotographer(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Week Label</label>
                    <input
                      type="text"
                      required
                      placeholder="Week 5 Winner"
                      value={snapWeek}
                      onChange={(e) => setSnapWeek(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Semester</label>
                    <input
                      type="text"
                      required
                      placeholder="Aug - Dec 2026"
                      value={snapSemester}
                      onChange={(e) => setSnapSemester(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="DKUT Nature Trail"
                      value={snapLocation}
                      onChange={(e) => setSnapLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                {/* Device Upload for Snap */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Winning Photo File (Upload from Device)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition">
                      <UploadCloud className="h-4 w-4 text-emerald-600" />
                      <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, setSnapImageUrl);
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-400">or paste URL</span>
                  </div>

                  <input
                    type="url"
                    placeholder="https://..."
                    value={snapImageUrl}
                    onChange={(e) => setSnapImageUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm mt-2"
                  />

                  {snapImageUrl && (
                    <div className="mt-2 h-36 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img src={snapImageUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Camera Info (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shot on Nikon D3500 or Pixel 8"
                    value={cameraInfo}
                    onChange={(e) => setCameraInfo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Post Awarded Photo</span>
                </button>
              </form>
            </div>

            {/* List Snaps & Deletions (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h4 className="font-bold text-slate-900 pb-4 border-b border-slate-100 mb-4">
                Published Snaps ({snapsList.length})
              </h4>
              {snapsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center italic">
                  No snaps uploaded yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {snapsList.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
                    >
                      <img
                        src={snap.imageUrl}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{snap.title}</p>
                        <p className="text-[11px] text-slate-500">By {snap.photographerName} • {snap.weekLabel}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSnap(snap.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 4: QUIZ CONTROLS ==================== */}
        {adminTab === "quiz" && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
            <h3 className="text-xl font-black text-slate-900">Set Live Weekly Quiz</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Winners are tallied and rewarded in our regular weekly physical sessions.
            </p>

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Week Label</label>
                <input
                  type="text"
                  required
                  placeholder="Week 5 Challenge"
                  value={quizWeek}
                  onChange={(e) => setQuizWeek(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Quiz Question</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type the weekly question here..."
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    placeholder="Choice A"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    placeholder="Choice B"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Option C</label>
                  <input
                    type="text"
                    required
                    placeholder="Choice C"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Option D</label>
                  <input
                    type="text"
                    required
                    placeholder="Choice D"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={correctIndex}
                    onChange={(e) => setCorrectIndex(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value={0}>Option A is Correct</option>
                    <option value={1}>Option B is Correct</option>
                    <option value={2}>Option C is Correct</option>
                    <option value={3}>Option D is Correct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Scientific Explanation</label>
                  <input
                    type="text"
                    required
                    placeholder="Why this choice is correct..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Update Weekly Quiz</span>
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
