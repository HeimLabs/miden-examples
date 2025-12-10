"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Creator {
  walletAddress: string;
  name: string;
  bio: string | null;
}

export default function EmbedButtonPage({
  params,
}: {
  params: Promise<{ walletAddress: string }>;
}) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      try {
        const response = await fetch(`/api/creator/${walletAddress}`);
        if (response.ok) {
          const data = await response.json();
          setCreator(data);
        }
      } catch (err) {
        console.error("Error loading creator:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreator();
  }, [walletAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500/20 border-t-orange-500"></div>
      </div>
    );
  }

  if (!creator) {
    return null;
  }

  const creatorPageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${walletAddress}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-[300px]">
        <Link
          href={creatorPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 w-full justify-center"
        >
          <span className="text-xl sm:text-2xl">☕</span>
          <div className="flex flex-col items-start">
            <span className="leading-tight text-sm sm:text-base">Support {creator.name}</span>
            <span className="text-xs font-normal opacity-90">Buy Me a Coffee</span>
          </div>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
