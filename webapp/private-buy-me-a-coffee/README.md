# Miden Token Minting Web App

A standalone web application for minting fungible tokens (ERC20) on [Miden.xyz](https://miden.xyz) by [Heimlabs.com](https://heimlabs.com).

## Overview

This Next.js application provides a clean, focused interface for deploying token faucets and minting tokens on the Miden rollup. It demonstrates how to create fungible tokens, mint them as P2ID notes, and consume those notes to add tokens to your vault using the Miden SDK and wallet adapter.

## Features

- **Wallet Integration**: Connect Miden-compatible wallets
- **Faucet Deployment**: Deploy your own token faucet with custom symbol, decimals, and initial supply
- **Token Minting**: Mint fungible tokens (ERC20) that create P2ID notes
- **Automatic Note Detection**: Automatically searches for consumable notes after minting
- **Note Consumption**: Consume notes via wallet adapter to add tokens to your vault
- **Transaction Tracking**: View transaction details on MidenScan
- **LocalStorage Persistence**: Faucet configuration is saved locally for convenience
- **Responsive Design**: Modern UI built with Tailwind CSS

## Prerequisites

- Node.js 18+
- Yarn package manager
- A Miden-compatible wallet (for deploying faucets and consuming notes)

## Installation

1. Navigate to the token app directory:
   ```bash
   cd webapp/token
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

### Deploying a Faucet

1. Navigate to the "Deploy Faucet" page using the navbar
2. Ensure your wallet is connected
3. Configure your token:
   - **Token Type**: Currently only ERC20 (Fungible) is supported
   - **Symbol**: Token symbol (e.g., "TEST", "MYTOKEN")
   - **Decimals**: Number of decimal places (typically 8)
   - **Initial Supply**: Total supply without decimals (e.g., 10000000 for 10M tokens)
4. Click "Deploy Faucet"
5. The faucet ID will be saved automatically and used for minting

### Minting Tokens

1. Navigate to the home page (Mint Tokens)
2. Ensure your wallet is connected
3. Enter or verify the faucet ID (or use a previously deployed faucet)
4. Enter the amount to mint (without decimals)
5. Click "Mint Tokens"
6. Wait for the transaction to be submitted
7. The app will automatically search for consumable notes
8. Once notes are found, click "Consume Notes" to import them into your wallet
9. Tokens will be added to your vault after successful consumption

### Viewing Transactions

- Click transaction links to view details on MidenScan
- Both mint and consume transaction hashes are displayed with links

## Configuration

The application is configured to work with the Miden Testnet. Key settings can be found in `app/constants.ts`:

- **Network**: Miden Testnet
- **RPC Endpoint**: `https://rpc.testnet.miden.io:443`
- **Default Faucet Config**: Symbol "TEST", 8 decimals, 10M initial supply

### Faucet Storage

Faucet information is stored in browser localStorage with the following keys:
- `miden_token_faucet_id`: The faucet account ID
- `miden_token_faucet_type`: Whether it's fungible or non-fungible
- `miden_token_faucet_symbol`: Token symbol
- `miden_token_faucet_decimals`: Number of decimals

## Project Structure

```
token/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation bar component
│   │   └── WalletProviders.tsx    # Wallet connection providers
│   ├── deploy/
│   │   └── page.tsx               # Faucet deployment page
│   ├── constants.ts               # Configuration constants
│   ├── utils.ts                   # Utility functions for client, faucet, and note operations
│   ├── page.tsx                   # Main minting interface
│   ├── layout.tsx                 # App layout and providers
│   └── globals.css                # Global styles
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
└── next.config.ts                 # Next.js configuration
```

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

### Code Organization

- **Components**: Reusable UI components (Navbar, WalletProviders)
- **Utils**: Client, faucet, and note operation utilities
- **Constants**: Configuration values (endpoints, storage keys, defaults)
- **Pages**: Route-specific components (home for minting, deploy for faucet creation)

### Token Minting Flow

1. **Deploy Faucet**: User creates a faucet account with token configuration
2. **Mint Tokens**: Faucet mints tokens, creating P2ID notes for the recipient
3. **Note Detection**: App polls for consumable notes after mint transaction
4. **Consume Notes**: User consumes notes via wallet adapter to add tokens to vault

### Important Notes

- **ERC721 Support**: Non-fungible tokens (ERC721) are not yet supported. Only ERC20 tokens can be deployed and minted.