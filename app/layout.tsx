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

  // Allow public paths AND any path starting with /admin without Firebase forced login
  const isPublicOrAdmin = pathname.startsWith("/login") || 
                          pathname.startsWith("/signup") || 
                          pathname.startsWith("/admin");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isPublicPath = pathname === "/login" || pathname === "/signup";
      const isAdminPath = pathname.startsWith("/admin");

      if (!user && !isPublicOrAdmin) {
        // Not logged in and trying to access protected routes -> send to /login
        router.replace("/login");
      } else if (user && isPublicPath) {
        // Already logged in and trying to access /login or /signup -> redirect to home
        router.replace("/");
      } else {
        // Allowed: Logged in user visiting protected routes, OR accessing admin/public paths
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router, isPublicOrAdmin]);

  // Loading screen while verifying member session (exempting admin and public routes)
  if (checkingAuth && !isPublicOrAdmin) {
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
