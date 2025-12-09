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
  title: "Miden Counter - Increment Counter on Miden Blockchain",
  description: "A simple web application for interacting with a counter smart contract on the Miden rollup. Connect your wallet and increment the counter value.",
  keywords: ["Miden", "blockchain", "counter", "smart contract", "web3", "wallet"],
  authors: [{ name: "Heimlabs" }],
  openGraph: {
    title: "Miden Counter",
    description: "Increment counter on Miden blockchain",
    type: "website",
    images: [
      {
        url: "/counter-icon.png",
        width: 512,
        height: 512,
        alt: "Miden Counter Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Miden Counter",
    description: "Increment counter on Miden blockchain",
    images: ["/counter-icon.png"],
  },
  icons: {
    icon: [
      { url: "/counter-icon.png", type: "image/png" },
      { url: "/counter-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/counter-icon.png",
    shortcut: "/counter-icon.png",
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
