import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Lumora — AI product photos & videos for Shopify",
    template: "%s · Lumora",
  },
  description:
    "Turn a single product photo into studio-grade images and 10-second videos. Analyze competitors, generate better visuals, and export straight to Shopify.",
  openGraph: {
    title: "Lumora — AI product photos & videos for Shopify",
    description:
      "Studio-grade product photos, cinematic product videos, and competitor analysis — exported to Shopify in one click.",
    siteName: "Lumora",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${hanken.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
