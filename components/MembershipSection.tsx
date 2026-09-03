// components/MembershipSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Users, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Mail, 
  Send,
  User,
  GraduationCap,
  Clock
} from "lucide-react";

// Official 64 Members
const OFFICIAL_MEMBERS = [
  "Abigael Chebet", "Amanda Matata", "Andrew Sawe", "Annabel Odege", "Babra Cherop",
  "Bett Kimutai", "Bonface Njogu", "Celestine kiptoo", "Charles Nderitu", "Claire Njeri",
  "Clinton Kiptoo", "Curtis kioko", "Daniel Smith", "Edith Asachita", "Elijah Isaac",
  "Elijah mutua", "Elizabeth Nduli", "Elvis Muyai", "Emmanuel Muron", "Eoudiah Kiptoon",
  "Felistas kome", "George kimani", "Grace Chebet", "Hannah Macharia", "Harrison Kimwaki",
  "Hazeline okendo", "Hezron Pkemoi", "Ian Wambua", "Jael Oketch", "John Muchai",
  "John Wamui", "Joyline Selim", "Keith Bundi", "Kelvin Maina", "Lennis gitau",
  "Leonidas Mbogo", "Leonidah kiboror", "Lewis Njuguna", "Lincoln Mureithi", "Lodio josephat",
  "Manasse koech", "Margaret Karongo", "Maureen Chepngeno", "Mercy mutheu", "Mercy Njoki",
  "Michael Kiborom", "Nedi kavwaiza", "Neema Kimutai", "Orville Awour", "Patricia Lenanyangera",
  "Peter Komen", "Phillip Theuri", "Regina", "Robert Nderitu", "Samuel Ndicu",
  "Sophia Kinyua", "Titus kibos", "Tom alando", "Trecy Kipchoge", "Victor Mbau",
  "Victoria Cherotich", "Winnie njeri", "Zac"
];

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  course?: string;
  year?: string;
  status: "Approved" | "Pending" | "Unregistered";
  activities?: string[];
}

export default function MembershipSection() {
  const router = useRouter();
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [firestoreMembers, setFirestoreMembers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals and form state
  const [showYesModal, setShowYesModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  // Verification Form fields: only name, email, year
  const [verifyName, setVerifyName] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyYear, setVerifyYear] = useState("Year 1");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
        setCurrentUserEmail(user.email || "");
      }
    });

    const unsubFirestore = onSnapshot(collection(db, "members"), (snapshot) => {
      const members = snapshot.docs.map((d) => d.data() as UserProfile);
      setFirestoreMembers(members);
    });

    return () => {
      unsubAuth();
      unsubFirestore();
    };
  }, []);

  // Deduplicate and combine legacy list with Firestore entries
  const claimedNames = firestoreMembers.map((m) => (m.displayName || "").toLowerCase());
  
  const unclaimedOfficial: UserProfile[] = OFFICIAL_MEMBERS
    .filter((name) => !claimedNames.includes(name.toLowerCase()))
    .map((name) => ({
      uid: `legacy-${name.toLowerCase().replace(/\s+/g, "-")}`,
      displayName: name,
      email: "",
      course: "Registered Member",
      year: "",
      status: "Approved",
    }));

  const allDirectoryMembers = [...unclaimedOfficial, ...firestoreMembers]
    .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""))
    .filter((m) => (m.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()));

  // 1. User selects their name from the "Yes, I am" modal
  const handleSelectName = (selectedName: string) => {
    setVerifyName(selectedName);
    setVerifyEmail(currentUserEmail || "");
    setVerifyYear("Year 1");
    setVerificationSubmitted(false);
    setShowYesModal(false);
    setShowVerifyModal(true);
  };

  // 2. Submit Verification Form
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const targetUid = currentUserUid || `member_${Date.now()}`;

      // 1. Update/set Firestore status to "Pending"
      await setDoc(
        doc(db, "members", targetUid),
        {
          uid: targetUid,
          displayName: verifyName.trim(),
          email: verifyEmail.trim(),
          year: verifyYear,
          status: "Pending",
          appliedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 2. Dispatch instructions directly to the user's email via Brevo route
      try {
        await fetch("/api/send-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: verifyName.trim(),
            email: verifyEmail.trim(),
            year: verifyYear,
          }),
        });
      } catch (mailErr) {
        console.warn("Mail route ping issue:", mailErr);
      }

      setVerificationSubmitted(true);
    } catch (err) {
      console.error("Verification submit error:", err);
      alert("Failed to submit verification. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="membership-section" className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200">
              <Users className="h-3.5 w-3.5 text-emerald-700" />
              Club Registry
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Membership Portal
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-2xl">
              Official verified roster and enrollment pipeline for Dedan Kimathi Wildlife & Environmental Club members.
            </p>
          </div>

          <button
            onClick={() => router.push("/account")}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            <span>My Account Dashboard</span>
          </button>
        </div>

        {/* ===================== GATE QUESTION BANNER ===================== */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white border border-emerald-800/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Are you a registered DEKUWEC member?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl leading-relaxed">
              Verify your enrollment status or submit your credentials for official club roster inclusion.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowYesModal(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-sm transition hover:scale-[1.02]"
            >
              Yes, I am
            </button>
            <button
              onClick={() => {
                setVerifyName("");
                setVerifyEmail(currentUserEmail || "");
                setVerifyYear("Year 1");
                setVerificationSubmitted(false);
                setShowVerifyModal(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition"
            >
              No, I want to register
            </button>
          </div>
        </div>

        {/* ======================= DIRECTORY BOARD ======================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Board Header & Search */}
          <div className="bg-emerald-950 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
            <div>
              <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                Official Membership Board
              </h3>
              <p className="text-emerald-200 text-xs sm:text-sm mt-1">
                A-Z Directory of all {allDirectoryMembers.length} club members.
              </p>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-sm text-white placeholder-emerald-400/50 outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>
          </div>

          {/* Members Grid */}
          <div className="p-6 sm:p-8 max-h-[650px] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allDirectoryMembers.map((member) => {
                const isApproved = member.status === "Approved";
                return (
                  <div 
                    key={member.uid} 
                    className="flex flex-col p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md bg-slate-50 transition group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg ring-2 ring-white">
                        {(member.displayName || "?").charAt(0).toUpperCase()}
                      </div>
                      
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs flex items-center gap-1 ${
                        isApproved 
                          ? "bg-emerald-500 text-slate-950" 
                          : "bg-amber-400 text-slate-950 animate-pulse"
                      }`}>
                        {isApproved && <CheckCircle2 className="h-3 w-3" />}
                        {isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition">
                      {member.displayName || "Unknown Member"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {member.course || "Club Member"} {member.year ? `• ${member.year}` : ""}
                    </p>
                  </div>
                );
              })}

              {allDirectoryMembers.length === 0 && (
                <p className="col-span-full py-12 text-center text-slate-400 text-sm font-semibold">
                  No members found matching "{searchQuery}".
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ===================== MODAL 1: SELECT NAME FROM ROSTER ===================== */}
      {showYesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Select Your Name
              </h4>
              <button 
                onClick={() => setShowYesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Locate your name in the roster to verify your details:
            </p>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50">
              {allDirectoryMembers.map((m) => (
                <button
                  key={m.uid}
                  onClick={() => handleSelectName(m.displayName)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-800 text-xs font-bold text-slate-700 transition flex items-center justify-between border border-slate-100"
                >
                  <span className="truncate">{m.displayName}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: VERIFICATION FORM (NAME, EMAIL, YEAR ONLY) ===================== */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-base">
                {verificationSubmitted ? "Application Received" : "Verify as Member"}
              </h4>
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!verificationSubmitted ? (
              <form onSubmit={handleSubmitVerification} className="space-y-4 mt-4">
                <p className="text-xs text-slate-500">
                  Please confirm your details below. Payment and verification instructions will be sent to your email.
                </p>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Full Official Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={verifyName}
                      onChange={(e) => setVerifyName(e.target.value)}
                      placeholder="e.g. Kelvin Maina"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      placeholder="student@dkut.ac.ke"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Year of Study
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      value={verifyYear}
                      onChange={(e) => setVerifyYear(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 appearance-none"
                    >
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Year 5">Year 5</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Verification</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                    <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                    <span>Status: Pending Approval</span>
                  </div>
                  <p>
                    Your verification request has been received. Payment and verification steps have been sent to <strong>{verifyEmail}</strong>.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    router.push("/account");
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Go to My Account Dashboard</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
