# Miden Marketplace Web App

A standalone web application for purchasing digital assets on [Miden.xyz](https://miden.xyz) by [Heimlabs.com](https://heimlabs.com).

## Overview

This Next.js application provides a marketplace interface where users can purchase digital assets using MIDEN tokens and receive HLT tokens as rewards. It demonstrates how to build a token-based marketplace on the Miden rollup using the Miden SDK and wallet adapter.

## Features

- **Wallet Integration**: Connect Miden-compatible wallets
- **Asset Marketplace**: Browse and purchase digital assets with images
- **Token Payments**: Pay with MIDEN tokens for purchases
- **Reward System**: Receive HLT tokens as rewards for purchases
- **Automatic Note Detection**: Automatically searches for consumable reward notes
- **Note Consumption**: Consume notes via wallet adapter to add reward tokens to your vault
- **Transaction Tracking**: View transaction details on MidenScan
- **Responsive Design**: Modern UI built with Tailwind CSS

## Prerequisites

- Node.js 18+
- Yarn package manager
- A Miden-compatible wallet (for making purchases)
- MIDEN tokens in your wallet (for purchasing assets)

## Installation

1. Navigate to the marketplace app directory:
   ```bash
   cd webapp/marketplace
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Connecting a Wallet

1. Click the "Connect Wallet" button in the top right
2. Select your Miden-compatible wallet
3. Approve the connection

### Purchasing Assets

1. Browse the marketplace to see available digital assets
2. Each asset displays:
   - Image preview
   - Name and description
   - Price in MIDEN tokens
   - HLT token reward amount
3. Click "Purchase" on any asset
4. Approve the MIDEN token transfer in your wallet
5. Wait for the transaction to be processed
6. HLT tokens will be minted as a reward
7. The app will automatically search for consumable reward notes
8. Once notes are found, click "Consume Reward Tokens" to import them into your wallet
9. HLT tokens will be added to your vault after successful consumption

### Viewing Transactions

- Click transaction links to view details on MidenScan
- Purchase, reward mint, and consume transaction hashes are displayed with links

## Configuration

The application is configured to work with the Miden Testnet. Key settings can be found in `app/constants.ts`:

- **Network**: Miden Testnet
- **RPC Endpoint**: `https://rpc.testnet.miden.io:443`
- **MIDEN Faucet ID**: `mtst1ap2t7nsjausqsgrswk9syfzkcu328yna` (payment token)
- **HLT Faucet ID**: `mm1arajukt424pyvgrcgg6wxnycwvezgzey` (reward token)
- **Token Decimals**: 8 (for both MIDEN and HLT)

### Marketplace Assets

Assets are defined in `app/constants.ts` with the following structure:
- Unique ID
- Name and description
- Image URL
- Price in MIDEN tokens
- HLT token reward amount

## Project Structure

```
marketplace/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation bar component
│   │   └── WalletProviders.tsx    # Wallet connection providers
│   ├── constants.ts                # Configuration constants and asset definitions
│   ├── utils.ts                    # Utility functions for client and note operations
│   ├── page.tsx                    # Main marketplace interface
│   ├── layout.tsx                  # App layout and providers
│   └── globals.css                 # Global styles
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
└── next.config.ts                  # Next.js configuration
```

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

### Code Organization

- **Components**: Reusable UI components (Navbar, WalletProviders)
- **Utils**: Client and note operation utilities
- **Constants**: Configuration values (endpoints, faucet IDs, marketplace assets)
- **Pages**: Main marketplace page with asset listings and purchase flow

### Purchase Flow

1. **User Initiates Purchase**: User clicks "Purchase" on an asset
2. **MIDEN Payment**: User sends MIDEN tokens via wallet adapter (SendTransaction)
3. **Reward Minting**: Marketplace mints HLT tokens to user's account (from HLT faucet)
4. **Note Detection**: App polls for consumable notes after reward transaction
5. **Consume Notes**: User consumes notes via wallet adapter to add HLT tokens to vault

### Important Notes

- **Payment**: MIDEN tokens are sent using the wallet adapter's `SendTransaction`
- **Rewards**: HLT tokens are minted as P2ID (Public-to-ID) notes that need to be consumed
- **Note Consumption**: Reward notes must be consumed through the wallet adapter to add tokens to your vault
- **Asset Images**: Currently using placeholder images from Unsplash. Replace with your own asset images.

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Miden SDK (@demox-labs/miden-sdk v0.12.3)
- **Wallets**: Miden Wallet Adapter (@demox-labs/miden-wallet-adapter v0.10.0)
- **State Management**: React hooks

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Deploy automatically on push to main branch
3. Environment variables can be configured in Vercel dashboard

### Manual Deployment

```bash
yarn build
yarn start
```

## Contributing

See `contributing.md` for contribution guidelines, including Markdown formatting with Prettier.

## Limitations

- Asset images are currently placeholder images
- Marketplace does not track ownership or prevent duplicate purchases
- No backend integration for asset metadata or inventory management

## Future Enhancements

- Backend integration for asset management
- User asset inventory/collection view
- Asset ownership tracking
- Multiple payment token options
- Asset categories and filtering
- Search functionality
- User profiles and purchase history
