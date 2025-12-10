"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import { SupportCard } from "../../components/SupportCard";

interface Creator {
  walletAddress: string;
  name: string;
  bio: string | null;
}

export default function CreatorPage({
  params,
}: {
  params: Promise<{ walletAddress: string }>;
}) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setWalletAddress(resolvedParams.walletAddress);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!walletAddress) return;

    const loadCreator = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/creator/${walletAddress}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Creator not found");
          } else {
            throw new Error("Failed to load creator");
          }
          return;
        }

        const data = await response.json();
        setCreator(data);
      } catch (err: any) {
        setError(err.message || "Failed to load creator");
        console.error("Error loading creator:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreator();
  }, [walletAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-slate-100">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 mx-auto"></div>
            <p className="text-gray-400 text-lg">Loading creator profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-slate-100">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-red-700/50 rounded-3xl p-12 text-center backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 rounded-3xl"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-red-400">
                Creator Not Found
              </h1>
              <p className="text-gray-300 mb-8 text-lg">
                {error || "This creator profile does not exist."}
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl"
              >
                Return to home
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-slate-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Creator Profile */}
        <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-3xl p-10 sm:p-12 mb-10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
                ☕
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  {creator.name}
                </h1>
                <p className="text-sm text-gray-400 font-mono">
                  {creator.walletAddress}
                </p>
              </div>
            </div>
            {creator.bio && (
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <p className="text-gray-200 text-lg sm:text-xl leading-relaxed whitespace-pre-wrap">
                  {creator.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Support Card */}
        <div className="max-w-2xl mx-auto">
          <SupportCard creatorAddress={creator.walletAddress} />
        </div>
      </main>
    </div>
  );
}
