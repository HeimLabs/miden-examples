"use client";

import { useWallet } from "@demox-labs/miden-wallet-adapter";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter";
import { Navbar } from "./components/Navbar";
import { trimAddress } from "./utils";
import Link from "next/link";

export default function Home() {
  const { connected, address } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-slate-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-block mb-4">
            <span className="text-6xl sm:text-7xl">☕</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              Private Buy Me a Coffee
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Support creators with{" "}
            <span className="text-orange-400 font-semibold">private</span> HLT token payments
            <br className="hidden sm:block" />
            on the Miden blockchain
          </p>
        </div>

        {/* How it works cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-3xl p-8 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/5 group-hover:to-orange-600/5 rounded-3xl transition-all duration-300"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-orange-500/20">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">For Creators</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect your Miden wallet and create your profile. Share your unique link with supporters to receive private HLT payments.
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-3xl p-8 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/5 group-hover:to-orange-600/5 rounded-3xl transition-all duration-300"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-orange-500/20">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">For Supporters</h3>
              <p className="text-gray-400 leading-relaxed">
                Visit a creator's page and send private HLT token payments (minimum 10 HLT). All transactions are private on the Miden blockchain.
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-3xl p-8 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/5 group-hover:to-orange-600/5 rounded-3xl transition-all duration-300"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-orange-500/20">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Privacy First</h3>
              <p className="text-gray-400 leading-relaxed">
                All payments are private transactions. Creators can consume received notes in their dashboard to add tokens to their vault.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-3xl p-10 sm:p-12 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-3xl"></div>
          <div className="relative">
            {!connected ? (
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Ready to get started?
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Connect your Miden wallet to create your profile or support creators
                </p>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome back! 👋
                  </h2>
                  <p className="text-gray-300">
                    Your wallet is connected and ready
                  </p>
                </div>

                <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-sm text-gray-400 mb-2 font-medium">Connected Wallet</p>
                  <p className="text-sm font-mono text-orange-400 break-all mb-1">
                    {address}
                  </p>
                  <p className="text-xs text-gray-500">
                    Display: <span className="text-gray-400">{trimAddress(address || "")}</span>
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="block w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl font-bold text-lg text-center shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create or edit my page →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
