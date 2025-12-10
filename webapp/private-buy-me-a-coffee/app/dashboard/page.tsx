"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@demox-labs/miden-wallet-adapter";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter";
import { Navbar } from "../components/Navbar";
import { CreatorProfileForm } from "../components/CreatorProfileForm";
import { PaymentsTable } from "../components/PaymentsTable";

export default function DashboardPage() {
  const { connected, address } = useWallet();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-slate-100">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-3xl p-12 text-center backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-3xl"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Please connect your Miden wallet to access the dashboard
              </p>
              <WalletMultiButton />
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
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your profile and view received payments
          </p>
        </div>

        {address && (
          <div className="mb-8 p-5 bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-2 font-medium">Wallet Address</p>
            <p className="text-sm font-mono text-orange-400 break-all">
              {address}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-gray-800/30 p-1.5 rounded-xl border border-gray-700/50">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${activeTab === "profile"
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
              : "text-gray-400 hover:text-gray-300"
              }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${activeTab === "payments"
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
              : "text-gray-400 hover:text-gray-300"
              }`}
          >
            Payments
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700/50 rounded-xl backdrop-blur-sm animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-400 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-8">
            <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-3xl p-8 sm:p-10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-3xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                </div>
                <CreatorProfileForm
                  initialName={profile?.name || ""}
                  initialBio={profile?.bio || ""}
                  onSubmit={handleSaveProfile}
                  isSubmitting={isLoading}
                />
              </div>
            </div>

            {/* Public Link */}
            <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-3xl p-8 sm:p-10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-3xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Your Public Link</h2>
                </div>
                <p className="text-gray-300 mb-4 text-lg">
                  Share this link with your supporters:
                </p>
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="text"
                    value={publicLink}
                    readOnly
                    className="flex-1 px-5 py-3 bg-gray-900/70 border border-gray-700/50 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-400 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Your supporters can visit this link to send you private HLT payments</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-3xl p-8 sm:p-10 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-3xl"></div>
            <div className="relative">
              <PaymentsTable creatorAddress={address || ""} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
