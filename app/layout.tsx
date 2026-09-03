// app/layout.tsx
"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const publicPaths = ["/login", "/signup"];

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isPublicPath = publicPaths.includes(pathname);

      if (!user && !isPublicPath) {
        // Not logged in -> send to /login
        router.replace("/login");
      } else if (user && isPublicPath) {
        // Already logged in and trying to access /login or /signup -> redirect to home
        router.replace("/");
      } else {
        // Allowed: Logged in user visiting protected routes (/, /account, etc.)
        // OR Unauthenticated user visiting /login or /signup
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Loading screen while verifying member session
  if (checkingAuth && !["/login", "/signup"].includes(pathname)) {
    return (
      <html lang="en">
        <body className="bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-4">
            <img
              src="https://i.postimg.cc/HLsfSHMm/Whats-App-Image-2026-09-03-at-09-49-04.jpg"
              alt="DEKUWEC Logo"
              className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-500 animate-pulse bg-white"
            />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Verifying Member Session...
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
