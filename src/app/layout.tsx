import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "War Scanner — Global Conflict Feed",
  description:
    "Near-real-time global conflict event monitor. Aggregates, deduplicates, and scores reports from GDELT and ReliefWeb. No LLM inference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50 text-gray-900`}>
        {/* Nav */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">⚡ War Scanner</span>
            </Link>
            <nav className="flex gap-5 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-gray-900">Feed</Link>
              <Link href="/brief" className="hover:text-gray-900">Brief</Link>
              <Link href="/methodology" className="hover:text-gray-900">Methodology</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 mt-16 py-6">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>
              War Scanner aggregates links from public sources (GDELT, ReliefWeb).
              No full article text is stored or reproduced. All source links open
              the original publisher.{" "}
              <Link href="/methodology" className="underline">Methodology</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
