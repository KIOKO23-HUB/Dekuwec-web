// components/MembershipSection.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Mail, 
  User, 
  GraduationCap, 
  Hash, 
  ArrowRight 
} from "lucide-react";

type MemberType = "new" | "existing";

export default function MembershipSection() {
  const [memberType, setMemberType] = useState<MemberType>("new");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("Year 1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Basic Validation
    if (!fullName.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Save record directly to Firestore 'members' collection
      await addDoc(collection(db, "members"), {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        regNumber: regNumber.trim().toUpperCase(),
        yearOfStudy: yearOfStudy,
        memberType: memberType,
        status: "active",
        registeredAt: serverTimestamp(),
      });

      // 2. Dispatch automated confirmation emails (Club notification + Student receipt)
      const emailResponse = await fetch("/api/notify-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          regNumber: regNumber.trim().toUpperCase(),
          yearOfStudy,
          memberType,
        }),
      });

      if (!emailResponse.ok) {
        console.warn("Database record saved, but confirmation email dispatch failed.");
      }

      setSuccess(true);
      // Reset form fields
      setFullName("");
      setEmail("");
      setRegNumber("");
      setYearOfStudy("Year 1");
    } catch (err: any) {
      console.error("Error submitting membership:", err);
      setError(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="membership-section" className="py-16 bg-slate-50 min-h-[80vh] flex items-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
            DEKUWEC Portal
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Club Membership
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-lg mx-auto">
            Register to join upcoming expeditions, access conservation tools, and engage in our weekly meetings.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          
          {/* Segmented Toggle Buttons */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => {
                setMemberType("new");
                setSuccess(false);
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                memberType === "new"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Register as Member</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMemberType("existing");
                setSuccess(false);
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                memberType === "existing"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Already a Member</span>
            </button>
          </div>

          {/* Banner message based on selected type */}
          <div className="mb-6 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3 text-xs sm:text-sm text-emerald-900">
            <div className="p-1 bg-emerald-200/60 rounded-md mt-0.5 text-emerald-800">
              {memberType === "new" ? <UserPlus className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-semibold">
                {memberType === "new" ? "New Member Enrolment" : "Member Profile Confirmation"}
              </p>
              <p className="text-emerald-800/80 text-xs mt-0.5">
                {memberType === "new"
                  ? "Submit your student credentials to be officially enrolled for this academic year."
                  : "Verify or update your existing records to continue receiving excursion and meeting updates."}
              </p>
            </div>
          </div>

          {/* Success State */}
          {success && (
            <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center animate-in fade-in">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-lg">
                {memberType === "new" ? "Registration Submitted!" : "Details Updated Successfully!"}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-700 mt-1">
                {memberType === "new"
                  ? "A confirmation email has been dispatched to your inbox. Welcome to DEKUWEC!"
                  : "Your membership profile is up to date and confirmed."}
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-4 text-xs font-semibold text-emerald-800 underline underline-offset-2"
              >
                Submit another response
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              {/* Student Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Student / Personal Email <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@dkut.ac.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reg Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Registration No.
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. C026-01-0000/2023"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                    />
                  </div>
                </div>

                {/* Year of Study */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Year of Study <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                    >
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Year 5">Year 5</option>
                      <option value="Postgraduate / Staff">Postgraduate / Staff</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-800 disabled:opacity-50 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing & Dispatching Receipt...</span>
                  </>
                ) : (
                  <>
                    <span>{memberType === "new" ? "Complete Registration" : "Update Member Record"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
