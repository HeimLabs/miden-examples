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
    <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-6">
      <h3 className="text-xl font-semibold mb-4 text-orange-400">
        Support this creator
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Amount (HLT)
          </label>
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
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum {MIN_PAYMENT_AMOUNT} HLT. Paid via private Miden transaction.
          </p>
          {amount && amountNum < MIN_PAYMENT_AMOUNT && (
            <p className="mt-1 text-xs text-red-400">
              Amount must be at least {MIN_PAYMENT_AMOUNT} HLT
            </p>
          )}
        </div>

        {!connected && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Connect your wallet to send a payment
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <p className="text-blue-400 text-sm">
                Creating private transaction...
              </p>
            </div>
          </div>
        )}

        {txHash && (
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm font-semibold mb-2">
              Payment sent successfully!
            </p>
            <p className="text-xs text-gray-400 break-all font-mono mb-2">
              {txHash}
            </p>
            <a
              href={`https://testnet.midenscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-300 hover:text-green-200"
            >
              View on MidenScan →
            </a>
            <p className="text-xs text-gray-500 mt-2">
              The creator will see this payment in their dashboard. It may take a few moments to appear.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={!canPay}
          className="w-full px-6 py-3 bg-transparent border-2 border-orange-600 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {isProcessing ? "Processing..." : "Pay privately with Miden"}
        </button>
      </div>
    </div>
  );
}
