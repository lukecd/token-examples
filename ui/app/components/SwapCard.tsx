"use client";

import React, { useState, useEffect } from "react";
import { useContractWrite } from "../hooks/useContractWrite";
import { useUserBalance, useUserEthBalance } from "../hooks/useContractData";
import { formatNumber } from "../../lib/format";
import TVStaticGlitch from "./TVStaticGlitch";

type SwapCardProps = {
  baseLabel: string;
  quoteLabel: string;
};

export function SwapCard({ baseLabel, quoteLabel }: SwapCardProps) {
  const { balance: userBalance } = useUserBalance();
  const { ethBalance: userEthBalance } = useUserEthBalance();
  const {
    buyTokens,
    sellTokens,
    calculateTokensForEth,
    calculateEthForTokens,
    calculateRateForOneEth,
    buyState,
    sellState,
    error,
    resetStates,
    isConnected,
  } = useContractWrite();

  const [ethAmount, setEthAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [estimatedTokens, setEstimatedTokens] = useState("");
  const [estimatedEth, setEstimatedEth] = useState("");
  const [rateForOneEth, setRateForOneEth] = useState("");
  const [isBuyMode, setIsBuyMode] = useState(true);
  const [slippagePct, setSlippagePct] = useState<string>("1.0"); // default 1%

  // Calculate rate for 1 ETH (this should be constant)
  useEffect(() => {
    const calculateRate = async () => {
      const rate = await calculateRateForOneEth();
      setRateForOneEth(rate);
    };
    calculateRate();
  }, [calculateRateForOneEth]);

  // Calculate estimated output when input changes
  useEffect(() => {
    const calculateOutput = async () => {
      if (isBuyMode && ethAmount) {
        const tokens = await calculateTokensForEth(ethAmount);
        setEstimatedTokens(tokens);
      } else if (!isBuyMode && tokenAmount) {
        const eth = await calculateEthForTokens(tokenAmount);
        setEstimatedEth(eth);
      }
    };

    calculateOutput();
  }, [ethAmount, tokenAmount, isBuyMode, calculateTokensForEth, calculateEthForTokens]);

  const handleSwap = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      if (isBuyMode) {
        await buyTokens(ethAmount, slippagePct);
        setEthAmount("");
        setEstimatedTokens("");
      } else {
        await sellTokens(tokenAmount, "0"); // No slippage protection for now
        setTokenAmount("");
        setEstimatedEth("");
      }
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const isTransactionLoading = buyState === "loading" || sellState === "loading";
  const canSwap = isConnected && !isTransactionLoading && 
    ((isBuyMode && ethAmount && parseFloat(ethAmount) > 0) || 
     (!isBuyMode && tokenAmount && parseFloat(tokenAmount) > 0));

  return (
    <div className="card w-full max-w-xl bg-base-100 shadow relative">
      <TVStaticGlitch isActive={isTransactionLoading} />
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Swap</h2>
          <div className="flex bg-base-200 rounded-lg p-1">
            <button
              className={`btn btn-sm ${isBuyMode ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setIsBuyMode(true);
                setTokenAmount("");
                setEstimatedEth("");
                resetStates();
              }}
            >
              Buy
            </button>
            <button
              className={`btn btn-sm ${!isBuyMode ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setIsBuyMode(false);
                setEthAmount("");
                setEstimatedTokens("");
                // Pre-fill with user's NAT balance
                if (userBalance && parseFloat(userBalance) > 0) {
                  setTokenAmount(userBalance);
                } else {
                  setTokenAmount("");
                }
                resetStates();
              }}
            >
              Sell
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={resetStates}>×</button>
          </div>
        )}

        {(buyState === "success" || sellState === "success") && (
          <div className="alert alert-success mb-4">
            <span>Transaction successful!</span>
            <button className="btn btn-sm btn-ghost" onClick={resetStates}>×</button>
          </div>
        )}

        <div className="space-y-4">
          {isBuyMode ? (
            <>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">From ({quoteLabel})</span>
                  {userEthBalance && parseFloat(userEthBalance) > 0 && (
                    <span className="label-text-alt text-primary">
                      Balance: {formatNumber(parseFloat(userEthBalance))} {quoteLabel}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="0.0"
                    className="input input-bordered flex-1"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    disabled={isTransactionLoading}
                  />
                  {userEthBalance && parseFloat(userEthBalance) > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setEthAmount(userEthBalance)}
                      disabled={isTransactionLoading}
                    >
                      Max
                    </button>
                  )}
                </div>
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">To ({baseLabel})</span>
                </div>
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-bordered w-full"
                  value={estimatedTokens ? formatNumber(parseFloat(estimatedTokens)) : ""}
                  readOnly
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Slippage (%)</span>
                  <span className="label-text-alt">Recommended: 1.0</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="1.0"
                  className="input input-bordered w-full"
                  value={slippagePct}
                  onChange={(e) => setSlippagePct(e.target.value)}
                  disabled={isTransactionLoading}
                />
              </label>
            </>
          ) : (
            <>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">From ({baseLabel})</span>
                  {userBalance && parseFloat(userBalance) > 0 && (
                    <span className="label-text-alt text-primary">
                      Balance: {formatNumber(parseFloat(userBalance))} {baseLabel}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="0.0"
                    className="input input-bordered flex-1"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    disabled={isTransactionLoading}
                  />
                  {userBalance && parseFloat(userBalance) > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setTokenAmount(userBalance)}
                      disabled={isTransactionLoading}
                    >
                      Max
                    </button>
                  )}
                </div>
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">To ({quoteLabel})</span>
                </div>
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-bordered w-full"
                  value={estimatedEth ? formatNumber(parseFloat(estimatedEth)) : ""}
                  readOnly
                />
              </label>
            </>
          )}

          <div className="text-sm text-base-content/60">
            {isBuyMode ? (
              <>Rate: 1 {quoteLabel} = {rateForOneEth ? formatNumber(parseFloat(rateForOneEth)) : "—"} {baseLabel}</>
            ) : (
              <>Rate: 1 {baseLabel} = {estimatedEth && tokenAmount ? formatNumber(parseFloat(estimatedEth) / parseFloat(tokenAmount)) : "—"} {quoteLabel}</>
            )}
          </div>

          <button
            className={`btn w-full ${canSwap ? 'btn-primary' : 'btn-disabled'}`}
            onClick={handleSwap}
            disabled={!canSwap}
          >
            {isTransactionLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {isBuyMode ? "Buying..." : "Selling..."}
              </>
            ) : (
              isBuyMode ? `Buy ${baseLabel}` : `Sell ${baseLabel}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}