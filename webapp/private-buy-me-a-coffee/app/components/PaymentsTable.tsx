"use client";

import { useState, useEffect } from "react";
import { useWallet, MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter";
import { consumeNote, trimAddress } from "../utils";
import { TOKEN_DECIMALS, HLT_FAUCET_ID } from "../constants";

interface PaymentsTableProps {
  creatorAddress: string;
}

interface ConsumableNote {
  noteId: string;
  amount?: number;
  [key: string]: any;
}

export function PaymentsTable({ creatorAddress }: PaymentsTableProps) {
  const { connected, address, wallet, requestConsumableNotes } = useWallet();
  const [notes, setNotes] = useState<ConsumableNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [consumingNoteId, setConsumingNoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    if (!connected || !address || address !== creatorAddress || !requestConsumableNotes) return;

    setIsLoading(true);
    setError(null);

    try {
      // Request consumable notes from wallet - this will prompt the wallet to confirm
      // and return the notes that the creator can consume
      console.log("Requesting consumable notes from wallet...");
      const walletNotes = await requestConsumableNotes("All" as any);

      console.log("Received notes from wallet:", walletNotes);

      if (walletNotes && Array.isArray(walletNotes)) {
        // Transform wallet notes to our format
        const transformedNotes = walletNotes.map((note: any) => ({
          noteId: note.noteId || note.id || note,
          amount: note.amount,
          ...note,
        }));
        setNotes(transformedNotes);
      } else {
        setNotes([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
      console.error("Error loading notes:", err);
      // If user cancels the wallet prompt, don't show error
      if (err.message?.includes("cancel") || err.message?.includes("reject")) {
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!connected || !address || address !== creatorAddress) {
      setNotes([]);
      return;
    }

    // Don't auto-load notes since requestConsumableNotes requires wallet confirmation
    // User will need to click "Refresh" to request notes from wallet
  }, [connected, address, creatorAddress]);

  const handleConsumeNote = async (noteId: string, note: ConsumableNote) => {
    if (!connected || !address || !wallet || address !== creatorAddress) {
      setError("You must be connected with the creator's wallet");
      return;
    }

    setConsumingNoteId(noteId);
    setError(null);

    try {
      const adapter = wallet.adapter as MidenWalletAdapter;

      // Extract amount from note, default to 10 HLT if not available
      const amount = note.amount || 10;

      await consumeNote(adapter, noteId, amount);

      // Reload notes after consumption
      await loadNotes();
    } catch (err: any) {
      setError(err.message || "Failed to consume note");
      console.error("Error consuming note:", err);
    } finally {
      setConsumingNoteId(null);
    }
  };

  const formatAmount = (note: ConsumableNote): string => {
    if (note.amount) {
      return `${note.amount} HLT`;
    }
    return "~10 HLT"; // Default placeholder
  };

  if (!connected || address !== creatorAddress) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
        <p className="text-yellow-400 text-sm">
          Connect with your creator wallet to view payments
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-300">Received Payments</h3>
        <button
          onClick={loadNotes}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isLoading && notes.length === 0 ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Requesting notes from wallet...</p>
          <p className="text-xs text-gray-500 mt-2">
            Please confirm in your wallet to view consumable notes
          </p>
        </div>
      ) : notes.length === 0 && !isLoading ? (
        <div className="p-8 text-center bg-gray-800/20 border border-gray-700 rounded-lg">
          <p className="text-gray-400 mb-4">No payments received yet</p>
          <p className="text-xs text-gray-500 mb-4">
            Click "Refresh" to request consumable notes from your wallet.
            Private payments will appear here once they're confirmed on the blockchain.
          </p>
          <button
            onClick={loadNotes}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
          >
            Request Notes from Wallet
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                  Note ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                  Amount
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => {
                const noteId = note.noteId;
                const isConsuming = consumingNoteId === noteId;

                return (
                  <tr
                    key={noteId}
                    className="border-b border-gray-800 hover:bg-gray-800/20"
                  >
                    <td className="py-3 px-4">
                      <code className="text-xs text-gray-400 font-mono">
                        {trimAddress(noteId)}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {formatAmount(note)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleConsumeNote(noteId, note)}
                        disabled={isConsuming}
                        className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isConsuming ? "Consuming..." : "Consume"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
