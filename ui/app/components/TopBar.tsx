"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function TopBar() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-4 flex items-center justify-end">
      <ConnectButton />
    </div>
  );
}


