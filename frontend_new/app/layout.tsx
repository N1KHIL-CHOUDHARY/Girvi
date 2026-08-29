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

  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/icon.png",
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  verification: {
    google: "5ZYZFZoEHymcKOhBNcpQlLewaUzMs2HLFd9IOuW6KPM",
  },

  openGraph: {
    title: "GIRVI — Pawn & Pledge Management",
    description:
      "GIRVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",
    siteName: "GIRVI",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "GIRVI Logo",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "GIRVI — Pawn & Pledge Management",
    description:
      "GIRVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",
    images: ["/icon.png"],
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