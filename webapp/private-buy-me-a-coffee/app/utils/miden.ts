import {
    WebClient,
    Address,
    AccountStorageMode,
    NoteType,
    ConsumableNoteRecord,
    Note,
    NoteAssets,
    FungibleAsset,
    Felt,
} from "@demox-labs/miden-sdk";
import { SendTransaction, ConsumeTransaction, MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter";
import { NODE_ENDPOINT, STORAGE_KEYS, HLT_FAUCET_ID, TOKEN_DECIMALS } from "../constants";

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

/**
 * Send a private HLT token payment
 * 
 * This function creates a transaction that outputs a private note and sends it via the note transport layer.
 * The note contains HLT tokens that can be consumed by the recipient.
 * 
 * @param walletAdapter - The Miden wallet adapter instance
 * @param senderAddress - The sender's wallet address
 * @param recipientAddress - The recipient's wallet address
 * @param amount - The amount in HLT tokens (will be converted to base units)
 * @returns Promise<string> - The note ID
 */
export const sendPrivatePayment = async (
    walletAdapter: MidenWalletAdapter,
    senderAddress: string,
    recipientAddress: string,
    amount: number
): Promise<string> => {
    const amountInBaseUnits = BigInt((amount ** TOKEN_DECIMALS) / 10);

    console.log(`Creating private payment: ${amount} HLT from ${senderAddress} to ${recipientAddress}`);

    // Create WebClient for note operations
    const client = await createAndSyncClient();

    // Get account IDs from addresses
    const senderAccountId = getAccountIdFromAddress(senderAddress);
    const recipientAccountId = getAccountIdFromAddress(recipientAddress);

    // Get faucet account ID
    const faucetAddress = Address.fromBech32(HLT_FAUCET_ID);
    const faucetAccountId = faucetAddress.accountId();

    // Create fungible asset with the amount
    const asset = new FungibleAsset(faucetAccountId, amountInBaseUnits);
    const noteAssets = new NoteAssets([asset]);

    // Create a private P2ID note (Pay to ID) - this is the note that will be output by the transaction
    // Note: createP2IDNote takes ownership of noteAssets (which owns asset), so we only need to free privateNote
    const privateNote = Note.createP2IDNote(
        senderAccountId,
        recipientAccountId,
        noteAssets,
        NoteType.Private,
        new Felt(BigInt(0)) // aux value
    );


    const noteId = privateNote.id().toString();
    console.log(`Private note created with ID: ${noteId}`);

    // Create a SendTransaction that will output this private note
    // The transaction consumes tokens from sender's vault and outputs the private note
    const sendTransaction = new SendTransaction(
        senderAddress,
        recipientAddress,
        HLT_FAUCET_ID,
        "private",
        Number(amountInBaseUnits)
    );

    try {
        // Execute the transaction via wallet adapter
        const txHash = await walletAdapter.requestSend(sendTransaction);

        if (!txHash) {
            throw new Error("Transaction failed: No transaction hash returned");
        }

        const txHashString = typeof txHash === "string" ? txHash : String(txHash);
        console.log(`Transaction submitted: ${txHashString}`);

        // Send the private note details via XMTP
        try {
            const { sendPrivateNoteMessage } = await import("./xmtp");
            await sendPrivateNoteMessage(
                senderAddress,
                recipientAddress,
                noteId,
                amount
            );
            console.log(`Private note message sent via XMTP to ${recipientAddress}`);
        } catch (err) {
            console.error("Error sending private note via XMTP:", err);
            // Don't throw - transaction was successful, XMTP is just for notification
            // The note is still on-chain and can be consumed
        }

        return noteId;
    } finally {
        // Clean up resources - only free privateNote as it owns noteAssets and asset
        // Check if privateNote exists and hasn't been freed already
        if (privateNote) {
            try {
                privateNote.free();
            } catch (err) {
                console.warn("Error freeing privateNote:", err);
            }
        }
    }
};

/**
 * Get consumable notes for a creator
 * 
 * This queries the blockchain for consumable notes (private payments received)
 * that the creator can consume to add tokens to their vault.
 * It ensures the creator's account is imported and synced before querying.
 * 
 * @param creatorAddress - The creator's wallet address
 * @returns Promise<ConsumableNoteRecord[]> - Array of consumable notes
 */
export const getConsumableNotesForCreator = async (
    creatorAddress: string
): Promise<ConsumableNoteRecord[]> => {
    const client = await createAndSyncClient();

    // Ensure the creator's account is imported
    const creatorAccountId = getAccountIdFromAddress(creatorAddress);
    let creatorAccount = await client.getAccount(creatorAccountId);

    if (!creatorAccount) {
        // Try to import the account if it doesn't exist
        try {
            console.log(`Importing creator account: ${creatorAddress}`);
            await client.importAccountById(creatorAccountId);
            await client.syncState();
            creatorAccount = await client.getAccount(creatorAccountId);
            if (creatorAccount) {
                console.log("Creator account imported successfully");
            } else {
                console.warn("Creator account not found after import attempt");
            }
        } catch (err) {
            console.warn("Could not import creator account, continuing anyway:", err);
        }
    } else {
        console.log("Creator account already exists in client");
    }

    // Sync state to get latest notes from blockchain
    console.log("Syncing client state to get latest notes...");
    await client.syncState();

    // Query for consumable notes
    console.log(`Querying consumable notes for creator: ${creatorAddress}`);
    const notes = await getConsumableNotes(client, creatorAddress);
    console.log(`Found ${notes.length} consumable note(s)`);

    return notes;
};

/**
 * Consume a note using the wallet adapter
 * 
 * This function consumes a note (private payment) and adds the tokens
 * to the creator's vault. The note must be consumable by the creator.
 * 
 * @param walletAdapter - The Miden wallet adapter instance
 * @param noteId - The ID of the note to consume
 * @param amount - The amount in HLT tokens (for display purposes)
 * @returns Promise<string> - The transaction hash
 */
export const consumeNote = async (
    walletAdapter: MidenWalletAdapter,
    noteId: string,
    amount: number
): Promise<string> => {
    // const amountInBaseUnits = BigInt((amount ** TOKEN_DECIMALS) / 10);
    // console.log("amountInBaseUnits", amountInBaseUnits.toLocaleString());
    console.log(walletAdapter.requestConsume);


    const consumeTransaction = new ConsumeTransaction(
        HLT_FAUCET_ID,
        noteId,
        "private",
        amount
    );

    const txHash = await walletAdapter.requestConsume(consumeTransaction);

    if (!txHash) {
        throw new Error("Consume transaction failed: No transaction hash returned");
    }

    return typeof txHash === "string" ? txHash : String(txHash);
};

/**
 * Trim wallet address for display
 * 
 * Formats a wallet address to show first 6 and last 4 characters:
 * mm1ara...gzey
 * 
 * @param address - The full wallet address
 * @returns string - Trimmed address for display
 */
export const trimAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
