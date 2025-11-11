"use client";

import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { useState } from "react";
import { 
  readCalculateCost,
  readCalculateRefund,
  readCalculateTokensForTia,
  writeMintTokens,
  writeBurnTokens
} from "../../lib/contract";

type TransactionState = "idle" | "loading" | "success" | "error";

export function useContractWrite() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  
  const [buyState, setBuyState] = useState<TransactionState>("idle");
  const [sellState, setSellState] = useState<TransactionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const buyTokens = async (tiaAmount: string, slippagePercent: string = "0") => {
    if (!publicClient || !walletClient || !address) {
      setError("Wallet not connected");
      return;
    }

    setBuyState("loading");
    setError(null);

    try {
      const tiaWei = BigInt(Math.floor(parseFloat(tiaAmount) * 1e18));

      // Estimate tokens out via onchain formula using binary search (same as calculateTokensForTia)
      const tokensOutStr = await calculateTokensForTia(tiaAmount);
      const tokensOut = parseFloat(tokensOutStr || "0");
      const tokensOutWei = BigInt(Math.floor(tokensOut * 1e18));

      // Compute minTokenOut by applying slippage percent (e.g., 1% => 0.99 * expected)
      const slip = Math.max(0, Math.min(100, parseFloat(slippagePercent || "0")));
      const minOut = tokensOut * (1 - slip / 100);
      const minTokenOutWei = BigInt(Math.floor(minOut * 1e18));

      // Call explicit mint(amount, minTokenOut) using the expected amount
      const receipt = await writeMintTokens({
        publicClient,
        walletClient,
        account: address,
        amount: tokensOutWei,
        minTokenOut: minTokenOutWei,
        value: tiaWei,
      });

      setBuyState("success");
      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Buy transaction failed";
      setError(errorMessage);
      setBuyState("error");
      throw err;
    }
  };

  const sellTokens = async (tokenAmount: string, minTia: string = "0") => {
    if (!publicClient || !walletClient || !address) {
      setError("Wallet not connected");
      return;
    }

    setSellState("loading");
    setError(null);

    try {
      const tokenWei = BigInt(Math.floor(parseFloat(tokenAmount) * 1e18));
      
      // Use burnTokens to sell tokens back to the contract
      const receipt = await writeBurnTokens({
        publicClient,
        walletClient,
        account: address,
        amount: tokenWei,
      });

      setSellState("success");
      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sell transaction failed";
      setError(errorMessage);
      setSellState("error");
      throw err;
    }
  };

  const calculateTokensForTia = async (tiaAmount: string) => {
    if (!publicClient) {
      console.log("No public client");
      return "0";
    }
    
    try {
      const parsedAmount = parseFloat(tiaAmount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return "0";
      }

      const tiaWei = BigInt(Math.floor(parsedAmount * 1e18));
      const tokensWei = await readCalculateTokensForTia(publicClient, tiaWei);
      const result = (Number(tokensWei) / 1e18).toString();
      console.log("Calculated tokens for TIA:", result, "TIA amount:", tiaAmount);
      return result;
    } catch (error) {
      console.error("Error calculating tokens for TIA:", error);
      return "0";
    }
  };

  const calculateTiaForTokens = async (tokenAmount: string) => {
    if (!publicClient) return "0";
    
    try {
      const tokenWei = BigInt(Math.floor(parseFloat(tokenAmount) * 1e18));
      const cost = await readCalculateCost(publicClient, tokenWei);
      return (Number(cost) / 1e18).toString();
    } catch {
      return "0";
    }
  };

  const calculateRateForOneTia = async () => {
    const result = await calculateTokensForTia("1.0");
    console.log("Rate for 1 TIA:", result);
    return result;
  };

  const calculateRefundForTokens = async (tokenAmount: string) => {
    if (!publicClient) return "0";
    
    try {
      const tokenWei = BigInt(Math.floor(parseFloat(tokenAmount) * 1e18));
      const refund = await readCalculateRefund(publicClient, tokenWei);
      return (Number(refund) / 1e18).toString();
    } catch {
      return "0";
    }
  };

  const resetStates = () => {
    setBuyState("idle");
    setSellState("idle");
    setError(null);
  };

  return {
    buyTokens,
    sellTokens,
    calculateTokensForTia,
    calculateTiaForTokens,
    calculateRefundForTokens,
    calculateRateForOneTia,
    buyState,
    sellState,
    error,
    resetStates,
    isConnected: !!address,
  };
}
