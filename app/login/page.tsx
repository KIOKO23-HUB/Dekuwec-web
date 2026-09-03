// app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

const LOGO_URL = "https://i.postimg.cc/HLsfSHMm/Whats-App-Image-2026-09-03-at-09-49-04.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setErrorMsg("Invalid email or password. Please check your details.");
      } else if (err.code === "auth/too-many-requests") {
        setErrorMsg("Too many attempts. Please try again later.");
      } else {
        setErrorMsg(err.message || "Failed to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
          status: "Pending",
          isConfigured: true,
          activities: [],
          createdAt: new Date().toISOString(),
        });
      }

      router.push("/");
    } catch (err: any) {
      console.error("Google login error:", err);
      setErrorMsg(err.message || "Google sign-in was interrupted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-emerald-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="group inline-block">
            <img
              src={LOGO_URL}
              alt="DEKUWEC Logo"
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-500/60 shadow-lg group-hover:scale-105 transition duration-300 bg-white"
            />
          </Link>
          <h1 className="mt-4 text-2xl font-black text-white tracking-tight">
            Log In
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Dedan Kimathi Wildlife & Environmental Club
          </p>
        </div>

        {errorMsg && (
          <div className="mt-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-950/50 transition duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Logging in..." : (
              <>
                <span>Log In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-3 text-slate-500 font-medium">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="mt-8 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-emerald-400 font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <Link href="/" className="mt-6 text-xs text-slate-500 hover:text-emerald-400 font-medium transition">
        ← Return to Main Portal
      </Link>
    </div>
  );
}
