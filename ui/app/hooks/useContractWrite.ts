"use client";

import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { useState } from "react";
import { 
  readCalculateCost,
  readCalculateRefund,
  writeMintTokensWithEth,
  writeBurnTokens,
  linearBondingTokenAbi,
  getContractAddress
} from "../../lib/contract";

type TransactionState = "idle" | "loading" | "success" | "error";

export function useContractWrite() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  
  const [buyState, setBuyState] = useState<TransactionState>("idle");
  const [sellState, setSellState] = useState<TransactionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const buyTokens = async (ethAmount: string, minTokens: string = "0") => {
    if (!publicClient || !walletClient || !address) {
      setError("Wallet not connected");
      return;
    }

    setBuyState("loading");
    setError(null);

    try {
      const ethWei = BigInt(Math.floor(parseFloat(ethAmount) * 1e18));
      
      // Use mintTokensWithEth for automatic token calculation
      const receipt = await writeMintTokensWithEth({
        publicClient,
        walletClient,
        account: address,
        value: ethWei,
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

  const sellTokens = async (tokenAmount: string, minEth: string = "0") => {
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

  const calculateTokensForEth = async (ethAmount: string) => {
    if (!publicClient) {
      console.log("No public client");
      return "0";
    }
    
    try {
      const ethWei = BigInt(Math.floor(parseFloat(ethAmount) * 1e18));
      
      // Get current contract parameters
      const [slope, initialPrice, totalSupply] = await Promise.all([
        publicClient.readContract({ address: getContractAddress(), abi: linearBondingTokenAbi, functionName: "slope" }),
        publicClient.readContract({ address: getContractAddress(), abi: linearBondingTokenAbi, functionName: "initialPrice" }),
        publicClient.readContract({ address: getContractAddress(), abi: linearBondingTokenAbi, functionName: "totalSupply" })
      ]);
      
      console.log("Contract parameters:", {
        slope: slope.toString(),
        initialPrice: initialPrice.toString(),
        totalSupply: totalSupply.toString(),
        ethWei: ethWei.toString()
      });
      
      // Handle the case when totalSupply is 0 (initial purchase)
      let bestTokens = BigInt(0);
      
      if (totalSupply === BigInt(0)) {
        // For initial purchase, the formula is: cost = (a * n²) / 2 + b * n
        // Rearranging: (a/2) * n² + b * n - cost = 0
        // This is a quadratic equation: A * n² + B * n - C = 0
        // Where: A = a/2, B = b, C = cost
        // Solution: n = (-B + sqrt(B² + 4AC)) / (2A)
        
        const a = slope;
        const b = initialPrice;
        const cost = ethWei;
        
        const A = a / BigInt(2);
        const B = b;
        const C = cost;
        
        // Calculate discriminant: B² + 4AC
        const discriminant = (B * B) + (BigInt(4) * A * C);
        
        if (discriminant >= BigInt(0)) {
          // Calculate square root (simplified)
          const sqrtDiscriminant = BigInt(Math.floor(Math.sqrt(Number(discriminant))));
          
          // Calculate the positive solution
          const numerator = sqrtDiscriminant - B;
          const denominator = BigInt(2) * A;
          
          if (denominator > BigInt(0)) {
            bestTokens = (numerator * BigInt(1e18)) / denominator;
          }
        }
      } else {
        // Use binary search for non-zero totalSupply
        let low = BigInt(0);
        let high = ethWei / initialPrice;
        
        if (high < BigInt(1000)) {
          high = BigInt(1000000);
        }
        
        let bestDiff = ethWei;
        
        // Binary search for the solution
        for (let i = 0; i < 100; i++) { // Max 100 iterations
          const mid = (low + high) / BigInt(2);
          
          // Calculate cost for this number of tokens
          // Formula: cost = a * s * n + (a * n²) / 2 + b * n
          // Where: a = slope, s = totalSupply, b = initialPrice, n = mid
          // Convert to token units (without decimals) like the contract does
          const amountInTokens = mid / BigInt(1e18);
          const sInTokens = totalSupply / BigInt(1e18);
          
          const term1 = slope * sInTokens * amountInTokens;
          const term2 = (slope * amountInTokens * amountInTokens) / BigInt(2);
          const term3 = initialPrice * amountInTokens;
          
          const cost = term1 + term2 + term3;
          
          const diff = cost > ethWei ? cost - ethWei : ethWei - cost;
          
          if (diff < bestDiff) {
            bestDiff = diff;
            bestTokens = mid;
          }
          
          if (cost === ethWei) {
            bestTokens = mid;
            break;
          } else if (cost < ethWei) {
            low = mid + BigInt(1);
          } else {
            high = mid - BigInt(1);
          }
          
          if (low > high) break;
        }
      }
      
      // Convert back to human-readable format
      const result = (Number(bestTokens) / 1e18).toString();
      console.log("Calculated tokens for ETH:", result, "ETH amount:", ethAmount);
      return result;
    } catch (error) {
      console.error("Error calculating tokens for ETH:", error);
      return "0";
    }
  };

  const calculateEthForTokens = async (tokenAmount: string) => {
    if (!publicClient) return "0";
    
    try {
      const tokenWei = BigInt(Math.floor(parseFloat(tokenAmount) * 1e18));
      const cost = await readCalculateCost(publicClient, tokenWei);
      return (Number(cost) / 1e18).toString();
    } catch {
      return "0";
    }
  };

  const calculateRateForOneEth = async () => {
    const result = await calculateTokensForEth("1.0");
    console.log("Rate for 1 ETH:", result);
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
    calculateTokensForEth,
    calculateEthForTokens,
    calculateRefundForTokens,
    calculateRateForOneEth,
    buyState,
    sellState,
    error,
    resetStates,
    isConnected: !!address,
  };
}
