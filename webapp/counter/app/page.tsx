"use client";
import { useState, useEffect } from "react";
import {
  WalletMultiButton,
  useWallet
} from "@demox-labs/miden-wallet-adapter";
import { TransactionRequestBuilder } from "@demox-labs/miden-sdk";
import {
  COUNTER_CONTRACT_CODE
} from "./constants";
import {
  parseCounterValue,
  createAndSyncClient,
  getCounterContractAccount,
  handleError
} from "./utils";

export default function Home() {
  const { connected, address } = useWallet();
  const [counterValue, setCounterValue] = useState<number>(0);
  const [isLoadingCounter, setIsLoadingCounter] = useState(false);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const fetchCounterValue = async () => {
    setIsLoadingCounter(true);
    try {
      const client = await createAndSyncClient();
      const counterContractAccount = await getCounterContractAccount(client);

      const count = counterContractAccount.storage().getItem(0);
      const value = parseCounterValue(count);
      setCounterValue(value);
    } catch (error: any) {
      const message = handleError(error, "fetching counter");
      alert(`Error fetching counter: ${message}`);
    } finally {
      setIsLoadingCounter(false);
    }
  };

  const handleIncrementCounter = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsIncrementing(true);
    setTxHash(null);

    try {
      const client = await createAndSyncClient();
      const counterContractAccount = await getCounterContractAccount(client);

      const builder = client.createScriptBuilder();
      const accountCodeLib = builder.buildLibrary(
        "external_contract::counter_contract",
        COUNTER_CONTRACT_CODE
      );
      builder.linkDynamicLibrary(accountCodeLib);

      const txScriptCode = `
        use.external_contract::counter_contract
        begin
          call.counter_contract::increment_count
        end
      `;

      const txScript = builder.compileTxScript(txScriptCode);
      const txRequest = new TransactionRequestBuilder()
        .withCustomScript(txScript)
        .build();

      const txId = await client.submitNewTransaction(
        counterContractAccount.id(),
        txRequest
      );

      await client.syncState();
      setTxHash(txId.toHex());

      const updatedAccount = await client.getAccount(counterContractAccount.id());
      if (updatedAccount) {
        const updatedCount = updatedAccount.storage().getItem(0);
        const newValue = parseCounterValue(updatedCount);
        setCounterValue(newValue);
      }
    } catch (err: any) {
      const message = handleError(err, "incrementing counter");
      alert(message);
    } finally {
      setIsIncrementing(false);
    }
  };

  useEffect(() => {
    fetchCounterValue();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <div className="w-full max-w-2xl px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Miden Counter</h1>
            <p className="text-gray-400">Connect wallet and increment</p>
          </div>
          <WalletMultiButton />
        </div>

        {connected && address && (
          <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">Connected:</p>
            <p className="text-sm font-mono text-orange-400 break-all">
              {address}
            </p>
          </div>
        )}

        <div className="bg-gray-800/20 border border-gray-600 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 text-orange-400">
            Counter Contract
          </h2>

          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-orange-400 mb-2">
              {isLoadingCounter ? "..." : counterValue}
            </div>
            <p className="text-gray-400">Current Value</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleIncrementCounter}
              disabled={!connected || isIncrementing || isLoadingCounter}
              className="w-full px-6 py-3 bg-transparent border-2 border-orange-600 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isIncrementing ? "Incrementing..." : "Increment"}
            </button>

            <button
              onClick={fetchCounterValue}
              disabled={isLoadingCounter || isIncrementing}
              className="w-full px-6 py-3 bg-transparent border-2 border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isLoadingCounter ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {txHash && (
            <div className="mt-4 p-4 bg-gray-900/30 border border-orange-700 rounded-lg">
              <p className="text-sm font-semibold text-orange-400 mb-1">
                Increment Confirmed
              </p>
              <p className="text-xs text-gray-400">
                View <a className="text-orange-300" href={`https://testnet.midenscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">Transaction on MidenScan</a>
              </p>
            </div>
          )}
        </div>

        {!connected && (
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Connect your wallet to increment
            </p>
          </div>
        )}
      </div>
    </main>
  );
}