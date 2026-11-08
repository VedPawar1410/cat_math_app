import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAT-Fast | Mental Math Trainer",
  description: "Sharpen your mental math skills for CAT and beyond. Practice addition, subtraction, percentages, and ratio comparisons with adaptive difficulty.",
  keywords: ["CAT", "mental math", "math trainer", "percentages", "ratios", "competitive exams"],
  authors: [{ name: "CAT-Fast" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CAT-Fast",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* PWA & iOS Specific Meta Tags - v2 cache bust */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CAT-Fast" />
        {/* Prevent iOS from styling phone numbers as links */}
        <meta name="format-detection" content="telephone=no" />
        {/* Theme color for moody dark aesthetic */}
        <meta name="msapplication-TileColor" content="#121212" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={`${outfit.variable} ${jetbrains.variable} antialiased after-hours-bg safe-area-padding`}
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
