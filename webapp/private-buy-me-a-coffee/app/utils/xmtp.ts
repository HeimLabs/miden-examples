import { Client, Signer, ConsentState } from '@xmtp/browser-sdk';

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
 */
export const createXmtpClient = async (midenAddress: string): Promise<Client> => {
  const cdpAddress = await getCdpAddress(midenAddress);
  // Extract account ID from midenAddress for passing to signer
  const account = await import('@demox-labs/miden-sdk').then(m => m.Address.fromBech32(midenAddress));
  const accountId = account.accountId().toString();
  const signer = createXmtpSigner(cdpAddress, accountId);
  const client = await Client.create(signer, {
    // Note: dbEncryptionKey is not used for encryption in browser environments
  });
  return client;
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

  // Create or get DM conversation
  const conversation = await client.conversations.newConversation(creatorIdentifier);

  // Send message with note details
  const message = JSON.stringify({
    type: 'private_payment',
    noteId,
    amount,
    senderMidenAddress: senderMidenAddress,
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
  await client.conversations.syncAll(['allowed']);

  // List all DM conversations
  const conversations = await client.conversations.listDms({
    consentStates: [ConsentState.Allowed],
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
        const content = JSON.parse(msg.content);
        if (content.type === 'private_payment') {
          // Use sender's Miden address from message, fallback to peer CDP address
          const senderAddress = content.senderMidenAddress || conversation.peerAddress || '';

          messages.push({
            noteId: content.noteId,
            amount: content.amount,
            senderAddress: senderAddress,
            timestamp: content.timestamp || msg.sentAt.toISOString(),
          });
        }
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
  await client.conversations.syncAll(['allowed']);

  // Stream all messages
  const stream = await client.conversations.streamAllMessages({
    consentStates: [ConsentState.Allowed],
    onValue: async (message) => {
      try {
        const content = JSON.parse(message.content);
        if (content.type === 'private_payment') {
          // Use sender's Miden address from message, fallback to peer CDP address
          const conversations = await client.conversations.listDms({
            consentStates: [ConsentState.Allowed],
          });

          const conversation = conversations.find(
            conv => conv.topic === message.conversationTopic
          );

          const senderAddress = content.senderMidenAddress || conversation?.peerAddress || '';

          onMessage({
            noteId: content.noteId,
            amount: content.amount,
            senderAddress: senderAddress,
            timestamp: content.timestamp || message.sentAt.toISOString(),
          });
        }
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
