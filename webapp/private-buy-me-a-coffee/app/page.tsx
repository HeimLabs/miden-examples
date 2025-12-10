"use client";

import { useWallet } from "@demox-labs/miden-wallet-adapter";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter";
import { Navbar } from "./components/Navbar";
import { trimAddress } from "./utils";
import Link from "next/link";

export default function Home() {
  const { connected, address } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Private Buy Me a Coffee
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Support creators with private HLT token payments using Miden blockchain.
            Connect your wallet to create your profile or support creators.
          </p>
        </div>

        <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">
            How it works
          </h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">For Creators</p>
                <p className="text-sm text-gray-400">
                  Connect your Miden wallet and create your profile. Share your
                  unique link with supporters to receive private HLT payments.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-medium">For Supporters</p>
                <p className="text-sm text-gray-400">
                  Visit a creator's page and send private HLT token payments
                  (minimum 10 HLT). All transactions are private on the Miden
                  blockchain.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-medium">Privacy First</p>
                <p className="text-sm text-gray-400">
                  All payments are private transactions. Creators can consume
                  received notes in their dashboard to add tokens to their vault.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-8">
          {!connected ? (
            <div className="text-center">
              <p className="text-gray-300 mb-6">
                Connect your Miden wallet to get started
              </p>
              <div className="flex justify-center">
                <WalletMultiButton />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-gray-900/30 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
                <p className="text-sm font-mono text-orange-400 break-all">
                  {address}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Display: {trimAddress(address || "")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="flex-1 px-6 py-3 bg-transparent border-2 border-orange-600 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors text-center"
                >
                  Create or edit my page
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
