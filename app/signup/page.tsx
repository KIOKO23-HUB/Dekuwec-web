// app/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  User, 
  Mail, 
  Lock, 
  BookOpen, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  GraduationCap
} from "lucide-react";

const LOGO_URL = "https://i.postimg.cc/HLsfSHMm/Whats-App-Image-2026-09-03-at-09-49-04.jpg";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("Year 1");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Email & Password Registration
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please recheck.");
      return;
    }

    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      // Set Display Name in Firebase Auth
      await updateProfile(user, {
        displayName: fullName.trim(),
      });

      // Save initial document with Unregistered status until verification form is sent
      await setDoc(doc(db, "members", user.uid), {
        uid: user.uid,
        displayName: fullName.trim(),
        email: email.trim(),
        photoURL: "",
        course: course.trim(),
        year: year,
        status: "Unregistered",
        isConfigured: true,
        activities: [],
        createdAt: new Date().toISOString(),
      });

      router.push("/account");
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("This email is already registered. Please log in instead.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMsg("Please provide a valid email format.");
      } else {
        setErrorMsg(err.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Single Sign-On
  const handleGoogleSignup = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "members", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || "Club Member",
          email: user.email || "",
          photoURL: user.photoURL || "",
          course: "",
          year: "Year 1",
          status: "Unregistered",
          isConfigured: true,
          activities: [],
          createdAt: new Date().toISOString(),
        });
      }

      router.push("/account");
    } catch (err: any) {
      console.error("Google signup error:", err);
      setErrorMsg(err.message || "Google registration was interrupted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Main Form Container */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-emerald-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="group inline-block">
            <img
              src={LOGO_URL}
              alt="DEKUWEC Official Logo"
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-500/60 shadow-lg group-hover:scale-105 transition duration-300 bg-white"
            />
          </Link>
          <h1 className="mt-4 text-2xl font-black text-white tracking-tight">
            Sign Up
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Dedan Kimathi Wildlife & Environmental Club
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleEmailSignup} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Official Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kelvin Maina"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Student / Personal Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@dkut.ac.ke"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Academic Course
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. Mechanical Eng."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
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
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition appearance-none"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-950/50 transition duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Creating account..." : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-3 text-slate-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google Auth Option */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Sign up with Google</span>
        </button>

        {/* Link to Login */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>

      {/* Return Home Link */}
      <Link href="/" className="mt-6 text-xs text-slate-500 hover:text-emerald-400 font-medium transition">
        ← Return to Main Portal
      </Link>
    </div>
  );
}
