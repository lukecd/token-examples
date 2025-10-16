"use client";

import React, { useState } from "react";
import { useContractData } from "../hooks/useContractData";
import { formatEther } from "../../lib/format";
import { getContractAddress } from "../../lib/contract";

export function TokenMetaCard() {
  const { data, isLoading, error } = useContractData();
  const [copied, setCopied] = useState(false);
  const contractAddress = getContractAddress();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="card w-full max-w-xl bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Loading...</h2>
          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
            <div>
              <p className="text-base-content/60">Name</p>
              <p className="font-medium">...</p>
            </div>
            <div>
              <p className="text-base-content/60">Symbol</p>
              <p className="font-medium">...</p>
            </div>
            <div>
              <p className="text-base-content/60">Total Supply</p>
              <p className="font-medium">...</p>
            </div>
            <div>
              <p className="text-base-content/60">Initial Price</p>
              <p className="font-medium">...</p>
            </div>
            <div>
              <p className="text-base-content/60">Slope</p>
              <p className="font-medium">...</p>
            </div>
            <div>
              <p className="text-base-content/60">Current Price</p>
              <p className="font-medium">...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card w-full max-w-xl bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-error">Error Loading Contract</h2>
          <div className="text-error text-sm">
            {error instanceof Error ? error.message : "Failed to load contract data"}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card w-full max-w-xl bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-warning">No Data</h2>
          <div className="text-sm">No contract data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-xl bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">{data.name} ({data.symbol})</h2>
        <p className="text-sm text-base-content/60">Live contract data</p>
        
        {/* Contract Address */}
        <div className="mt-4 p-3 bg-base-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-base-content/60 mb-1">Contract Address</p>
              <p className="text-xs font-mono break-all">{contractAddress}</p>
            </div>
            <button
              onClick={copyToClipboard}
              className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline'}`}
              disabled={copied}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
          <div>
            <p className="text-base-content/60">Name</p>
            <p className="font-medium">{data.name}</p>
          </div>
          <div>
            <p className="text-base-content/60">Symbol</p>
            <p className="font-medium">{data.symbol}</p>
          </div>
          <div>
            <p className="text-base-content/60">Total Supply</p>
            <p className="font-medium">{formatEther(data.totalSupply)}</p>
          </div>
          <div>
            <p className="text-base-content/60">Initial Price</p>
            <p className="font-medium">{formatEther(data.initialPrice)} ETH</p>
          </div>
          <div>
            <p className="text-base-content/60">Slope</p>
            <p className="font-medium">{formatEther(data.slope)}</p>
          </div>
          <div>
            <p className="text-base-content/60">Current Price</p>
            <p className="font-medium">{formatEther(data.currentPrice)} ETH</p>
          </div>
        </div>
      </div>
    </div>
  );
}