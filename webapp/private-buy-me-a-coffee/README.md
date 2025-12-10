# Private Buy Me a Coffee

A private "Buy Me a Coffee" style application built on the Miden blockchain, enabling creators to receive private HLT token payments from supporters using Miden wallet authentication.

Built with Next.js, TypeScript, Tailwind CSS, and SQLite by [Heimlabs.com](https://heimlabs.com).

## Overview

This application allows creators to set up public profiles and receive private HLT token payments from supporters. All transactions are private on the Miden blockchain, ensuring complete privacy for both creators and supporters. Creators can claim received payments (consumable notes) directly in their dashboard.

## Features

- **Wallet-Based Authentication**: No traditional authentication - users are identified by their Miden wallet address
- **Creator Profiles**: Simple profile creation with name and bio, stored in SQLite database
- **Private Payments**: Supporters can send private HLT token payments (minimum 10 HLT) to creators
- **Payment Management**: Creators can view and consume unsettled payments (notes) in their dashboard
- **Public Creator Pages**: Each creator gets a unique public page at `/c/[walletAddress]`
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **SQLite Database**: Lightweight local database for creator profiles

## How It Works

### For Creators

1. **Connect Wallet**: Connect your Miden wallet to the application
2. **Create Profile**: Navigate to the dashboard and set up your profile with:
   - Name (required)
   - Bio (optional)
3. **Share Your Link**: Copy your public link (`/c/[your-wallet-address]`) and share it with supporters
4. **Receive Payments**: Supporters send private HLT payments directly to your wallet
5. **Claim Payments**: View unsettled payments in your dashboard and consume them to add tokens to your vault
6. **View Balance**: Check your HLT balance in your Miden wallet

### For Supporters

1. **Visit Creator Page**: Navigate to a creator's public page using their wallet address
2. **Connect Wallet**: Connect your Miden wallet
3. **Enter Amount**: Enter the amount of HLT tokens to send (minimum 10 HLT)
4. **Send Payment**: Click "Pay privately with Miden" to initiate a private transaction
5. **Transaction Complete**: The payment is sent directly to the creator's wallet as a private note

### Payment Flow

```
Supporter → Private Transaction → Creator's Wallet (as consumable note)
                                    ↓
                            Creator claims note in dashboard
                                    ↓
                            Tokens added to creator's vault
```

**Important**: All payments are sent directly to the creator's wallet. The dashboard shows unsettled notes that can be claimed. Once claimed, tokens appear in the creator's wallet balance.

## Prerequisites

- Node.js 18+
- Yarn package manager
- A Miden-compatible wallet (for connecting and transactions)

## Installation

1. Navigate to the app directory:
   ```bash
   cd webapp/private-buy-me-a-coffee
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

## Configuration

Key configuration values are in `app/constants.ts`:

- **HLT_FAUCET_ID**: `mm1arajukt424pyvgrcgg6wxnycwvezgzey` - The HLT token faucet ID
- **MIN_PAYMENT_AMOUNT**: `10` - Minimum payment amount in HLT tokens
- **TOKEN_DECIMALS**: `8` - Number of decimals for HLT tokens
- **NODE_ENDPOINT**: `https://rpc.testnet.miden.io:443` - Miden testnet RPC endpoint

### Database

The application uses SQLite for storing creator profiles. The database file is created automatically at `data/coffee.db` on first run.

**Schema**:
- `creators` table with:
  - `id` (INTEGER PRIMARY KEY)
  - `walletAddress` (TEXT UNIQUE NOT NULL)
  - `name` (TEXT NOT NULL)
  - `bio` (TEXT nullable)
  - `createdAt` (DATETIME)
  - `updatedAt` (DATETIME)

## Project Structure

```
private-buy-me-a-coffee/
├── app/
│   ├── api/
│   │   ├── creator/
│   │   │   └── [walletAddress]/
│   │   │       └── route.ts          # GET creator by wallet address
│   │   └── profile/
│   │       └── route.ts              # POST create/update creator profile
│   ├── c/
│   │   └── [walletAddress]/
│   │       └── page.tsx              # Public creator page
│   ├── components/
│   │   ├── CreatorProfileForm.tsx   # Profile editing form
│   │   ├── Navbar.tsx               # Navigation bar
│   │   ├── PaymentsTable.tsx        # Payments/notes table component
│   │   ├── SupportCard.tsx          # Payment card component
│   │   └── WalletProviders.tsx      # Wallet connection providers
│   ├── dashboard/
│   │   └── page.tsx                 # Creator dashboard
│   ├── lib/
│   │   └── db.ts                    # SQLite database setup and helpers
│   ├── constants.ts                 # Configuration constants
│   ├── utils.ts                     # Utility functions (transactions, notes, etc.)
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # App layout
│   └── globals.css                  # Global styles
├── data/
│   └── coffee.db                    # SQLite database (auto-created)
├── package.json                     # Dependencies and scripts
├── next.config.ts                   # Next.js configuration
└── tailwind.config.js               # Tailwind CSS configuration
```
### Important Notes

- **Database**: The SQLite database file (`data/coffee.db`) is automatically created on first run
- **Wallet Address**: Used as the unique identifier for creators (no traditional authentication)
- **Private Transactions**: All payments are private transactions on the Miden blockchain
- **Note Consumption**: Creators must consume notes to add tokens to their vault - payments don't automatically appear in balance
- **Network**: Currently configured for Miden Testnet

