"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useWallet } from "@demox-labs/miden-wallet-adapter";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter";
import { trimAddress } from "../utils";
import { Address } from "@demox-labs/miden-sdk";

export function Navbar() {
  const { connected, address } = useWallet();
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Automatically get or create CDP account when wallet connects
  useEffect(() => {
    const initializeCdpAccount = async () => {
      if (address && connected) {
        try {
          const account = Address.fromBech32(address)
          // Call API to get or create CDP account
          const response = await fetch("/api/cdp/account", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              midenAddress: account.accountId().toString(),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setEvmAddress(data.evmAddress);
          } else {
            console.error("Failed to initialize CDP account");
          }
        } catch (error) {
          console.error("Error initializing CDP account:", error);
        }
      } else {
        setEvmAddress(null);
      }
    };

    initializeCdpAccount();
  }, [address, connected]);

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
          <div className="flex items-center space-x-4">
            {connected && address && evmAddress && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-gray-700 rounded-xl transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-200 font-medium">{trimAddress(address)}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm z-50">
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Miden Wallet</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-mono text-orange-400 break-all">{address}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(address);
                              setShowDropdown(false);
                            }}
                            className="ml-2 p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy Miden address"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-gray-700"></div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">EVM Wallet</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-mono text-blue-400 break-all">{evmAddress}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(evmAddress);
                              setShowDropdown(false);
                            }}
                            className="ml-2 p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy EVM address"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <WalletMultiButton />
          </div>
        </div>
      </div>
      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
}

