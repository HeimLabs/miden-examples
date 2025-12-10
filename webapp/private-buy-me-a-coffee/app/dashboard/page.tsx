"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@demox-labs/miden-wallet-adapter";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter";
import { Navbar } from "../components/Navbar";
import { CreatorProfileForm } from "../components/CreatorProfileForm";
import { PaymentsTable } from "../components/PaymentsTable";
import { trimAddress } from "../utils";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { connected, address } = useWallet();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "payments">("profile");
  const [profile, setProfile] = useState<{
    name: string;
    bio: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [publicLink, setPublicLink] = useState<string>("");

  useEffect(() => {
    if (address) {
      setPublicLink(`${window.location.origin}/c/${address}`);
    }
  }, [address]);

  const handleSaveProfile = async (name: string, bio: string | null) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          name,
          bio,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      const savedProfile = await response.json();
      setProfile({
        name: savedProfile.name,
        bio: savedProfile.bio,
      });
      setSuccessMessage("Profile saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicLink);
    setSuccessMessage("Link copied to clipboard!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-8 text-center">
            <p className="text-gray-300 mb-6">
              Please connect your Miden wallet to access the dashboard
            </p>
            <WalletMultiButton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Creator Dashboard</h1>
          <p className="text-gray-400">
            Manage your profile and view received payments
          </p>
        </div>

        {address && (
          <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">Wallet Address</p>
            <p className="text-sm font-mono text-orange-400 break-all">
              {address}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "profile"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-gray-400 hover:text-gray-300"
              }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "payments"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-gray-400 hover:text-gray-300"
              }`}
          >
            Payments
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">
                Edit Profile
              </h2>
              <CreatorProfileForm
                initialName={profile?.name || ""}
                initialBio={profile?.bio || ""}
                onSubmit={handleSaveProfile}
                isSubmitting={isLoading}
              />
            </div>

            {/* Public Link */}
            <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">
                Your Public Link
              </h2>
              <p className="text-sm text-gray-400 mb-3">
                Share this link with your supporters:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={publicLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Your supporters can visit this link to send you private HLT payments
              </p>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-6">
            <PaymentsTable creatorAddress={address || ""} />
          </div>
        )}
      </main>
    </div>
  );
}
