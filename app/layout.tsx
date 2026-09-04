// app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "DEKUWEC - Dedan Kimathi Wildlife & Environmental Club",
  description: "Official portal for DEKUWEC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-slate-950 text-slate-100 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
