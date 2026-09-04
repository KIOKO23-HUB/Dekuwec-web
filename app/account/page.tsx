// app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  User,
  Mail,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowLeft,
  ShieldAlert,
  Send,
  X,
  Sparkles,
  UploadCloud,
  Loader2,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

interface MemberRecord {
  displayName: string;
  email: string;
  year: string;
  course: string;
  photoURL: string;
  status: "Unregistered" | "Pending" | "Approved" | "Rejected";
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [loading, setLoading] = useState(true);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [member, setMember] = useState<MemberRecord>({
    displayName: "",
    email: "",
    year: "Year 1",
    course: "",
    photoURL: "",
    status: "Unregistered",
  });

  const [modalName, setModalName] = useState("");
  const [modalYear, setModalYear] = useState("Year 1");
  const [modalCourse, setModalCourse] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      router.replace("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/member");
        const data = await res.json();
        if (data.member) {
          setMember(data.member);
          setModalName(data.member.displayName || user.fullName || "");
          setModalYear(data.member.year || "Year 1");
          setModalCourse(data.member.course || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoaded, isSignedIn, user, router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    setNotification(null);

    try {
      await user.setProfileImage({ file });
      setMember((prev) => ({ ...prev, photoURL: user.imageUrl }));
      setNotification({ type: "success", message: "Profile picture updated successfully!" });
    } catch (err: any) {
      setNotification({ type: "error", message: "Failed to upload photo: " + (err.message || "Unknown error") });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setNotification(null);

    try {
      const res = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: modalName.trim(),
          course: modalCourse.trim(),
          year: modalYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setMember(data.member);
      setNotification({ type: "success", message: "Profile details updated in MongoDB successfully!" });
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingModal(true);
    setNotification(null);

    try {
      const res = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: modalName.trim(),
          course: modalCourse.trim(),
          year: modalYear,
          status: "Pending",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit verification");

      setMember(data.member);
      setIsModalOpen(false);
      setNotification({
        type: "success",
        message: "Verification submitted! Instructions have been sent to your email.",
      });
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/login" });
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping mb-4" />
        <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
          Connecting to MongoDB...
        </p>
      </div>
    );
  }

  const userEmailDisplay = member.email || user?.primaryEmailAddress?.emailAddress || "";
  const userInitial = (member.displayName || user?.firstName || "M").trim()[0]?.toUpperCase() || "M";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Club Home
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {notification && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {member.status === "Approved" ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">Verified DEKUWEC Member</p>
              <p className="text-xs text-slate-400">Your membership is confirmed and in good standing.</p>
            </div>
          </div>
        ) : member.status === "Pending" ? (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
            <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-400">Pending Approval</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your verification request is saved in the database and is awaiting admin confirmation.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">Not a Registered Member</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify your membership to unlock official club events and member benefits.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verify as Member</span>
            </button>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center">
                {member.photoURL ? (
                  <img src={member.photoURL} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-emerald-400">{userInitial}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer rounded-2xl text-[10px] font-bold text-white">
                <UploadCloud className="h-5 w-5 mb-1 text-emerald-400" />
                <span>{uploadingPhoto ? "Uploading..." : "Change Photo"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-black text-white">
                  {member.displayName || "Member"}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    member.status === "Approved"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{userEmailDisplay}</p>
              <p className="text-[11px] text-emerald-400 font-medium mt-2">
                Managed securely via MongoDB Atlas.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfileDetails} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Official Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email (Read-Only)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    disabled
                    value={userEmailDisplay}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/50 text-slate-300 text-sm cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Academic Course
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={modalCourse}
                    onChange={(e) => setModalCourse(e.target.value)}
                    placeholder="e.g. Mechanical Engineering"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Year of Study
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  <select
                    value={modalYear}
                    onChange={(e) => setModalYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none appearance-none"
                  >
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Year 5">Year 5</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              <span>Save Account Changes</span>
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">Member Verification</h3>
              <p className="text-xs text-slate-400 mt-1">
                Confirm your details to submit your verification request to MongoDB.
              </p>
            </div>

            <form onSubmit={handleMembershipSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Official Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="e.g. Kelvin Maina"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    disabled
                    value={userEmailDisplay}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/50 text-slate-300 text-sm cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Academic Course
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={modalCourse}
                    onChange={(e) => setModalCourse(e.target.value)}
                    placeholder="e.g. Mechanical Engineering"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Year of Study
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  <select
                    value={modalYear}
                    onChange={(e) => setModalYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none appearance-none"
                  >
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Year 5">Year 5</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{submittingModal ? "Submitting..." : "Submit Verification"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
