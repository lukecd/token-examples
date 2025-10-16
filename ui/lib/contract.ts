import { type Address, type PublicClient, type WalletClient } from "viem";

// ABI for LinearBondingToken (updated for new contract)
export const linearBondingTokenAbi = [
  // ERC20 events
  { type: "event", name: "Transfer", inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ] },
  { type: "event", name: "Approval", inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ] },

  // ERC20 standard functions
  { type: "function", stateMutability: "view", name: "name", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", stateMutability: "view", name: "symbol", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", stateMutability: "pure", name: "decimals", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", stateMutability: "view", name: "totalSupply", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", stateMutability: "view", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", stateMutability: "view", name: "allowance", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },

  // Bonding curve parameters
  { type: "function", stateMutability: "view", name: "initialPrice", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", stateMutability: "view", name: "slope", inputs: [], outputs: [{ type: "uint256" }] },

  // Bonding curve functions
  { type: "function", stateMutability: "view", name: "getCurrentPrice", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", stateMutability: "view", name: "calculateCost", inputs: [{ name: "amount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", stateMutability: "view", name: "calculateRefund", inputs: [{ name: "amount", type: "uint256" }], outputs: [{ type: "uint256" }] },

  // Write functions (for future use)
  { type: "function", stateMutability: "nonpayable", name: "approve", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", stateMutability: "payable", name: "mintTokens", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", stateMutability: "payable", name: "mintTokensWithEth", inputs: [], outputs: [] },
  { type: "function", stateMutability: "nonpayable", name: "burnTokens", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
] as const;

export function getContractAddress(): Address {
  const addr = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as Address | undefined;
  if (!addr) throw new Error("NEXT_PUBLIC_TOKEN_CONTRACT is not set");
  return addr;
}

// ------------------
// Read helpers
// ------------------

export async function readName(client: PublicClient, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "name" });
}

export async function readSymbol(client: PublicClient, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "symbol" });
}

export async function readTotalSupply(client: PublicClient, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "totalSupply" });
}

export async function readInitialPrice(client: PublicClient, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "initialPrice" });
}

export async function readSlope(client: PublicClient, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "slope" });
}

export async function readCurrentPrice(client: PublicClient, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "getCurrentPrice" });
}

export async function readCalculateCost(client: PublicClient, amount: bigint, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "calculateCost", args: [amount] });
}

export async function readCalculateRefund(client: PublicClient, amount: bigint, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "calculateRefund", args: [amount] });
}

export async function readBalanceOf(client: PublicClient, owner: Address, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "balanceOf", args: [owner] });
}

export async function readAllowance(client: PublicClient, owner: Address, spender: Address, address = getContractAddress()) {
  return client.readContract({ address, abi: linearBondingTokenAbi, functionName: "allowance", args: [owner, spender] });
}

// ------------------
// Write helpers (simulate -> write -> wait)
// ------------------

type WriteDeps = { publicClient: PublicClient; walletClient: WalletClient; account: Address; address?: Address };

export async function writeMintTokens({ publicClient, walletClient, account, amount, value, address = getContractAddress() }: WriteDeps & { amount: bigint; value: bigint }) {
  const { request } = await publicClient.simulateContract({ address, abi: linearBondingTokenAbi, functionName: "mintTokens", args: [amount], account, value });
  const hash = await walletClient.writeContract(request);
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function writeMintTokensWithEth({ publicClient, walletClient, account, value, address = getContractAddress() }: WriteDeps & { value: bigint }) {
  const { request } = await publicClient.simulateContract({ address, abi: linearBondingTokenAbi, functionName: "mintTokensWithEth", args: [], account, value });
  const hash = await walletClient.writeContract(request);
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function writeBurnTokens({ publicClient, walletClient, account, amount, address = getContractAddress() }: WriteDeps & { amount: bigint }) {
  const { request } = await publicClient.simulateContract({ address, abi: linearBondingTokenAbi, functionName: "burnTokens", args: [amount], account });
  const hash = await walletClient.writeContract(request);
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function writeApprove({ publicClient, walletClient, account, spender, amount, address = getContractAddress() }: WriteDeps & { spender: Address; amount: bigint }) {
  const { request } = await publicClient.simulateContract({ address, abi: linearBondingTokenAbi, functionName: "approve", args: [spender, amount], account });
  const hash = await walletClient.writeContract(request);
  return publicClient.waitForTransactionReceipt({ hash });
}



