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
  params: { walletAddress: string };
}) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCreator = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/creator/${params.walletAddress}`);

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

    if (params.walletAddress) {
      loadCreator();
    }
  }, [params.walletAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading creator profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-semibold mb-4 text-red-400">
              Creator Not Found
            </h1>
            <p className="text-gray-400 mb-6">
              {error || "This creator profile does not exist."}
            </p>
            <a
              href="/"
              className="text-orange-400 hover:text-orange-300 underline"
            >
              Return to home
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Creator Profile */}
        <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4 text-orange-400">
            {creator.name}
          </h1>
          {creator.bio && (
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {creator.bio}
            </p>
          )}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              Wallet: <span className="font-mono text-gray-400">{creator.walletAddress}</span>
            </p>
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
