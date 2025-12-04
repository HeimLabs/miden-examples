# Miden Counter Web App

A standalone web application for interacting with the Miden Counter smart contract on [Miden.xyz](https://miden.xyz) by [Heimlabs.com](https://heimlabs.com).

## Overview

This Next.js application provides a clean, focused interface for incrementing and viewing a counter stored on the Miden rollup. It demonstrates how to interact with Miden smart contracts through a modern web application using the Miden SDK and wallet adapter.

## Features

- **Wallet Integration**: Connect Miden-compatible wallets
- **Counter Display**: Real-time display of current counter value
- **Increment Functionality**: Increment the counter with transaction confirmation
- **Transaction Tracking**: View transaction details on MidenScan
- **Responsive Design**: Modern UI built with Tailwind CSS

## Prerequisites

- Node.js 18+
- Yarn package manager
- A Miden-compatible wallet (for incrementing the counter)

## Installation

1. Navigate to the counter app directory:
   ```bash
   cd webapp/counter
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

1. Click the "Connect Wallet" button
2. Select your Miden-compatible wallet
3. Approve the connection

### Incrementing the Counter

1. Ensure your wallet is connected
2. Click the "Increment" button
3. Approve the transaction in your wallet
4. View the transaction confirmation and updated counter value

### Viewing Transactions

- Click the transaction link to view details on MidenScan
- The counter value updates automatically after each successful transaction

## Configuration

The application is configured to work with a deployed Counter contract. Key settings can be found in `app/constants.ts`:

- **Contract Address**: `mtst1arjemrxne8lj5qz4mg9c8mtyxg954483`
- **Network**: Miden Testnet
- **RPC Endpoint**: `https://rpc.testnet.miden.io`

## Project Structure

```
counter/
├── app/
│   ├── components/
│   │   └── WalletProviders.tsx    # Wallet connection providers
│   ├── constants.ts               # Contract addresses and configuration
│   ├── utils.ts                   # Utility functions for contract interactions
│   ├── page.tsx                   # Main counter interface
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

- **Components**: Reusable UI components
- **Utils**: Contract interaction utilities (DRY principle)
- **Constants**: Configuration values (contract addresses, endpoints)
- **Pages**: Route-specific components

### Contract Integration

The app integrates with the Counter contract deployed using the contracts in `../../contracts/`. To use a different contract:

1. Deploy a new contract using the contracts setup
2. Update `COUNTER_CONTRACT_ADDRESS` in `app/constants.ts`
3. Update `COUNTER_CONTRACT_CODE` if the contract interface changes

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Miden SDK (@demox-labs/miden-sdk)
- **Wallets**: Miden Wallet Adapter (@demox-labs/miden-wallet-adapter)
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

## Integration

This counter app is designed to work with contracts deployed using the companion contracts setup in `../../contracts/`. The contract ID obtained from running the deployment script should be used in the constants file.
