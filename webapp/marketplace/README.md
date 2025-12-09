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
7. The app will prompt for consumable reward notes
8. Click "Consume Reward Tokens" to import them into your wallet
9. HLT tokens will be added to your vault after successful consumption

## Configuration

The application is configured to work with the Miden Testnet. Key settings can be found in `app/constants.ts`:

- **Network**: Miden Testnet
- **RPC Endpoint**: `https://rpc.testnet.miden.io:443`
- **MIDEN Faucet ID**: `mtst1ap2t7nsjausqsgrswk9syfzkcu328yna` (payment token)
- **HLT Faucet ID**: `mm1arajukt424pyvgrcgg6wxnycwvezgzey` (reward token)
- **Token Decimals**: 8 (for both MIDEN and HLT)

>You can create your own faucets by using this [Tokens Example](../token/) 

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