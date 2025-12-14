"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet, MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter";

// Dynamic import for consumeNote to avoid SDK loading during build
const getConsumeNote = async () => {
  const { consumeNote } = await import("../utils/miden");
  return consumeNote;
};

interface PaymentsTableProps {
  creatorAddress: string;
}

interface PrivateNoteMessage {
  noteId: string;
  amount: number;
  senderAddress: string;
  timestamp: string;
}

export function PaymentsTable({ creatorAddress }: PaymentsTableProps) {
  const { connected, address, wallet } = useWallet();
  const [notes, setNotes] = useState<PrivateNoteMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [consumingNoteId, setConsumingNoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamCleanupRef = useRef<(() => void) | null>(null);

  const loadNotes = async () => {
    if (!connected || !address || address !== creatorAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load private note messages from XMTP
      const { getPrivateNoteMessages } = await import("../utils/xmtp");
      const messages = await getPrivateNoteMessages(creatorAddress);
      setNotes(messages);
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
      console.error("Error loading notes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!connected || !address || address !== creatorAddress) {
      setNotes([]);
      // Clean up stream if it exists
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
        streamCleanupRef.current = null;
      }
      return;
    }

    // Load initial notes
    loadNotes();

    // Set up streaming for new messages
    const setupStream = async () => {
      try {
        const { streamPrivateNoteMessages } = await import("../utils/xmtp");
        const cleanup = await streamPrivateNoteMessages(
          creatorAddress,
          (message) => {
            // Add new message to the list
            setNotes((prev) => {
              // Check if note already exists
              if (prev.some((n) => n.noteId === message.noteId)) {
                return prev;
              }
              return [...prev, message];
            });
          },
          (err) => {
            console.error("XMTP stream error:", err);
            setError("Failed to stream messages: " + err.message);
          }
        );
        streamCleanupRef.current = cleanup;
      } catch (err) {
        console.error("Failed to setup XMTP stream:", err);
      }
    };

    setupStream();

    // Cleanup on unmount
    return () => {
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
        streamCleanupRef.current = null;
      }
    };
  }, [connected, address, creatorAddress]);

  const handleConsumeNote = async (noteId: string, note: PrivateNoteMessage) => {
    if (!connected || !address || !wallet || address !== creatorAddress) {
      setError("You must be connected with the creator's wallet");
      return;
    }

    setConsumingNoteId(noteId);
    setError(null);

    try {
      const adapter = wallet.adapter as MidenWalletAdapter;

      // Use amount from the note message
      const amount = note.amount || 10;

      // Dynamically import consumeNote to avoid SDK loading during build
      const consumeNoteFn = await getConsumeNote();
      await consumeNoteFn(adapter, noteId, amount);

      // Remove consumed note from the list
      setNotes((prev) => prev.filter((n) => n.noteId !== noteId));
    } catch (err: any) {
      setError(err.message || "Failed to consume note");
      console.error("Error consuming note:", err);
    } finally {
      setConsumingNoteId(null);
    }
  };

  const formatAmount = (note: PrivateNoteMessage): string => {
    return `${note.amount} HLT`;
  };

  if (!connected || address !== creatorAddress) {
    return (
      <div className="p-6 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-700/50 rounded-xl backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-400 text-sm font-medium">
            Connect with your creator wallet to view payments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Message */}
      <div className="p-5 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700/30 rounded-xl backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-blue-300 font-semibold mb-1">How payments work</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              All payments are sent directly to your wallet via private Miden transactions! You'll receive notifications
              via XMTP when supporters send you payments. The payments shown here are <span className="font-semibold text-blue-200">private notes</span> that you can claim
              to add tokens to your vault. Once claimed, they'll appear in your wallet balance.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Private Payments</h3>
        </div>
        <button
          onClick={loadNotes}
          disabled={isLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </span>
          ) : (
            "Refresh"
          )}
        </button>
      </div>

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

      {isLoading && notes.length === 0 ? (
        <div className="p-12 text-center bg-gray-800/30 rounded-2xl border border-gray-700/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500/20 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium mb-2">Loading private payments...</p>
          <p className="text-sm text-gray-400">
            Fetching messages from XMTP
          </p>
        </div>
      ) : notes.length === 0 && !isLoading ? (
        <div className="p-12 text-center bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 rounded-2xl backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-300 font-semibold text-lg mb-2">No private payments</p>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            You don't have any private payments right now. When supporters send you payments, you'll receive notifications
            via XMTP and they'll appear here. Click "Refresh" to check for any new messages.
          </p>
          <button
            onClick={loadNotes}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Refresh Messages
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-900/30">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-700/50">
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-200">
                  Note ID
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-200">
                  Amount
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-200">
                  From
                </th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-200">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, index) => {
                const noteId = note.noteId;
                const isConsuming = consumingNoteId === noteId;

                return (
                  <tr
                    key={noteId}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <code className="text-sm text-gray-300 font-mono bg-gray-900/50 px-2 py-1 rounded">
                        {noteId}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-200 font-semibold">{note.amount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm text-gray-400 font-mono bg-gray-900/50 px-2 py-1 rounded">
                        {note.timestamp}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleConsumeNote(noteId, note)}
                        disabled={isConsuming}
                        className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        {isConsuming ? (
                          <span className="flex items-center space-x-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Consuming...</span>
                          </span>
                        ) : (
                          "Consume"
                        )}
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
