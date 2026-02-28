import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PanelProvider } from "@/lib/context/PanelContext";
import { OverlayNav } from "@/components/nav/OverlayNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Warspy — Israel–Iran Conflict Monitor",
  description:
    "Real-time Israel–Iran conflict theater: interactive 3D globe, live event feed, social stream, and historical context. Powered by GDELT, ReliefWeb, RSS, and Reddit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "var(--bg)", color: "var(--text-primary)" }}
      >
        <PanelProvider>
          <OverlayNav />
          {children}
        </PanelProvider>
      </body>
    </html>
  );
}
