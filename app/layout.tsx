import type { Metadata, Viewport } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stonk5.fyi"),
  title: "stonk5.fyi — STONK5 payouts, tracked live",
  description:
    "Unofficial community tracker for the STONK5 Top 5 index on StonkFun: payout countdown, engine wallet, market data and burns.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "stonk5.fyi — STONK5 payouts, tracked live",
    description:
      "Unofficial community tracker for the STONK5 Top 5 index on StonkFun: payout countdown, engine wallet, market data and burns.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#060913",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
