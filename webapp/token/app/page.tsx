"use client";

import { useState, useEffect } from "react";
import { useWallet, CustomTransaction, ConsumeTransaction, MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter";
import { Navbar } from "./components/Navbar";
import {
  createAndSyncClient,
  mintTokens,
  getConsumableNotes,
  createConsumeTransactionRequest,
  getStoredFaucetId,
  getAccountIdFromAddress,
  handleError,
} from "./utils";
import { DEFAULT_FAUCET_CONFIG, STORAGE_KEYS } from "./constants";

export default function Home() {
  const { connected, address, wallet, requestConsumableNotes } = useWallet();
  const [tokenType, setTokenType] = useState<"ERC20" | "ERC721">("ERC20");
  const [amount, setAmount] = useState("");
  const [faucetId, setFaucetId] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [isSearchingNotes, setIsSearchingNotes] = useState(false);
  const [consumableNotes, setConsumableNotes] = useState<string[]>([]);
  const [isConsuming, setIsConsuming] = useState(false);
  const [consumeTxHash, setConsumeTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load stored faucet ID on mount
  useEffect(() => {
    const stored = getStoredFaucetId();
    if (stored) {
      setFaucetId(stored);
    }
  }, []);

  const handleMint = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!faucetId) {
      alert("Please deploy a faucet first or use the default faucet");
      return;
    }

    if (!amount || BigInt(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsMinting(true);
    setError(null);
    setMintTxHash(null);
    setConsumableNotes([]);
    setConsumeTxHash(null);

    try {
      const client = await createAndSyncClient();
      const decimals = parseInt(
        localStorage.getItem(STORAGE_KEYS.FAUCET_DECIMALS) ||
        DEFAULT_FAUCET_CONFIG.DECIMALS.toString()
      );
      const amountBigInt = BigInt(amount) * BigInt(10 ** decimals);

      const txId = await mintTokens(client, address, faucetId, amountBigInt);
      setMintTxHash(txId.toHex());

      // Start searching for consumable notes
      setIsSearchingNotes(true);
      await searchForConsumableNotes();
    } catch (err: any) {
      const message = handleError(err, "minting tokens");
      setError(message);
      alert(`Error minting tokens: ${message}`);
      setIsSearchingNotes(false);
    } finally {
      setIsMinting(false);
    }
  };

  const searchForConsumableNotes = async () => {
    if (!connected || !address || !faucetId) return;

    const maxAttempts = 20; // Try for ~60 seconds (3s intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const client = await createAndSyncClient();
        const notes = await getConsumableNotes(client, address);

        if (notes.length > 0) {
          const noteIds = notes.map((note) =>
            note.inputNoteRecord().id().toString()
          );
          setConsumableNotes(noteIds);
          setIsSearchingNotes(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (err: any) {
        console.error("Error searching for notes:", err);
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }

    setIsSearchingNotes(false);
    setError("Timeout waiting for consumable notes. Please try again later.");
  };

  const handleConsumeNotes = async () => {
    if (!connected || !address || !wallet || consumableNotes.length === 0) {
      return;
    }

    setIsConsuming(true);
    setError(null);

    try {
      const client = await createAndSyncClient();
      const consumeTxRequest = createConsumeTransactionRequest(
        client,
        consumableNotes
      );

      // Use CustomTransaction with wallet adapter
      const consumeCustomTransaction = new ConsumeTransaction(
        faucetId as string,
        consumableNotes[0],
        "private",
        Number(amount) * 10 ** 8
      );

      const txId =
        (await (wallet?.adapter as MidenWalletAdapter).requestConsume(
          consumeCustomTransaction
        )) || '';

      console.log(txId);

      if (txId) {
        setConsumeTxHash(txId);
      }

      setConsumableNotes([]);
      alert("Notes consumed successfully! Tokens are now in your vault.");
    } catch (err: any) {
      const message = handleError(err, "consuming notes");
      setError(message);
      alert(`Error consuming notes: ${message}`);
    } finally {
      setIsConsuming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Mint Tokens</h1>
          <p className="text-gray-400">
            Mint fungible or non-fungible tokens using your faucet
          </p>
        </div>

        {connected && address && (
          <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">Connected:</p>
            <p className="text-sm font-mono text-orange-400 break-all">
              {address}
            </p>
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Faucet ID
          </label>
          <input
            type="text"
            value={faucetId || ""}
            onChange={(e) => setFaucetId(e.target.value || null)}
            placeholder="Enter faucet ID (e.g., mtst1...)"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            {faucetId
              ? "Using the faucet ID above"
              : "Enter a faucet ID or deploy a new one"}
          </p>
        </div>

        <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-6">
          <div className="space-y-6">
            {/* Token Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Token Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tokenType"
                    value="ERC20"
                    checked={tokenType === "ERC20"}
                    onChange={(e) => setTokenType(e.target.value as "ERC20" | "ERC721")}
                    className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-300">ERC20 (Fungible)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tokenType"
                    value="ERC721"
                    checked={tokenType === "ERC721"}
                    onChange={(e) => setTokenType(e.target.value as "ERC20" | "ERC721")}
                    className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-300">ERC721 (Non-Fungible)</span>
                </label>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Mint
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="1000"
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter amount without decimals
              </p>
            </div>

            {/* Mint Button */}
            <button
              onClick={handleMint}
              disabled={
                !connected ||
                !faucetId ||
                isMinting ||
                isSearchingNotes ||
                !amount ||
                BigInt(amount || "0") <= 0
              }
              className="w-full px-6 py-3 bg-transparent border-2 border-orange-600 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {isMinting ? "Minting..." : "Mint Tokens"}
            </button>

            {/* Mint Transaction Hash */}
            {mintTxHash && (
              <div className="p-4 bg-gray-900/30 border border-orange-700 rounded-lg">
                <p className="text-sm font-semibold text-orange-400 mb-1">
                  Mint Transaction Submitted
                </p>
                <p className="text-xs text-gray-400 break-all font-mono mb-2">
                  {mintTxHash}
                </p>
                <a
                  className="text-xs text-orange-300 hover:text-orange-200"
                  href={`https://testnet.midenscan.com/tx/${mintTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on MidenScan →
                </a>
              </div>
            )}

            {/* Searching for Notes Indicator */}
            {isSearchingNotes && (
              <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <p className="text-blue-400 text-sm">
                    Searching for consumable notes... This may take a moment.
                  </p>
                </div>
              </div>
            )}

            {/* Consumable Notes Found */}
            {consumableNotes.length > 0 && !isSearchingNotes && (
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <p className="text-green-400 text-sm font-semibold mb-2">
                  Consumable Notes Found!
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {consumableNotes.length} note(s) ready to consume. Click the
                  button below to import them into your wallet.
                </p>
                <button
                  onClick={handleConsumeNotes}
                  disabled={isConsuming}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {isConsuming ? "Consuming..." : "Consume Notes"}
                </button>
              </div>
            )}

            {/* Consume Transaction Hash */}
            {consumeTxHash && (
              <div className="p-4 bg-gray-900/30 border border-green-700 rounded-lg">
                <p className="text-sm font-semibold text-green-400 mb-1">
                  Notes Consumed Successfully
                </p>
                <p className="text-xs text-gray-400 break-all font-mono mb-2">
                  {consumeTxHash}
                </p>
                <a
                  className="text-xs text-green-300 hover:text-green-200"
                  href={`https://testnet.midenscan.com/tx/${consumeTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on MidenScan →
                </a>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {!connected && (
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Connect your wallet to mint tokens
            </p>
          </div>
        )}

        {!faucetId && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-blue-400 text-sm">
              No faucet configured. Please{" "}
              <a href="/deploy" className="underline hover:text-blue-300">
                deploy a faucet
              </a>{" "}
              first.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
