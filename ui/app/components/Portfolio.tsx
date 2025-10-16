"use client";

import React from "react";
import { useUserBalance } from "../hooks/useContractData";
import { useContractData } from "../hooks/useContractData";
import { formatNumber } from "../../lib/format";

export function Portfolio() {
  const { balance: userBalance, isLoading: balanceLoading } = useUserBalance();
  const { data: contractData, isLoading: contractLoading } = useContractData();

  const isLoading = balanceLoading || contractLoading;

  if (isLoading) {
    return (
      <div className="card w-full bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Portfolio</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-base-content/60">NAT Balance</p>
              <p className="font-medium">...</p>
            </div>
            <div>
              <p className="text-base-content/60">Net Worth</p>
              <p className="font-medium">...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userBalance || !contractData) {
    return (
      <div className="card w-full bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Portfolio</h2>
          <div className="text-sm text-base-content/60">
            Connect your wallet to view your portfolio
          </div>
        </div>
      </div>
    );
  }

  // Calculate net worth: NAT balance * current price
  const natBalance = parseFloat(userBalance);
  const currentPrice = parseFloat(contractData.currentPrice.toString()) / 1e18; // Convert from wei
  const netWorth = natBalance * currentPrice;

  return (
    <div className="card w-full bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Portfolio</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-base-content/60">NAT Balance</p>
            <p className="font-medium">{formatNumber(natBalance)} NAT</p>
          </div>
          <div>
            <p className="text-base-content/60">Net Worth</p>
            <p className="font-medium">{formatNumber(netWorth)} ETH</p>
          </div>
        </div>
      </div>
    </div>
  );
}
