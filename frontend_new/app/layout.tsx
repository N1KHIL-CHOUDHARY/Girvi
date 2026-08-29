import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "GIRVI",

  title: {
    default: "GIRVI — Pawn & Pledge Management",
    template: "%s | GIRVI",
  },

  description:
    "GIRVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",

  verification: {
    google: "5ZYZFZoEHymcKOhBNcpQlLewaUzMs2HLFd9IOuW6KPM",
  },

  openGraph: {
    title: "GIRVI — Pawn & Pledge Management",
    description:
      "GIRVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",
    siteName: "GIRVI",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "GIRVI — Pawn & Pledge Management",
    description:
      "GIRVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#14181F]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}