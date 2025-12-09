"use client";

import { useEffect } from "react";
import type { MarketplaceAsset } from "../constants";

interface PurchaseModalProps {
  isOpen: boolean;
  asset: MarketplaceAsset | null;
  stage: "sending" | "minting" | "searching" | "ready" | "completed" | null;
  error: string | null;
  onClose: () => void;
  onConsume: () => void | Promise<void>;
  isConsuming: boolean;
}

export function PurchaseModal({
  isOpen,
  asset,
  stage,
  error,
  onClose,
  onConsume,
  isConsuming,
}: PurchaseModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const stages = [
    {
      id: "sending",
      label: "Sending payment",
      description: "Transferring MIDEN tokens...",
      status: stage === "sending" ? "active" : stage === "minting" || stage === "searching" || stage === "ready" || stage === "completed" ? "completed" : "pending",
    },
    {
      id: "minting",
      label: "Minting reward",
      description: "HLT tokens being minted...",
      status: stage === "minting" ? "active" : stage === "searching" || stage === "ready" || stage === "completed" ? "completed" : "pending",
    },
    {
      id: "searching",
      label: "Finding notes",
      description: "Searching for reward notes...",
      status: stage === "searching" ? "active" : stage === "ready" || stage === "completed" ? "completed" : "pending",
    },
    {
      id: "ready",
      label: "Ready",
      description: "Reward notes found",
      status: stage === "ready" ? "active" : stage === "completed" ? "completed" : "pending",
    },
  ];

  const getStatusIcon = (status: string) => {
    if (status === "completed") {
      return (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (status === "active") {
      return (
        <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-orange-400 border-t-transparent animate-spin"></div>
      );
    }
    return (
      <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-500"></div>
    );
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "text-green-400";
    if (status === "active") return "text-orange-400";
    return "text-gray-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-700/50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Purchase</h2>
              <p className="text-sm text-gray-400">Processing your transaction</p>
            </div>
            {(stage === "completed" || error) && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Product Summary */}
          <div className="flex gap-4 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30">
            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-700">
              <img
                src={asset.imageUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white mb-1 truncate">{asset.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">{asset.description}</p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-semibold text-orange-400">{asset.price} MIDEN</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Reward:</span>
                  <span className="font-semibold text-green-400">{asset.hltReward} HLT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Stages */}
          <div className="space-y-3">
            {stages.map((stageItem) => (
              <div key={stageItem.id} className="flex items-center gap-3">
                {getStatusIcon(stageItem.status)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${getStatusColor(stageItem.status)}`}>
                    {stageItem.label}
                  </p>
                  {stageItem.status === "active" && (
                    <p className="text-xs text-gray-500 mt-0.5">{stageItem.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          {(stage === "minting" || stage === "searching" || stage === "ready" || stage === "completed") && (
            <div className="pt-4 border-t border-gray-700/50">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-400">Paid</span>
                  <span className="text-sm font-semibold text-white">{asset.price} MIDEN</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-400">Reward</span>
                  <span className="text-sm font-semibold text-green-400">+{asset.hltReward} HLT</span>
                </div>
              </div>
            </div>
          )}

          {/* Consume Button */}
          {stage === "ready" && !isConsuming && (
            <button
              onClick={onConsume}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 font-semibold transition-all shadow-lg shadow-green-500/20"
            >
              Consume Reward Tokens
            </button>
          )}

          {isConsuming && (
            <div className="w-full px-6 py-3 bg-gray-700/50 text-gray-300 rounded-xl font-medium text-center">
              Consuming notes...
            </div>
          )}

          {/* Success Message */}
          {stage === "completed" && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-400">
                  Purchase completed successfully!
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Your {asset.hltReward} HLT tokens have been added to your vault.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-400">Error</p>
              </div>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
