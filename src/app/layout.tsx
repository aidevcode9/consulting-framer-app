import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Consulting Framer - Visual Engagement Builder",
  description:
    "AI-powered visual engagement builder for consultants. Frame engagements faster with intelligent discovery, strategic frameworks, and automated deliverables.",
  keywords: [
    "consulting",
    "engagement framing",
    "proposal builder",
    "SWOT analysis",
    "Porter five forces",
    "McKinsey 7-S",
    "consulting tools",
    "AI consulting",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
