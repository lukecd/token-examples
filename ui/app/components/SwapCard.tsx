"use client";

import React, { useState, useEffect } from "react";
import { useContractWrite } from "../hooks/useContractWrite";
import { useUserBalance, useUserTiaBalance } from "../hooks/useContractData";
import { formatNumber } from "../../lib/format";
import TVStaticGlitch from "./TVStaticGlitch";

type SwapCardProps = {
  baseLabel: string;
  quoteLabel: string;
};

export function SwapCard({ baseLabel, quoteLabel }: SwapCardProps) {
  const { balance: userBalance } = useUserBalance();
  const { tiaBalance: userTiaBalance } = useUserTiaBalance();
  const {
    buyTokens,
    sellTokens,
    calculateTokensForTia,
    calculateTiaForTokens,
    calculateRateForOneTia,
    buyState,
    sellState,
    error,
    resetStates,
    isConnected,
  } = useContractWrite();

  const [tiaAmount, setTiaAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [estimatedTokens, setEstimatedTokens] = useState("");
  const [estimatedTia, setEstimatedTia] = useState("");
  const [rateForOneTia, setRateForOneTia] = useState("");
  const [isBuyMode, setIsBuyMode] = useState(true);
  const [slippagePct, setSlippagePct] = useState<string>("1.0"); // default 1%

  // Calculate rate for 1 TIA (this should be constant)
  useEffect(() => {
    const calculateRate = async () => {
      const rate = await calculateRateForOneTia();
      setRateForOneTia(rate);
    };
    calculateRate();
  }, [calculateRateForOneTia]);

  // Calculate estimated output when input changes
  useEffect(() => {
    const calculateOutput = async () => {
      if (isBuyMode && tiaAmount) {
        const tokens = await calculateTokensForTia(tiaAmount);
        setEstimatedTokens(tokens);
      } else if (!isBuyMode && tokenAmount) {
        const tia = await calculateTiaForTokens(tokenAmount);
        setEstimatedTia(tia);
      }
    };

    calculateOutput();
  }, [tiaAmount, tokenAmount, isBuyMode, calculateTokensForTia, calculateTiaForTokens]);

  const handleSwap = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      if (isBuyMode) {
        await buyTokens(tiaAmount, slippagePct);
        setTiaAmount("");
        setEstimatedTokens("");
      } else {
        await sellTokens(tokenAmount, "0"); // No slippage protection for now
        setTokenAmount("");
        setEstimatedTia("");
      }
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const isTransactionLoading = buyState === "loading" || sellState === "loading";
  const canSwap = isConnected && !isTransactionLoading && 
    ((isBuyMode && tiaAmount && parseFloat(tiaAmount) > 0) || 
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
                setEstimatedTia("");
                resetStates();
              }}
            >
              Buy
            </button>
            <button
              className={`btn btn-sm ${!isBuyMode ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setIsBuyMode(false);
                setTiaAmount("");
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
                  {userTiaBalance && parseFloat(userTiaBalance) > 0 && (
                    <span className="label-text-alt text-primary">
                      Balance: {formatNumber(parseFloat(userTiaBalance))} {quoteLabel}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="0.0"
                    className="input input-bordered flex-1"
                    value={tiaAmount}
                    onChange={(e) => setTiaAmount(e.target.value)}
                    disabled={isTransactionLoading}
                  />
                  {userTiaBalance && parseFloat(userTiaBalance) > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setTiaAmount(userTiaBalance)}
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
                  value={estimatedTia ? formatNumber(parseFloat(estimatedTia)) : ""}
                  readOnly
                />
              </label>
            </>
          )}

          <div className="text-sm text-base-content/60">
            {isBuyMode ? (
              <>Rate: 1 {quoteLabel} = {rateForOneTia ? formatNumber(parseFloat(rateForOneTia)) : "—"} {baseLabel}</>
            ) : (
              <>Rate: 1 {baseLabel} = {estimatedTia && tokenAmount ? formatNumber(parseFloat(estimatedTia) / parseFloat(tokenAmount)) : "—"} {quoteLabel}</>
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