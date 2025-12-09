import {
  WebClient,
  Address,
  AccountStorageMode,
  NoteType,
  ConsumableNoteRecord,
} from "@demox-labs/miden-sdk";
import { NODE_ENDPOINT, STORAGE_KEYS } from "./constants";

/**
 * Create and sync a WebClient instance
 */
export const createAndSyncClient = async (): Promise<WebClient> => {
    const client = await WebClient.createClient(NODE_ENDPOINT);
    await client.syncState();
    return client;
};

/**
 * Get account ID from address string
 */
export const getAccountIdFromAddress = (address: string) => {
  return Address.fromBech32(address).accountId();
};

/**
 * Get stored faucet ID from localStorage
 */
export const getStoredFaucetId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.FAUCET_ID);
};

/**
 * Store faucet ID and metadata in localStorage
 */
export const storeFaucetInfo = (
  faucetId: string,
  isNonFungible: boolean,
  symbol: string,
  decimals: number
): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.FAUCET_ID, faucetId);
  localStorage.setItem(STORAGE_KEYS.FAUCET_TYPE, isNonFungible.toString());
  localStorage.setItem(STORAGE_KEYS.FAUCET_SYMBOL, symbol);
  localStorage.setItem(STORAGE_KEYS.FAUCET_DECIMALS, decimals.toString());
};

/**
 * Get stored faucet type
 */
export const getStoredFaucetType = (): boolean | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.FAUCET_TYPE);
  return stored === null ? null : stored === "true";
};

/**
 * Create a new faucet account
 */
export const createFaucet = async (
  client: WebClient,
  isNonFungible: boolean,
  symbol: string,
  decimals: number,
  initialSupply: bigint
) => {
  const faucet = await client.newFaucet(
    AccountStorageMode.public(),
    isNonFungible,
    symbol,
    decimals,
    initialSupply,
    0 // seed parameter
  );
  return faucet;
};

/**
 * Mint tokens to a recipient account
 */
export const mintTokens = async (
  client: WebClient,
  recipientAccountId: string,
  faucetAccountId: string,
  amount: bigint
) => {
  const recipientId = Address.fromBech32(recipientAccountId).accountId();
  const faucetId = Address.fromBech32(faucetAccountId).accountId();

  const mintTxRequest = client.newMintTransactionRequest(
    recipientId,
    faucetId,
    NoteType.Public,
    amount
  );

  const mintTxId = await client.submitNewTransaction(faucetId, mintTxRequest);
        await client.syncState();

  return mintTxId;
};

/**
 * Get consumable notes for an account
 */
export const getConsumableNotes = async (
  client: WebClient,
  accountId: string
): Promise<ConsumableNoteRecord[]> => {
  const id = Address.fromBech32(accountId).accountId();
  return await client.getConsumableNotes(id);
};

/**
 * Create consume transaction request (to be used with wallet adapter)
 */
export const createConsumeTransactionRequest = (
  client: WebClient,
  noteIds: string[]
) => {
  return client.newConsumeTransactionRequest(noteIds);
};

/**
 * Error handler
 */
export const handleError = (error: any, context: string): string => {
    console.error(`Error ${context}:`, error);

    let message = `Error ${context}`;
    if (error.message?.includes("insufficient")) {
        message = "Insufficient balance or funds";
    } else if (error.message) {
        message = error.message;
    }

    return message;
};
