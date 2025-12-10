"use client";

import Link from "next/link";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter";

export function Navbar() {
  return (
    <nav className="w-full border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-10">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent hover:from-orange-300 hover:to-orange-500 transition-all duration-300"
            >
              ☕ Private Coffee
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-orange-400 transition-colors font-medium relative group"
            >
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
          <div className="flex items-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

