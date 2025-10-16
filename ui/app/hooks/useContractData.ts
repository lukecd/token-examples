"use client";

import { usePublicClient, useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { 
  readName, 
  readSymbol, 
  readTotalSupply, 
  readInitialPrice,
  readSlope,
  readCurrentPrice,
  readBalanceOf,
  getContractAddress 
} from "../../lib/contract";

export function useContractData() {
  const publicClient = usePublicClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contractData"],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client");

      const contractAddress = getContractAddress();
      console.log("Contract address:", contractAddress);
      
      const [name, symbol, totalSupply, initialPrice, slope, currentPrice] = await Promise.all([
        readName(publicClient, contractAddress),
        readSymbol(publicClient, contractAddress),
        readTotalSupply(publicClient, contractAddress),
        readInitialPrice(publicClient, contractAddress),
        readSlope(publicClient, contractAddress),
        readCurrentPrice(publicClient, contractAddress),
      ]);

      console.log("Contract data:", { name, symbol, totalSupply, initialPrice, slope, currentPrice });

      return {
        name,
        symbol,
        totalSupply,
        initialPrice,
        slope,
        currentPrice,
      };
    },
    enabled: !!publicClient,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  return {
    data,
    isLoading,
    error,
    contractAddress: publicClient ? getContractAddress() : undefined,
  };
}

export function useUserBalance() {
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { data: balance, isLoading, error } = useQuery({
    queryKey: ["userBalance", address],
    queryFn: async () => {
      if (!publicClient || !address) throw new Error("No public client or address");
      const contractAddress = getContractAddress();
      const balance = await readBalanceOf(publicClient, address, contractAddress);
      return (Number(balance) / 1e18).toString(); // Convert from wei to human-readable format
    },
    enabled: !!publicClient && !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  return {
    balance,
    isLoading,
    error,
  };
}

export function useUserEthBalance() {
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { data: ethBalance, isLoading, error } = useQuery({
    queryKey: ["userEthBalance", address],
    queryFn: async () => {
      if (!publicClient || !address) throw new Error("No public client or address");
      const balance = await publicClient.getBalance({ address });
      return (Number(balance) / 1e18).toString(); // Convert from wei to human-readable format
    },
    enabled: !!publicClient && !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  return { ethBalance, isLoading, error };
}
