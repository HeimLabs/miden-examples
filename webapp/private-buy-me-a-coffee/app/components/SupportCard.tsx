"use client";

import { useState } from "react";
import { useWallet, MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter";
import { sendPrivatePayment } from "../utils";
import { MIN_PAYMENT_AMOUNT, HLT_FAUCET_ID } from "../constants";

interface SupportCardProps {
  creatorAddress: string;
}

export function SupportCard({ creatorAddress }: SupportCardProps) {
  const { connected, address, wallet } = useWallet();
  const [amount, setAmount] = useState<string>(MIN_PAYMENT_AMOUNT.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const isValidAmount = amountNum >= MIN_PAYMENT_AMOUNT;
  const canPay = connected && address && isValidAmount && !isProcessing;

  const handlePay = async () => {
    if (!connected || !address || !wallet) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isValidAmount) {
      setError(`Minimum payment is ${MIN_PAYMENT_AMOUNT} HLT`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    try {
      const adapter = wallet.adapter as MidenWalletAdapter;
      const hash = await sendPrivatePayment(
        adapter,
        address,
        creatorAddress,
        amountNum
      );
      setTxHash(hash);
    } catch (err: any) {
      const message = err.message || "Failed to send payment";
      setError(message);
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-3xl p-8 sm:p-10 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white">
            Support this creator
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-semibold text-gray-200 mb-3"
            >
              Amount (HLT)
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                min={MIN_PAYMENT_AMOUNT}
                step="1"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || parseFloat(val) >= 0) {
                    setAmount(val);
                    setError(null);
                  }
                }}
                disabled={isProcessing}
                className="w-full px-5 py-4 bg-gray-900/70 border border-gray-700/50 rounded-xl text-white text-lg font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 disabled:opacity-50 transition-all duration-200"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                HLT
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-400 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Minimum {MIN_PAYMENT_AMOUNT} HLT. Paid via private Miden transaction.</span>
            </p>
            {amount && amountNum < MIN_PAYMENT_AMOUNT && (
              <p className="mt-2 text-sm text-red-400 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Amount must be at least {MIN_PAYMENT_AMOUNT} HLT</span>
              </p>
            )}
          </div>

          {!connected && (
            <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-yellow-400 text-sm font-medium">
                  Connect your wallet to send a payment
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="p-5 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400/30 border-t-blue-400"></div>
                <p className="text-blue-400 text-sm font-medium">
                  Creating private transaction...
                </p>
              </div>
            </div>
          )}

          {txHash && (
            <div className="p-5 bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-green-400 text-sm font-bold mb-2">
                    Private payment sent successfully! 🎉
                  </p>
                  <p className="text-xs text-gray-400 break-all font-mono mb-3 bg-gray-900/50 p-2 rounded">
                    Note ID: {txHash}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    The private note has been sent to the creator. They will see this payment in their dashboard and can consume it to add tokens to their vault.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={!canPay}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-xl disabled:cursor-not-allowed font-bold text-lg transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              "Pay privately with Miden"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
