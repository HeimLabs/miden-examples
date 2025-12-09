import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProviders } from "./components/WalletProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Miden Marketplace - Buy Digital Assets with MIDEN Tokens",
  description: "Purchase digital assets using MIDEN tokens and receive HLT tokens as rewards on the Miden blockchain marketplace.",
  keywords: ["Miden", "blockchain", "marketplace", "NFT", "tokens", "MIDEN", "HLT", "web3", "wallet"],
  authors: [{ name: "Heimlabs" }],
  openGraph: {
    title: "Miden Marketplace",
    description: "Buy digital assets with MIDEN tokens on Miden blockchain",
    type: "website",
    images: [
      {
        url: "/marketplace-icon.png",
        width: 512,
        height: 512,
        alt: "Miden Marketplace Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Miden Marketplace",
    description: "Buy digital assets with MIDEN tokens on Miden blockchain",
    images: ["/marketplace-icon.png"],
  },
  icons: {
    icon: [
      { url: "/marketplace-icon.png", type: "image/png" },
      { url: "/marketplace-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/marketplace-icon.png",
    shortcut: "/marketplace-icon.png",
  },
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
      >
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
