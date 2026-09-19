import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — STONK5 price, market cap & burns`,
  description:
    "Live price, market cap, liquidity, and burn tracking for the STONK5 token on Solana (stonkfun.xyz).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
