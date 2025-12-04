"use client";

import Link from "next/link";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter";

export function Navbar() {
  return (
    <nav className="w-full border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Token Mint
            </Link>
            <Link
              href="/deploy"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Deploy Faucet
            </Link>
          </div>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}

