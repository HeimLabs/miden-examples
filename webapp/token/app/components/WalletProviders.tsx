"use client";

import React from "react";
import {
  WalletProvider,
  WalletModalProvider,
  MidenWalletAdapter,
  AllowedPrivateData,
  PrivateDataPermission,
  WalletAdapterNetwork,
} from "@demox-labs/miden-wallet-adapter";
import "@demox-labs/miden-wallet-adapter/styles.css";

const wallets = [new MidenWalletAdapter({ appName: "Miden Token Mint App" })];

export function WalletProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider
      wallets={wallets}
      privateDataPermission={PrivateDataPermission.UponRequest}
      network={WalletAdapterNetwork.Testnet}
      allowedPrivateData={AllowedPrivateData.None}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
}