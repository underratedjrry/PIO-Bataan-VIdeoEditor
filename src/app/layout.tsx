import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ConnectionLostModal } from "@/components/ConnectionLostModal";
import "./globals.css";

// Matches the reference government portal's typeface (self-hosted at
// build time by next/font - no external font request at runtime).
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PIO Bataan - VE PMIS",
  description: "Project management for video editing tasks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" theme="system" />
        <ConnectionLostModal />
      </body>
    </html>
  );
}
