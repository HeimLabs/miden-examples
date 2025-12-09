"use client";

import { useState } from "react";
import { useWallet, SendTransaction, ConsumeTransaction, MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter";
import { Navbar } from "./components/Navbar";
import { PurchaseModal } from "./components/PurchaseModal";
import {
  createAndSyncClient,
  getConsumableNotes,
  handleError,
  toBaseUnits,
} from "./utils";
import { MARKETPLACE_ASSETS, MIDEN_FAUCET_ID, HLT_FAUCET_ID, TOKEN_DECIMALS } from "./constants";
import { Address, NoteType } from "@demox-labs/miden-sdk";
import type { MarketplaceAsset } from "./constants";

export default function MarketplacePage() {
  const { connected, address, wallet } = useWallet();
  const [purchasingAssetId, setPurchasingAssetId] = useState<string | null>(null);
  const [purchaseTxHash, setPurchaseTxHash] = useState<string | null>(null);
  const [rewardTxHash, setRewardTxHash] = useState<string | null>(null);
  const [isSearchingReward, setIsSearchingReward] = useState(false);
  const [consumableNotes, setConsumableNotes] = useState<string[]>([]);
  const [isConsuming, setIsConsuming] = useState(false);
  const [consumeTxHash, setConsumeTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchasedAsset, setPurchasedAsset] = useState<MarketplaceAsset | null>(null);
  const [purchaseStage, setPurchaseStage] = useState<"sending" | "minting" | "searching" | "ready" | "completed" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePurchase = async (asset: MarketplaceAsset) => {
    if (!connected || !address || !wallet) {
      alert("Please connect your wallet first");
      return;
    }

    if (!wallet.adapter) {
      alert("Wallet adapter not available");
      return;
    }

    setPurchasingAssetId(asset.id);
    setError(null);
    setPurchaseTxHash(null);
    setRewardTxHash(null);
    setConsumableNotes([]);
    setConsumeTxHash(null);
    setPurchasedAsset(asset);
    setPurchaseStage("sending");
    setIsModalOpen(true);

    try {
      const client = await createAndSyncClient();

      // Step 1: Send MIDEN tokens to HLT faucet (using SendTransaction)
      setPurchaseStage("sending");
      const midenAmount = toBaseUnits(asset.price);
      const sendTransaction = new SendTransaction(
        address,
        HLT_FAUCET_ID, // Send MIDEN to HLT faucet
        MIDEN_FAUCET_ID,
        "public",
        Number(asset.price) * 10 ** TOKEN_DECIMALS
      );

      // @ts-ignore - requestSend exists on adapter at runtime
      const sendTxHash = await wallet.adapter.requestSend(sendTransaction);

      if (sendTxHash) {
        setPurchaseTxHash(typeof sendTxHash === "string" ? sendTxHash : sendTxHash.toString());
      }

      await client.syncState();

      // Step 2: HLT faucet sends HLT tokens to user as reward
      setPurchaseStage("minting");
      const hltAmount = toBaseUnits(asset.hltReward);
      const recipientId = Address.fromBech32(address).accountId();
      const hltFaucetId = Address.fromBech32(HLT_FAUCET_ID).accountId();

      // Import HLT faucet account if not already imported
      let hltFaucetAccount = await client.getAccount(hltFaucetId);
      if (!hltFaucetAccount) {
        await client.importAccountById(hltFaucetId);
        await client.syncState();
        hltFaucetAccount = await client.getAccount(hltFaucetId);
        if (!hltFaucetAccount) {
          throw new Error("HLT faucet account not found after import");
        }
      }

      const mintTxRequest = client.newMintTransactionRequest(
        recipientId,
        hltFaucetId,
        NoteType.Public,
        hltAmount
      );

      const rewardTxId = await client.submitNewTransaction(hltFaucetId, mintTxRequest);
      setRewardTxHash(rewardTxId.toHex());

      await client.syncState();

      // Step 3: Search for consumable HLT notes
      setPurchaseStage("searching");
      setIsSearchingReward(true);
      await searchForRewardNotes();
    } catch (err: any) {
      const message = handleError(err, "purchasing asset");
      setError(message);
      setPurchaseStage(null);
      setIsSearchingReward(false);
    } finally {
      setPurchasingAssetId(null);
    }
  };

  const searchForRewardNotes = async () => {
    if (!connected || !address) return;

    const maxAttempts = 20; // Try for ~60 seconds (3s intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const client = await createAndSyncClient();
        const notes = await getConsumableNotes(client, address);

        // Filter notes that might be from HLT faucet
        if (notes.length > 0) {
          const noteIds = notes.map((note) =>
            note.inputNoteRecord().id().toString()
          );
          setConsumableNotes(noteIds);
          setIsSearchingReward(false);
          setPurchaseStage("ready");
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

    setIsSearchingReward(false);
    setPurchaseStage(null);
    setError("Timeout waiting for reward notes. Please try again later.");
  };

  const handleConsumeReward = async () => {
    if (!connected || !address || !wallet || consumableNotes.length === 0 || !purchasedAsset) {
      return;
    }

    setIsConsuming(true);
    setError(null);

    try {
      // Use ConsumeTransaction with wallet adapter
      const consumeTransaction = new ConsumeTransaction(
        HLT_FAUCET_ID,
        consumableNotes[0],
        "private",
        Number(purchasedAsset.hltReward) * 10 ** TOKEN_DECIMALS
      );

      const txId =
        (await (wallet?.adapter as MidenWalletAdapter).requestConsume(
          consumeTransaction
        )) || '';

      if (txId) {
        setConsumeTxHash(txId);
        setPurchaseStage("completed");
      }

      setConsumableNotes([]);
    } catch (err: any) {
      const message = handleError(err, "consuming reward notes");
      setError(message);
      alert(`Error consuming reward notes: ${message}`);
    } finally {
      setIsConsuming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Marketplace</h1>
          <p className="text-gray-400">
            Purchase digital assets with MIDEN tokens and receive HLT tokens as rewards
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

        {!connected && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Connect your wallet to purchase assets
            </p>
          </div>
        )}

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {MARKETPLACE_ASSETS.map((asset) => (
            <div
              key={asset.id}
              className="bg-gray-800/20 border border-gray-600 rounded-2xl overflow-hidden hover:border-orange-500 transition-colors"
            >
              <div className="aspect-square w-full overflow-hidden bg-gray-700">
                <img
                  src={asset.imageUrl}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-orange-400">
                  {asset.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{asset.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-lg font-semibold text-white">
                      {asset.price} MIDEN
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Reward</p>
                    <p className="text-lg font-semibold text-green-400">
                      {asset.hltReward} HLT
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(asset)}
                  disabled={!connected || purchasingAssetId === asset.id}
                  className="w-full px-4 py-2 bg-transparent border-2 border-orange-600 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {purchasingAssetId === asset.id ? "Processing..." : "Purchase"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        asset={purchasedAsset}
        stage={purchaseStage}
        error={error}
        onClose={() => {
          setIsModalOpen(false);
          setPurchaseStage(null);
          setPurchasingAssetId(null);
        }}
        onConsume={handleConsumeReward}
        isConsuming={isConsuming}
      />
    </div>
  );
}
