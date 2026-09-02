// components/SupportSection.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  LifeBuoy, 
  MapPin, 
  Clock, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HelpCircle
} from "lucide-react";

export default function SupportSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Save message directly to Firestore 'contact_messages' collection
      await addDoc(collection(db, "contact_messages"), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim() || "General Enquiry",
        message: message.trim(),
        createdAt: serverTimestamp(),
        status: "unread",
      });

      // 2. Dispatch automated confirmation emails (Club alert + Inquirer confirmation)
      const emailResponse = await fetch("/api/notify-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim() || "General Enquiry",
          message: message.trim(),
        }),
      });

      if (!emailResponse.ok) {
        console.warn("Message saved in database, but confirmation email dispatch failed.");
      }

      setSuccess(true);
      // Reset form fields
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("Contact form error:", err);
      setError("Unable to send your message right now. Please try reaching out directly via email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="support-section" className="py-14 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200">
            <LifeBuoy className="h-3.5 w-3.5 text-emerald-700" />
            Support & Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Get in Touch with DEKUWEC
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Have questions about memberships, outdoor gear requirements, or upcoming conservation drives? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Info & Meeting Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Meeting Schedule Box */}
            <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                Weekly Meeting Hours
              </h3>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Join our regular physical sessions where we review weekly nature snaps, conduct debates, and confirm logistics for upcoming weekend hikes.
              </p>

              <div className="mt-6 space-y-3 text-xs sm:text-sm border-t border-emerald-800/80 pt-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Dedan Kimathi University of Technology, Main Campus, Resource Centre</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Every Wednesday from 4:00 PM – 5:30 PM</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Points */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <h4 className="font-bold text-slate-900 text-base">Direct Channels</h4>
              
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Official Email</p>
                  <a 
                    href="mailto:wildlifeandenvironmentalclub@dkut.ac.ke" 
                    className="text-sm font-semibold text-slate-800 hover:text-emerald-700 transition break-all"
                  >
                    wildlifeandenvironmentalclub@dkut.ac.ke
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Club Secretariat</p>
                  <p className="text-sm text-slate-700 font-medium">
                    Student Activities Desk, Office of the Dean of Students
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Send Us a Direct Note</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Our executive board will review and reply to your student email.
            </p>

            {success && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center animate-in fade-in">
                <CheckCircle2 className="h-9 w-9 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base">Message Sent Successfully!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Thank you for reaching out. A confirmation receipt has been sent to your email, and our board will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-xs font-semibold text-emerald-800 underline underline-offset-2"
                >
                  Send another message
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs sm:text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Your Name <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Victor Mutua"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@dkut.ac.ke"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inquiry about upcoming hike gear"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Message Details <span className="text-emerald-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your question, suggestion, or partnership request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-800 disabled:opacity-50 transition mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending & Notifying...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
