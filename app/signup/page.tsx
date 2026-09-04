// app/signup/page.tsx
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

const LOGO_URL = "https://i.postimg.cc/HLsfSHMm/Whats-App-Image-2026-09-03-at-09-49-04.jpg";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6 z-10">
        <Link href="/" className="group inline-block">
          <img
            src={LOGO_URL}
            alt="DEKUWEC Logo"
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-500/60 shadow-lg group-hover:scale-105 transition duration-300 bg-white"
          />
        </Link>
        <h1 className="mt-4 text-2xl font-black text-white tracking-tight">
          Create Member Account
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Dedan Kimathi Wildlife & Environmental Club
        </p>
      </div>

      {/* Clerk Drop-in Sign Up Form */}
      <div className="relative z-10">
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          fallbackRedirectUrl="/account"
          appearance={{
            elements: {
              card: "bg-slate-900/90 backdrop-blur-xl border border-emerald-900/50 rounded-3xl shadow-2xl p-6 sm:p-8",
              headerTitle: "text-white text-xl font-black",
              headerSubtitle: "text-slate-400 text-xs",
              socialButtonsBlockButton:
                "bg-slate-950 border border-slate-800 text-white hover:bg-slate-800 transition rounded-xl",
              socialButtonsBlockButtonText: "text-slate-200 font-semibold text-xs",
              dividerLine: "bg-slate-800",
              dividerText: "text-slate-500 text-xs uppercase tracking-wider",
              formFieldLabel: "text-slate-300 text-[11px] font-bold uppercase tracking-wider",
              formFieldInput:
                "bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm",
              formButtonPrimary:
                "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl py-3 shadow-lg shadow-emerald-950/50 transition duration-200",
              footerActionText: "text-slate-400 text-xs",
              footerActionLink: "text-emerald-400 hover:underline font-bold text-xs",
              identityPreviewText: "text-white text-xs",
              identityPreviewEditButton: "text-emerald-400",
            },
          }}
        />
      </div>

      {/* Return Home Link */}
      <Link
        href="/"
        className="mt-6 text-xs text-slate-500 hover:text-emerald-400 font-medium transition z-10"
      >
        ← Return to Main Portal
      </Link>
    </div>
  );
}
