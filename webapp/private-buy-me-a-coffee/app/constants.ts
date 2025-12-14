export const NODE_ENDPOINT = "https://rpc.testnet.miden.io:443";

// HLT Token Configuration
export const HLT_FAUCET_ID = "mm1apr6jyg277q0ugr6rgeg5ushjy39j8u6";
export const MIN_PAYMENT_AMOUNT = 10;
export const TOKEN_DECIMALS = 8;

// LocalStorage keys
export const STORAGE_KEYS = {
  FAUCET_ID: "miden_token_faucet_id",
  FAUCET_TYPE: "miden_token_faucet_type",
  FAUCET_SYMBOL: "miden_token_faucet_symbol",
  FAUCET_DECIMALS: "miden_token_faucet_decimals",
} as const;

// Default faucet configuration
export const DEFAULT_FAUCET_CONFIG = {
  SYMBOL: "TEST",
  DECIMALS: 8,
  INITIAL_SUPPLY: BigInt(10_000_000 * 10 ** 8),
} as const;
