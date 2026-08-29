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
  applicationName: "GRIVI",

  title: {
    default: "GRIVI — Pawn & Pledge Management",
    template: "%s | GRIVI",
  },

  description:
    "GRIVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",

  verification: {
    google: "5ZYZFZoEHymcKOhBNcpQlLewaUzMs2HLFd9IOuW6KPM",
  },

  openGraph: {
    title: "GRIVI — Pawn & Pledge Management",
    description:
      "GRIVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",
    siteName: "GRIVI",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "GRIVI — Pawn & Pledge Management",
    description:
      "GRIVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",
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