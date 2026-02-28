import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PanelProvider } from "@/lib/context/PanelContext";
import { OverlayNav } from "@/components/nav/OverlayNav";
import { CommandPalette } from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://warspy.vercel.app";

export const metadata: Metadata = {
  title: "Warspy — Israel–Iran Conflict Monitor",
  description:
    "Real-time Israel–Iran conflict theater: interactive 3D globe, live event feed, social stream, and historical context. Powered by GDELT, ReliefWeb, RSS, and Reddit.",
  openGraph: {
    title: "Warspy — Conflict Intelligence",
    description: "Real-time Israel–Iran conflict monitor · 3D globe · Live events · Social feed",
    images: [
      {
        url: `${appUrl}/api/og?title=Warspy+%E2%80%94+Conflict+Intelligence&sub=Real-time+Israel%E2%80%93Iran+conflict+monitor`,
        width: 1200,
        height: 630,
        alt: "Warspy conflict monitor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Warspy — Conflict Intelligence",
    description: "Real-time Israel–Iran conflict monitor",
    images: [`${appUrl}/api/og?title=Warspy+%E2%80%94+Conflict+Intelligence`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#030508",
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
          <CommandPalette />
          {children}
        </PanelProvider>
      </body>
    </html>
  );
}
