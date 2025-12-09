import {
  WebClient,
  Address,
  NoteType,
  ConsumableNoteRecord,
} from "@demox-labs/miden-sdk";
import { NODE_ENDPOINT, TOKEN_DECIMALS } from "./constants";

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

// Note: Faucet storage functions removed - marketplace uses fixed faucet IDs from constants

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
 * Convert amount to base units (with decimals)
 */
export const toBaseUnits = (amount: number, decimals: number = TOKEN_DECIMALS): bigint => {
  return BigInt(amount) * BigInt(10 ** decimals);
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
