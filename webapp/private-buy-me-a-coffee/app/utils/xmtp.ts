import { Client, Signer, ConsentState } from '@xmtp/browser-sdk';
import type { SafeInboxState } from '@xmtp/browser-sdk';

/**
 * Get CDP address for a Miden address
 */
export const getCdpAddress = async (midenAddress: string): Promise<string> => {
  const account = await import('@demox-labs/miden-sdk').then(m => m.Address.fromBech32(midenAddress));
  const accountId = account.accountId().toString();

  const response = await fetch('/api/cdp/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      midenAddress: accountId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get CDP address');
  }

  const data = await response.json();
  return data.evmAddress;
};

/**
 * Create an XMTP signer that uses CDP wallet for signing
 */
export const createXmtpSigner = (cdpAddress: string, midenAddress?: string): Signer => {
  return {
    type: 'EOA',
    getIdentifier: () => ({
      identifier: cdpAddress,
      identifierKind: 'Ethereum',
    }),
    signMessage: async (message: string): Promise<Uint8Array> => {
      // Get midenAddress from CDP address by looking it up
      // For now, we'll need to pass it through context or store it
      // Since we're creating the signer with cdpAddress, we need to get midenAddress
      // This is a limitation - we might need to refactor to pass midenAddress

      // Call API endpoint to sign message with CDP wallet
      const response = await fetch('/api/cdp/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          address: cdpAddress,
          midenAddress: midenAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sign message');
      }

      const { signature } = await response.json();

      // Convert hex string to Uint8Array
      // Remove '0x' prefix if present
      const hex = signature.startsWith('0x') ? signature.slice(2) : signature;
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }

      return bytes;
    },
  };
};

/**
 * Create XMTP client for a Miden address
 * Handles installation limit by attempting to revoke old installations if needed
 */
export const createXmtpClient = async (midenAddress: string): Promise<Client> => {
  const cdpAddress = await getCdpAddress(midenAddress);
  // Extract account ID from midenAddress for passing to signer
  const account = await import('@demox-labs/miden-sdk').then(m => m.Address.fromBech32(midenAddress));
  const accountId = account.accountId().toString();
  const signer = createXmtpSigner(cdpAddress, accountId);

  try {
    // In browser environments, XMTP automatically uses IndexedDB for persistence
    // Client.create will reuse existing installation if database exists
    const client = await Client.create(signer, {
      // Note: dbEncryptionKey is not used for encryption in browser environments
    });
    return client;
  } catch (error: unknown) {
    // Check if error is about installation limit
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('already registered') && errorMessage.includes('installations')) {
      console.warn('XMTP installation limit reached, attempting to revoke old installations...');

      // Extract inbox ID from error message
      const inboxIdMatch = errorMessage.match(/InboxID\s+([a-f0-9]+)/i);

      if (inboxIdMatch) {
        const inboxId = inboxIdMatch[1];
        console.log(`Attempting static revocation for inbox: ${inboxId}`);

        try {
          // Get inbox state to see all installations using static method
          // Signature: Client.inboxStateFromInboxIds(inboxIds, env?, enableLogging?, gatewayHost?)
          const inboxStates: SafeInboxState[] = await Client.inboxStateFromInboxIds(
            [inboxId],
            'production', // Environment: 'production' or 'dev'
            true, // enableLogging
            undefined // gatewayHost - use default
          );

          if (inboxStates.length > 0) {
            const inboxState = inboxStates[0];
            const installations = inboxState.installations;

            if (installations.length >= 10) {
              // Revoke all but the most recent installation to make room
              const installationsToRevoke = installations.slice(0, installations.length - 1);

              if (installationsToRevoke.length > 0) {
                console.log(`Revoking ${installationsToRevoke.length} old installations...`);

                // Extract bytes from SafeInstallation objects
                // SafeInstallation has a bytes property of type Uint8Array
                const installationBytes: Uint8Array[] = installationsToRevoke.map((inst) => inst.bytes);

                // Use static revocation method
                // Signature: Client.revokeInstallations(signer, inboxId, installationIds, env?, gatewayHost?, enableLogging?)
                await Client.revokeInstallations(
                  signer,
                  inboxId,
                  installationBytes,
                  'production', // Environment: 'production' or 'dev'
                  undefined, // gatewayHost - use default
                  true // enableLogging
                );

                console.log('Successfully revoked old installations, retrying client creation...');

                // Retry creating client after revocation
                const client = await Client.create(signer, {
                  // Note: dbEncryptionKey is not used for encryption in browser environments
                });
                return client;
              }
            }
          }

          // If we can't automatically revoke, provide helpful error message
          throw new Error(
            `XMTP installation limit reached (10/10 installations) for inbox ${inboxId}. ` +
            `Please clear your browser's IndexedDB storage for this site or use a different browser/profile ` +
            `to reset your XMTP installations. Alternatively, you can manually revoke installations using ` +
            `an XMTP client that has access to this inbox.`
          );
        } catch (revokeError: unknown) {
          const revokeErrorMessage = revokeError instanceof Error
            ? revokeError.message
            : String(revokeError);
          console.error('Failed to revoke installations:', revokeError);
          throw new Error(
            `XMTP installation limit reached. Could not automatically revoke installations. ` +
            `Please clear your browser's IndexedDB storage or use a different browser/profile. ` +
            `Revocation error: ${revokeErrorMessage}`
          );
        }
      }

      // If we can't extract inbox ID, throw helpful error
      throw new Error(
        `XMTP installation limit reached (10/10 installations). ` +
        `Please clear your browser's IndexedDB storage for this site or use a different browser/profile ` +
        `to reset your XMTP installations. Original error: ${errorMessage}`
      );
    }

    // Re-throw if it's not an installation limit error
    throw error;
  }
};

/**
 * Send a private note message to a creator via XMTP
 */
export const sendPrivateNoteMessage = async (
  senderMidenAddress: string,
  creatorMidenAddress: string,
  noteId: string,
  amount: number
): Promise<void> => {
  const client = await createXmtpClient(senderMidenAddress);

  // Get creator's CDP address
  const creatorCdpAddress = await getCdpAddress(creatorMidenAddress);

  // Get creator's inbox ID (CDP address as identifier)
  const creatorIdentifier = {
    identifier: creatorCdpAddress,
    identifierKind: 'Ethereum' as const,
  };

  console.log(creatorCdpAddress);

  const inboxId = await client.findInboxIdByIdentifier(creatorIdentifier);
  console.log("inboxId", inboxId);

  if (!inboxId) {
    throw new Error('Creator inbox not found');
  }

  // Create or get DM conversation
  const conversation = await client.conversations.newDm(inboxId);

  // Send message with note details
  const message = JSON.stringify({
    type: 'private_payment',
    noteId,
    amount,
    senderAddress: senderMidenAddress,
    timestamp: new Date().toISOString(),
  });

  await conversation.send(message);

  console.log(`Private note message sent to creator via XMTP: ${noteId}`);
};

/**
 * Get private note messages for a creator
 */
export const getPrivateNoteMessages = async (creatorMidenAddress: string): Promise<Array<{
  noteId: string;
  amount: number;
  senderAddress: string;
  timestamp: string;
}>> => {
  const client = await createXmtpClient(creatorMidenAddress);

  // Sync conversations to get latest messages
  await client.conversations.syncAll();

  const inboxId = client.inboxId;
  console.log("inboxId", inboxId);

  // List all DM conversations
  const conversations = await client.conversations.listDms({
  });


  const messages: Array<{
    noteId: string;
    amount: number;
    senderAddress: string;
    timestamp: string;
  }> = [];

  // Get messages from all conversations
  for (const conversation of conversations) {
    const conversationMessages = await conversation.messages();

    for (const msg of conversationMessages) {
      try {
        const content = JSON.parse(msg.content as string);
        console.log(content);
        messages.push({
          noteId: content.noteId,
          amount: content.amount,
          senderAddress: content.senderAddress,
          timestamp: content.timestamp,
        });
      } catch (e) {
        // Skip non-JSON messages
        console.warn('Failed to parse message:', e);
      }
    }
  }

  return messages;
};

/**
 * Stream private note messages for a creator
 */
export const streamPrivateNoteMessages = async (
  creatorMidenAddress: string,
  onMessage: (message: {
    noteId: string;
    amount: number;
    senderAddress: string;
    timestamp: string;
  }) => void,
  onError?: (error: Error) => void
): Promise<() => void> => {
  const client = await createXmtpClient(creatorMidenAddress);

  // Sync conversations first
  await client.conversations.syncAll();

  // Stream all messages
  const stream = await client.conversations.streamAllMessages({
    consentStates: [ConsentState.Allowed],
    onValue: async (message) => {
      try {
        const content = JSON.parse(message.content as string);
        onMessage(content);
      } catch (e) {
        // Skip non-JSON messages
        console.warn('Failed to parse streamed message:', e);
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error);
      } else {
        console.error('XMTP stream error:', error);
      }
    },
  });

  // Return cleanup function
  return () => {
    // Note: The stream might not have a direct close method, but we can track it
    // For now, we'll just log that cleanup was called
    console.log('Stopping XMTP message stream');
  };
};
