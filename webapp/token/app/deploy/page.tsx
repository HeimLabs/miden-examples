"use client";

import { useState } from "react";
import { useWallet } from "@demox-labs/miden-wallet-adapter";
import { Navbar } from "../components/Navbar";
import {
  createAndSyncClient,
  createFaucet,
  storeFaucetInfo,
  handleError,
  getAccountIdFromAddress,
} from "../utils";
import { DEFAULT_FAUCET_CONFIG } from "../constants";

export default function DeployFaucetPage() {
  const { connected, address } = useWallet();
  const [tokenType, setTokenType] = useState<"ERC20" | "ERC721">("ERC20");
  const [symbol, setSymbol] = useState(DEFAULT_FAUCET_CONFIG.SYMBOL);
  const [decimals, setDecimals] = useState(DEFAULT_FAUCET_CONFIG.DECIMALS.toString());
  const [initialSupply, setInitialSupply] = useState(
    (DEFAULT_FAUCET_CONFIG.INITIAL_SUPPLY / BigInt(10 ** DEFAULT_FAUCET_CONFIG.DECIMALS)).toString()
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [faucetId, setFaucetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsDeploying(true);
    setError(null);
    setFaucetId(null);

    try {
      const client = await createAndSyncClient();
      const isNonFungible = tokenType === "ERC721";
      const decimalsNum = parseInt(decimals);
      const supplyBigInt = BigInt(initialSupply) * BigInt(10 ** decimalsNum);

      const faucet = await createFaucet(
        client,
        isNonFungible,
        symbol,
        decimalsNum,
        supplyBigInt
      );

      const faucetAddress = faucet.id().toBech32();
      setFaucetId(faucetAddress);

      // Store faucet info in localStorage
      storeFaucetInfo(faucetAddress, isNonFungible, symbol, decimalsNum);

      alert(`Faucet deployed successfully! ID: ${faucetAddress}`);
    } catch (err: any) {
      const message = handleError(err, "deploying faucet");
      setError(message);
      alert(`Error deploying faucet: ${message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Deploy Faucet</h1>
          <p className="text-gray-400">
            Create a new token faucet for minting tokens
          </p>
        </div>

        {!connected && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Please connect your wallet to deploy a faucet
            </p>
          </div>
        )}

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

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="TEST"
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                maxLength={10}
              />
            </div>

            {/* Decimals */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Decimals
              </label>
              <input
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                min="0"
                max="18"
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Initial Supply */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Supply
              </label>
              <input
                type="text"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                placeholder="10000000"
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter amount without decimals (e.g., 10000000 for 10M tokens)
              </p>
            </div>

            {/* Deploy Button */}
            <button
              onClick={handleDeploy}
              disabled={!connected || isDeploying || !symbol || !decimals || !initialSupply}
              className="w-full px-6 py-3 bg-transparent border-2 border-orange-600 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {isDeploying ? "Deploying..." : "Deploy Faucet"}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success Display */}
            {faucetId && (
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <p className="text-green-400 text-sm font-semibold mb-2">
                  Faucet Deployed Successfully!
                </p>
                <p className="text-xs text-gray-400 break-all font-mono">
                  {faucetId}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  This faucet ID has been saved and will be used for minting.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

