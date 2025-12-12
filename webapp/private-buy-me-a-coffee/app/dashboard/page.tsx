"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@demox-labs/miden-wallet-adapter";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter";
import { Navbar } from "../components/Navbar";
import { CreatorProfileForm } from "../components/CreatorProfileForm";
import { PaymentsTable } from "../components/PaymentsTable";
import { Account, Address } from "@demox-labs/miden-sdk";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
  const [embedLink, setEmbedLink] = useState<string>("");
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);

  // Automatically get or create CDP account when wallet connects
  useEffect(() => {
    const initializeCdpAccount = async () => {
      if (address && connected) {
        try {

          const account = Address.fromBech32(address)
          console.log(account.accountId().toString());

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
            console.log("CDP account initialized:", data.evmAddress);
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

  useEffect(() => {
    if (address && typeof window !== 'undefined') {
      const origin = window.location.origin;
      setPublicLink(`${origin}/c/${address}`);
      setEmbedLink(`${origin}/embed/${address}`);
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
          <div className="mb-8 space-y-4">
            <div className="p-5 bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl backdrop-blur-sm">
              <p className="text-sm text-gray-400 mb-2 font-medium">Miden Wallet Address</p>
              <p className="text-sm font-mono text-orange-400 break-all">
                {address}
              </p>
            </div>
            {evmAddress && (
              <div className="p-5 bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl backdrop-blur-sm">
                <p className="text-sm text-gray-400 mb-2 font-medium">EVM Wallet Address</p>
                <p className="text-sm font-mono text-blue-400 break-all">
                  {evmAddress}
                </p>
              </div>
            )}
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

            {/* Share & Embed Section */}
            <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-3xl p-8 sm:p-10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-3xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Share & Embed</h2>
                </div>

                {/* Public Link */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Your Public Link
                  </label>
                  <p className="text-gray-300 mb-3 text-sm">
                    Share this link with your supporters:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={publicLink}
                      readOnly
                      className="flex-1 px-5 py-3 bg-gray-900/70 border border-gray-700/50 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(publicLink);
                        setSuccessMessage("Link copied to clipboard!");
                        setTimeout(() => setSuccessMessage(null), 3000);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                    >
                      Copy Link
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center space-x-2 mt-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Your supporters can visit this link to send you private HLT payments</span>
                  </p>
                </div>

                {/* Embed Button */}
                <div className="pt-6 border-t border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-200">
                      Embed Button
                    </label>
                    <button
                      onClick={() => setShowEmbedCode(!showEmbedCode)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {showEmbedCode ? "Hide" : "Show"} Code
                    </button>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm">
                    Add this button to your website or blog:
                  </p>

                  {showEmbedCode && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                          Embed Code (iframe)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <textarea
                            readOnly
                            value={`<iframe src="${embedLink}" width="300" height="80" frameborder="0" style="border: none; border-radius: 12px;"></iframe>`}
                            className="flex-1 px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                            rows={3}
                            onClick={(e) => e.currentTarget.select()}
                          />
                          <button
                            onClick={() => {
                              const code = `<iframe src="${embedLink}" width="300" height="80" frameborder="0" style="border: none; border-radius: 12px;"></iframe>`;
                              navigator.clipboard.writeText(code);
                              setSuccessMessage("Embed code copied!");
                              setTimeout(() => setSuccessMessage(null), 3000);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                          >
                            Copy Code
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                          Embed Link
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={embedLink}
                            readOnly
                            className="flex-1 px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            onClick={(e) => e.currentTarget.select()}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(embedLink);
                              setSuccessMessage("Embed link copied!");
                              setTimeout(() => setSuccessMessage(null), 3000);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="pt-4 border-t border-gray-700/50">
                        <p className="text-sm font-semibold text-gray-200 mb-3">Preview:</p>
                        <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 flex items-center justify-center overflow-hidden">
                          <div className="w-full max-w-[300px] overflow-hidden rounded-xl">
                            <iframe
                              src={embedLink}
                              width="300"
                              height="80"
                              frameBorder="0"
                              style={{ border: 'none', borderRadius: '12px', maxWidth: '100%', overflow: 'hidden' }}
                              className="rounded-xl"
                              scrolling="no"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
