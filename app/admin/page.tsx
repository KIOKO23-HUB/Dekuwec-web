// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db, storage } from "@/lib/mongodb";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  CalendarPlus, 
  HelpCircle, 
  Camera, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Trees,
  Trash2,
  UploadCloud,
  Globe2,
  Plus,
  Users,
  Clock,
  UserCheck,
  UserX,
  Bell,
  Sparkles,
  Copy,
  Check,
  PhoneCall,
  Image as ImageIcon,
  CheckSquare,
  XCircle
} from "lucide-react";

const CLUB_LOGO_URL = "https://i.postimg.cc/qB9gLwmz/Whats-App-Image-2026-09-03-at-09-49-04.jpg";
const DEKUT_LOGO_URL = "https://i.postimg.cc/Xq84V1xK/Dekut-logo.jpg";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [authError, setAuthError] = useState(false);

  // Tab state
  const [adminTab, setAdminTab] = useState<
    "members" | "notifications" | "ai-poster" | "events" | "discussions" | "quiz" | "snaps"
  >("members");

  // Global states
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Realtime Data Stores ---
  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [discussionsList, setDiscussionsList] = useState<any[]>([]);
  const [snapsList, setSnapsList] = useState<any[]>([]);

  // --- Push Notifications Form ---
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifImageUrl, setNotifImageUrl] = useState("");
  const [sendToEmail, setSendToEmail] = useState(true);

  // --- PR Poster AI Studio State ---
  const [templateImgUrl, setTemplateImgUrl] = useState("");
  const [bgImgUrl, setBgImgUrl] = useState("");
  const [noUploadsConfirmed, setNoUploadsConfirmed] = useState(false);
  const [colorScheme, setColorScheme] = useState("forest");
  const [posterImages, setPosterImages] = useState<string[]>([]);
  const [posterDetails, setPosterDetails] = useState({
    title: "",
    theme: "",
    date: "",
    time: "",
    venue: "",
    chiefGuest: "",
    customNotes: "",
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [generatedPosterUrl, setGeneratedPosterUrl] = useState("");
  const [generatingPoster, setGeneratingPoster] = useState(false);

  // --- Events State ---
  const [eventTitle, setEventTitle] = useState("");
  const [eventStatement, setEventStatement] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventType, setEventType] = useState<"upcoming" | "previous">("upcoming");
  const [eventLink, setEventLink] = useState("");

  // --- Discussions State ---
  const [discTitle, setDiscTitle] = useState("");
  const [discCategory, setDiscCategory] = useState<"Kenya" | "Global" | "Campus" | "Debate" | "Knowledge" | "Question">("Debate");
  const [discPrompt, setDiscPrompt] = useState("");
  const [discMeetingInfo, setDiscMeetingInfo] = useState("Wednesday • 4:00 PM • Resource Centre");

  // --- Quiz State ---
  const [quizWeek, setQuizWeek] = useState("Week 5");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");

  // --- Nature Snap State ---
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

    const unsubMembers = onSnapshot(collection(db, "members"), (snapshot) => {
      setAllUsersList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const qEvents = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      setEventsList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const qDisc = query(collection(db, "discussions_feed"), orderBy("createdAt", "desc"));
    const unsubDisc = onSnapshot(qDisc, (snapshot) => {
      setDiscussionsList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const qSnaps = query(collection(db, "nature_snaps"), orderBy("createdAt", "desc"));
    const unsubSnaps = onSnapshot(qSnaps, (snapshot) => {
      setSnapsList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubMembers();
      unsubEvents();
      unsubDisc();
      unsubSnaps();
    };
  }, [isAuthenticated]);

  const registeredApproved = allUsersList.filter((m) => m.status === "Approved");
  const pendingApprovals = allUsersList.filter((m) => m.status === "Pending");

  const handleSetStatus = async (uid: string, newStatus: "Approved" | "Pending" | "Unregistered") => {
    try {
      await updateDoc(doc(db, "members", uid), { status: newStatus });
      setSuccessMsg(`Member status updated to: ${newStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to update status: " + err.message);
    }
  };

  // Generic Image Uploader (Used for Events, Snaps, and Notifications)
  const handleImageUpload = async (file: File, setUrlCallback: (url: string) => void) => {
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
          setSuccessMsg("Image uploaded successfully!");
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed");
      setUploadingImage(false);
    }
  };

  // Browser Base64 Uploader for instant poster images (Fixes the hanging upload issue)
  const handleMultiImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setErrorMsg(null);

    try {
      const base64Promises: Promise<string>[] = [];
      const filesToProcess = Array.from(files).slice(0, 4);

      for (const file of filesToProcess) {
        base64Promises.push(
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          })
        );
      }

      const uploadedUrls = await Promise.all(base64Promises);
      setPosterImages((prev) => [...prev, ...uploadedUrls].slice(0, 4));
      setUploadingImage(false);
      setSuccessMsg("Event photos successfully added to poster grid!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to process photos: " + err.message);
      setUploadingImage(false);
    }
  };

  // Broadcast Push Notification (Website + Email)
  const handlePushWebNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await addDoc(collection(db, "site_notifications"), {
        title: notifTitle,
        message: notifMessage,
        imageUrl: notifImageUrl || "",
        createdAt: serverTimestamp(),
      });
      setSuccessMsg("Notification successfully pushed to website feed!");
      setNotifTitle(""); setNotifMessage(""); setNotifImageUrl("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to push website notification.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailBroadcast = async () => {
    if (!notifTitle || !notifMessage) {
      setErrorMsg("Please provide both a title and message before sending emails.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const targetEmails = allUsersList.map((u) => u.email).filter(Boolean);

      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notifTitle,
          message: notifMessage,
          imageUrl: notifImageUrl,
          targetEmails,
          sendEmail: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to dispatch announcement emails.");

      setSuccessMsg(`Announcement emails successfully dispatched to ${targetEmails.length} members!`);
    } catch (err: any) {
      setErrorMsg(err.message || "Email broadcast dispatch failed.");
    } finally {
      setLoading(false);
    }
  };

  // Generate PR AI Poster Prompt
  const handleGeneratePosterPrompt = (e: React.FormEvent) => {
    e.preventDefault();

    const promptText = `
Create an ultra-high-resolution, visually striking environmental event poster that matches the composition, typography layout, and visual rhythm of the reference template: ${
      templateImgUrl || "Standard Modern Conservation Expedition Layout"
    }.

CRITICAL DESIGN SPECIFICATIONS (DO NOT USE ANY ORIGINAL DUMMY DETAILS FROM THE TEMPLATE):
1. MANDATORY EMBEDDED LOGOS:
   - DEKUWEC Official Club Logo (Top Left Corner): ${CLUB_LOGO_URL}
   - Dedan Kimathi University of Technology (DeKUT) Crest (Top Right Corner): ${DEKUT_LOGO_URL}

2. BACKGROUND ARTWORK:
   ${
     bgImgUrl
       ? `- Instate this background image seamlessly across the composition: ${bgImgUrl}`
       : "- Utilize a majestic Kenyan landscape backdrop (Aberdare Forest, Mount Kenya peaks, or rich bamboo canopies) with clean cinematic lighting."
   }

3. EVENT PARTICULARS & TYPOGRAPHY:
   - Primary Headline: "${posterDetails.title || "DEKUWEC EXPEDITION 2026"}"
   - Event Theme/Subtitle: "${posterDetails.theme || "Conservation • Exploration • Sustainability"}"
   - Scheduled Date: "${posterDetails.date || "To Be Announced"}"
   - Start Time: "${posterDetails.time || "8:00 AM EAT"}"
   - Venue / Route: "${posterDetails.venue || "DeKUT Main Campus, Nyeri"}"
   ${posterDetails.chiefGuest ? `- Chief Guest / Host: "${posterDetails.chiefGuest}"` : ""}
   ${posterDetails.customNotes ? `- Crucial Notice: "${posterDetails.customNotes}"` : ""}

4. MANDATORY FOOTER CONTACT & REAL SOCIAL ICONS:
   Position clean, modern vector social icons along the bottom footer banner:
   - [Instagram Icon] @dekut_wec
   - [X / Twitter Icon] @Dekut_WEC
   - [TikTok Icon] @dekut_wec
   - [WhatsApp Icon] 0758638953
   - Call to Action: "Join the Green Movement • Register at dekuwec-web.firebaseapp.com"

STYLE: Professional graphic design, bold modern typography, high contrast, clean readable layout, suitable for official campus distribution.
    `.trim();

    setGeneratedPrompt(promptText);
  };

  // Generate Inbuilt Branded Poster Canvas with Custom Photos & Colors
  const handleGenerateInbuiltPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingPoster(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/generate-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: posterDetails.title,
          theme: posterDetails.theme,
          date: posterDetails.date,
          venue: posterDetails.venue,
          colorScheme,
          posterImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate poster.");

      setGeneratedPosterUrl(data.imageUrl);
      setSuccessMsg("Branded event poster generated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Poster generation failed.");
    } finally {
      setGeneratingPoster(false);
    }
  };

  const handleApproveDiscussion = async (id: string) => {
    try {
      await updateDoc(doc(db, "discussions_feed", id), { status: "Approved" });
      setSuccessMsg("Topic approved and published live!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to approve topic: " + err.message);
    }
  };

  const handleRejectDiscussion = async (id: string) => {
    try {
      await deleteDoc(doc(db, "discussions_feed", id));
      setSuccessMsg("Topic rejected and removed.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to delete topic: " + err.message);
    }
  };

  // --- STANDARD HANDLERS (Events, Snaps, Quizzes, Discussions) ---
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventImageUrl) return setErrorMsg("Please upload an event poster.");
    setLoading(true);
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
      setSuccessMsg("Event published!");
      setEventTitle(""); setEventStatement(""); setEventDate(""); setEventVenue(""); setEventImageUrl(""); setEventLink("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Delete this event?")) await deleteDoc(doc(db, "events", id));
  };

  const handleSaveDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "discussions_feed"), {
        title: discTitle.trim(),
        category: discCategory,
        prompt: discPrompt.trim(),
        meetingInfo: discMeetingInfo.trim(),
        status: "Approved",
        likes: 0,
        dislikes: 0,
        comments: [],
        createdAt: serverTimestamp(),
      });
      setSuccessMsg("Discussion posted!");
      setDiscTitle(""); setDiscPrompt("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscussion = async (id: string) => {
    if (confirm("Delete this topic?")) await deleteDoc(doc(db, "discussions_feed", id));
  };

  const handleSaveSnap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapImageUrl) return setErrorMsg("Please upload a photo.");
    setLoading(true);
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
      setSuccessMsg("Winning photo featured!");
      setSnapTitle(""); setPhotographer(""); setSnapLocation(""); setSnapImageUrl(""); setCameraInfo("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSnap = async (id: string) => {
    if (confirm("Delete this photo?")) await deleteDoc(doc(db, "nature_snaps", id));
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      setSuccessMsg("Weekly quiz posted!");
      setQuizQuestion(""); setOptA(""); setOptB(""); setOptC(""); setOptD(""); setExplanation("");
    } catch (err: any) {
      setErrorMsg(err.message);
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-emerald-950 text-white border-b border-emerald-900 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={CLUB_LOGO_URL}
              alt="DEKUWEC Logo"
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-emerald-500/40 shadow-sm bg-white"
            />
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-none">DEKUWEC Executive Desk</h2>
              <span className="text-[11px] text-emerald-300">Club Operations & PR Engine</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-grow">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-200/90 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => setAdminTab("members")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "members" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Members & Approvals ({allUsersList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab("notifications")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "notifications" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Push Notifications</span>
          </button>

          <button
            onClick={() => setAdminTab("ai-poster")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "ai-poster" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>PR AI Poster Studio</span>
          </button>

          <button
            onClick={() => setAdminTab("events")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "events" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarPlus className="h-4 w-4" />
            <span>Events ({eventsList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab("discussions")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "discussions" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe2 className="h-4 w-4" />
            <span>Discussions & Moderation</span>
          </button>

          <button
            onClick={() => setAdminTab("snaps")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              adminTab === "snaps" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Nature Snaps</span>
          </button>

          <button
            onClick={() => setAdminTab("quiz")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition ${
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

        {/* ==================== TAB 1: MEMBERS, APPROVALS & SIGNUPS ==================== */}
        {adminTab === "members" && (
          <div className="space-y-8">
            {/* List 1: Pending Approvals */}
            <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-amber-100 mb-6">
                <div>
                  <h3 className="text-lg font-black text-amber-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Pending Verification & Registration Requests ({pendingApprovals.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applicants who have submitted verification details and are awaiting admin payment confirmation.
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
                  Needs Action
                </span>
              </div>

              {pendingApprovals.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">
                  No membership verification requests currently pending approval.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-amber-50/50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-amber-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Applicant Name</th>
                        <th className="py-3 px-4 font-bold">Email</th>
                        <th className="py-3 px-4 font-bold">Year of Study</th>
                        <th className="py-3 px-4 font-bold">Applied Date</th>
                        <th className="py-3 px-4 font-bold text-right">Approval Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingApprovals.map((m) => (
                        <tr key={m.id} className="hover:bg-amber-50/30 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{m.displayName}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{m.email}</td>
                          <td className="py-3.5 px-4">{m.year || "Year 1"}</td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {m.appliedAt ? new Date(m.appliedAt).toLocaleDateString() : "Recent"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSetStatus(m.id, "Approved")}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Approve (KES 100 Paid)
                              </button>
                              <button
                                onClick={() => handleSetStatus(m.id, "Unregistered")}
                                className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1 transition"
                              >
                                <UserX className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* List 2: Active Registered Members */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Official Registered Members ({registeredApproved.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirmed members displaying green verified status across the site directory.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                  Active
                </span>
              </div>

              {registeredApproved.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">
                  No verified members in database.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {registeredApproved.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{m.displayName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                        <span className="text-[10px] text-emerald-700 font-bold">{m.year || "Year 1"}</span>
                      </div>
                      <button
                        onClick={() => handleSetStatus(m.id, "Unregistered")}
                        title="Revoke Verification"
                        className="text-xs text-rose-500 hover:text-rose-700 p-1 font-semibold"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List 3: All Signups on Website */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-700" />
                    Complete Signups & Notification Mailing List ({allUsersList.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every student who has created an account on the portal. All emails are saved for automated push alerts.
                  </p>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto pr-1">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Member Status</th>
                      <th className="py-2.5 px-3">Signup Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsersList.map((u) => (
                      <tr key={u.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{u.displayName || "Anonymous User"}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === "Approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : u.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {u.status || "Unregistered"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Registered"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PUSH NOTIFICATIONS ==================== */}
        {adminTab === "notifications" && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Broadcast Member Notification</h3>
                <p className="text-xs text-slate-500">
                  Pushes a live notification banner to the website and dispatches an announcement email with images to all {allUsersList.length} registered accounts.
                </p>
              </div>
            </div>

            <form onSubmit={handlePushWebNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Club Assembly: Trip Logistics"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the message details, schedule updates, or urgent instructions..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Attach Picture or Poster URL (Included in Email Dispatch)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition">
                    <UploadCloud className="h-4 w-4 text-emerald-600" />
                    <span>{uploadingImage ? "Uploading..." : "Upload Poster"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, setNotifImageUrl);
                      }}
                    />
                  </label>
                  <span className="text-xs text-slate-400">or paste direct image link</span>
                </div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={notifImageUrl}
                  onChange={(e) => setNotifImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm mt-2"
                />
                {notifImageUrl && (
                  <div className="mt-2 h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={notifImageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sendEmailBox"
                  checked={sendToEmail}
                  onChange={(e) => setSendToEmail(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                />
                <label htmlFor="sendEmailBox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Send directly to all {allUsersList.length} signup emails via Brevo
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                  <span>Push to Website Feed</span>
                </button>
                <button
                  type="button"
                  disabled={loading || uploadingImage || !notifTitle || !notifMessage}
                  onClick={handleSendEmailBroadcast}
                  className="py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Send Email to All ({allUsersList.length})</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================== TAB 3: PR AI POSTER STUDIO (WITH BROWSER BASE64 MULTI-UPLOAD) ==================== */}
        {adminTab === "ai-poster" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <Sparkles className="h-3 w-3" /> Inbuilt Branded Canvas Generator
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Generate Branded Event Poster</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Design official posters instantly with in-built university and club crests, customizable color palettes, and 2 to 4 uploaded event photos.
                </p>
              </div>

              <form onSubmit={handleGenerateInbuiltPoster} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Title / Main Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SATIMA HIKING"
                    value={posterDetails.title}
                    onChange={(e) => setPosterDetails({ ...posterDetails, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Theme / Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. HIKING FOR LEARN"
                    value={posterDetails.theme}
                    onChange={(e) => setPosterDetails({ ...posterDetails, theme: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SATURDAY 26TH SEP 2026"
                      value={posterDetails.date}
                      onChange={(e) => setPosterDetails({ ...posterDetails, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Venue *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SASINI"
                      value={posterDetails.venue}
                      onChange={(e) => setPosterDetails({ ...posterDetails, venue: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Poster Color Theme</label>
                  <select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white font-semibold"
                  >
                    <option value="forest">Emerald Forest Green (Official Club)</option>
                    <option value="earth">Deep Earth & Gold</option>
                    <option value="navy">Midnight Navy Blue</option>
                    <option value="sunset">Crimson Sunset</option>
                  </select>
                </div>

                {/* MULTI IMAGE UPLOAD (2 TO 4 PICTURES) WITH FIXED HTMLFOR */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Event Pictures (2 to 4 Images for Poster Grid)
                  </label>
                  <label
                    htmlFor="poster-images-input"
                    className="cursor-pointer flex items-center justify-center gap-2 p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:border-emerald-500 transition"
                  >
                    <UploadCloud className="h-4 w-4 text-emerald-600" />
                    <span>{uploadingImage ? "Processing photos..." : `Select Photos (${posterImages.length}/4 uploaded)`}</span>
                  </label>
                  <input
                    id="poster-images-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) handleMultiImageUpload(e.target.files);
                    }}
                  />
                  {posterImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {posterImages.map((img, idx) => (
                        <div key={idx} className="relative h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                          <img src={img} alt="Upload" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPosterImages(posterImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-rose-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shadow"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={generatingPoster || uploadingImage}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {generatingPoster ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>{generatingPoster ? "Rendering Branded Canvas..." : "Generate Branded Poster"}</span>
                </button>
              </form>
            </div>

            {/* Canvas Preview (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-center">
              <h4 className="font-bold text-slate-900 text-sm pb-3 border-b">Generated Poster Preview Canvas</h4>
              {generatedPosterUrl ? (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-2 max-h-[520px] shadow-lg">
                    <img src={generatedPosterUrl} alt="Generated Poster" className="w-full h-full object-contain mx-auto rounded-xl" />
                  </div>
                  <a
                    href={generatedPosterUrl}
                    download="dekuwec-event-poster.svg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-md"
                  >
                    Download Full Resolution Poster
                  </a>
                </div>
              ) : (
                <div className="py-32 text-slate-400 space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-slate-300" />
                  <p className="text-xs">Your rendered club poster will appear here instantly.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: MANAGE EVENTS ==================== */}
        {adminTab === "events" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-xl font-black text-slate-900 mb-6">Add New Event / Expedition</h3>
              <form onSubmit={handleSaveEvent} className="space-y-4">
                <select
                  value={eventType}
                  onChange={(e: any) => setEventType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="upcoming">Upcoming Event (Active)</option>
                  <option value="previous">Previous Event (Semester Archive)</option>
                </select>

                <input
                  type="text"
                  required
                  placeholder="Event Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />

                <input
                  type="text"
                  required
                  placeholder="12-Word Bold Statement"
                  value={eventStatement}
                  onChange={(e) => setEventStatement(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Date & Time"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Venue / Route"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl text-xs font-bold border border-slate-300 w-fit">
                    <UploadCloud className="h-4 w-4 text-emerald-600" />
                    <span>Upload Poster Image</span>
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
                  <input
                    type="url"
                    placeholder="or paste image URL"
                    value={eventImageUrl}
                    onChange={(e) => setEventImageUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm mt-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm transition"
                >
                  Publish Event
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-4 pb-2 border-b">Published Events ({eventsList.length})</h4>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {eventsList.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-xl border bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={evt.imageUrl} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-xs">{evt.title}</p>
                        <p className="text-[10px] text-slate-500">{evt.date}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteEvent(evt.id)} className="text-rose-500 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: DISCUSSIONS & MODERATION ==================== */}
        {adminTab === "discussions" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-xl font-black text-slate-900 mb-4">Post Official Discussion / News</h3>
              <form onSubmit={handleSaveDiscussion} className="space-y-4">
                <select
                  value={discCategory}
                  onChange={(e: any) => setDiscCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Debate">Weekly Meeting Debate</option>
                  <option value="Kenya">Kenya Conservation Frontline</option>
                  <option value="Global">Global Wildlife & Climate Event</option>
                  <option value="Campus">DKUT Campus Sustainability</option>
                  <option value="Knowledge">Historical Fact / New Knowledge</option>
                  <option value="Question">Community Question</option>
                </select>

                <input
                  type="text"
                  required
                  placeholder="Headline"
                  value={discTitle}
                  onChange={(e) => setDiscTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />

                <textarea
                  rows={4}
                  required
                  placeholder="Detailed prompt..."
                  value={discPrompt}
                  onChange={(e) => setDiscPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm transition"
                >
                  Publish Official Post
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-xl font-black text-slate-900 mb-4">Member Submissions Moderation Queue</h3>
              <div className="space-y-4 max-h-[580px] overflow-y-auto">
                {discussionsList.filter((d) => d.status === "Pending").length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No pending submissions.</p>
                ) : (
                  discussionsList.filter((d) => d.status === "Pending").map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        {item.category} • {item.authorName || "Member"}
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm">{item.title}</h5>
                      <p className="text-xs text-slate-700">{item.prompt}</p>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button onClick={() => handleApproveDiscussion(item.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button onClick={() => handleRejectDiscussion(item.id)} className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: NATURE SNAPS ==================== */}
        {adminTab === "snaps" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-xl font-black text-slate-900 mb-6">Feature Nature Snap Winner</h3>
              <form onSubmit={handleSaveSnap} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="Photo Title" value={snapTitle} onChange={(e) => setSnapTitle(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
                  <input type="text" required placeholder="Photographer Name" value={photographer} onChange={(e) => setPhotographer(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" required placeholder="Week Label" value={snapWeek} onChange={(e) => setSnapWeek(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
                  <input type="text" required placeholder="Semester" value={snapSemester} onChange={(e) => setSnapSemester(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
                  <input type="text" required placeholder="Location" value={snapLocation} onChange={(e) => setSnapLocation(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl text-xs font-bold border border-slate-300 w-fit">
                    <UploadCloud className="h-4 w-4 text-emerald-600" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, setSnapImageUrl);
                    }} />
                  </label>
                  <input type="url" placeholder="or paste URL" value={snapImageUrl} onChange={(e) => setSnapImageUrl(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm mt-2" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm">Feature Photo</button>
              </form>
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-4 pb-2 border-b">Featured Snaps ({snapsList.length})</h4>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {snapsList.map((snap) => (
                  <div key={snap.id} className="p-3 rounded-xl border bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={snap.imageUrl} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-xs">{snap.title}</p>
                        <p className="text-[10px] text-slate-500">By {snap.photographerName}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteSnap(snap.id)} className="text-rose-500 p-1"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: WEEKLY QUIZ ==================== */}
        {adminTab === "quiz" && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
            <h3 className="text-xl font-black text-slate-900 mb-6">Update Active Weekly Quiz</h3>
            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <input type="text" required placeholder="Week Label" value={quizWeek} onChange={(e) => setQuizWeek(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
              <textarea rows={3} required placeholder="Question" value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="Option A" value={optA} onChange={(e) => setOptA(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
                <input type="text" required placeholder="Option B" value={optB} onChange={(e) => setOptB(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
                <input type="text" required placeholder="Option C" value={optC} onChange={(e) => setOptC(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
                <input type="text" required placeholder="Option D" value={optD} onChange={(e) => setOptD(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 z-10 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={correctIndex} onChange={(e) => setCorrectIndex(Number(e.target.value))} className="p-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                  <option value={0}>Option A is Correct</option>
                  <option value={1}>Option B is Correct</option>
                  <option value={2}>Option C is Correct</option>
                  <option value={3}>Option D is Correct</option>
                </select>
                <input type="text" required placeholder="Explanation" value={explanation} onChange={(e) => setExplanation(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold">Save Quiz</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
