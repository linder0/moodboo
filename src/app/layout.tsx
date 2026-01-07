import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creative Canvas — Moodboard to Brief",
  description: "Drop creative references into a board and get a coherent, client-ready photoshoot brief in minutes.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased min-h-screen`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
