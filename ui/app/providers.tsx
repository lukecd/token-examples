"use client";

import { ReactNode } from "react";
import { RainbowKitProvider, getDefaultConfig, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { defineChain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@rainbow-me/rainbowkit/styles.css";

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const eden = defineChain({
  id: 3735928814,
  name: "Celestia EDEN",
  nativeCurrency: { name: "TIA", symbol: "TIA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.eden.gateway.fm"] },
    public: { http: ["https://rpc.testnet.eden.gateway.fm"] },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: "EdenSwap",
  projectId: wcProjectId,
  chains: [eden],
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={eden} theme={lightTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


