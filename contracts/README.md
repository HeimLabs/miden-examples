# Miden Contracts

This directory contains smart contract and deployment scripts for [Miden.xyz](https://miden.xyz) by [Heimlabs.com](https://heimlabs.com).

## Overview

The contracts in this repository are written in Miden Assembly (MASM) and deployed using the Miden client. These contracts demonstrate core functionality of the Miden rollup and can be interacted with through web applications.

## Available Contracts

### 1. Counter Contract

A simple counter contract that demonstrates basic state management on Miden.

**Location:** `masm/accounts/counter.masm`

**Functions:**
- `get_count()` - Returns the current counter value
- `increment_count()` - Increments the counter by 1

**Features:**
- Single storage slot for counter value
- Public storage mode
- Immutable code account type

## Prerequisites

- Rust (latest stable version)
- Cargo package manager

## Installation

1. Navigate to the contracts directory:
   ```bash
   cd contracts
   ```

2. Install dependencies:
   ```bash
   cargo build --release
   ```

## Usage

### Deploy Counter Contract

Run the deployment script to create and deploy the counter contract to Miden testnet:

```bash
cargo run --release
```

This command will:
1. Initialize a Miden client connected to testnet
2. Compile the counter contract from MASM source
3. Deploy the contract to the network
4. Execute a test increment transaction
5. Output the contract ID (Bech32 format)

### Example Output

```
Latest block: 12345

[STEP 1] Creating counter contract.
counter_contract commitment: ...
counter_contract id: ...
counter_contract storage: ...

[STEP 2] Call Counter Contract With Script
View transaction on MidenScan: https://testnet.midenscan.com/tx/...
Counter contract id: mtst1arjemrxne8lj5qz4mg9c8mtyxg954483
```

### Using Contract ID in Web App

Copy the contract ID from the output (e.g., `mtst1arjemrxne8lj5qz4mg9c8mtyxg954483`) and use it in your web application configuration.

## Project Structure

```
contracts/
├── src/main.rs              # Deployment and testing script
├── masm/
│   ├── accounts/
│   │   └── counter.masm     # Counter contract definition
│   └── scripts/
│       └── counter_script.masm  # Transaction script for incrementing
├── Cargo.toml               # Rust dependencies
├── store.sqlite3            # Local state store (generated)
└── keystore/                # Account keys (generated)
```

## Development

### Adding New Contracts

1. Create your MASM contract file in `masm/accounts/`
2. Add compilation logic to `src/main.rs`
3. Update the deployment script as needed

### Testing Contracts

The main script includes a test transaction that demonstrates contract functionality. Modify the script in `src/main.rs` to test your contracts.

## Integration

These contracts are designed to work with the companion web application in the `webapp/` directory. The web app can interact with deployed contracts using the contract IDs obtained from running the deployment script.