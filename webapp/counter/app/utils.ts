import { WebClient, Address } from "@demox-labs/miden-sdk";
import { COUNTER_CONTRACT_ADDRESS, NODE_ENDPOINT } from "./constants";

export const parseCounterValue = (storageItem: any): number => {
    if (!storageItem) throw new Error("Counter value not found");
    return Number(
        BigInt("0x" + storageItem.toHex().slice(-16).match(/../g)!.reverse().join(""))
    );
};

export const createAndSyncClient = async (): Promise<WebClient> => {
    const client = await WebClient.createClient(NODE_ENDPOINT);
    await client.syncState();
    return client;
};

export const getCounterContractAccount = async (client: WebClient) => {
    const counterContractId = Address.fromBech32(COUNTER_CONTRACT_ADDRESS).accountId();

    let counterContractAccount = await client.getAccount(counterContractId);
    if (!counterContractAccount) {
        await client.importAccountById(counterContractId);
        await client.syncState();
        counterContractAccount = await client.getAccount(counterContractId);

        if (!counterContractAccount) {
            throw new Error("Counter contract not found");
        }
    }

    return counterContractAccount;
};

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
