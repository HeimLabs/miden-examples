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
  title: "Miden Token Mint - Deploy Faucets & Mint Tokens",
  description: "Deploy token faucets and mint fungible tokens (ERC20) on the Miden rollup. Create your own tokens or mint from existing faucets.",
  keywords: ["Miden", "blockchain", "tokens", "ERC20", "faucet", "mint", "web3", "wallet"],
  authors: [{ name: "Heimlabs" }],
  openGraph: {
    title: "Miden Token Mint",
    description: "Deploy faucets and mint tokens on Miden blockchain",
    type: "website",
    images: [
      {
        url: "/token-icon.png",
        width: 512,
        height: 512,
        alt: "Miden Token Mint Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Miden Token Mint",
    description: "Deploy faucets and mint tokens on Miden blockchain",
    images: ["/token-icon.png"],
  },
  icons: {
    icon: [
      { url: "/token-icon.png", type: "image/png" },
      { url: "/token-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/token-icon.png",
    shortcut: "/token-icon.png",
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
