# Bonding Curve Token UI

This is an example Next.js UI for interacting with the bonding curve token contract.

## Features

- **Wallet Connection**: Connect your wallet using RainbowKit with support for multiple wallet providers
- **Token Metadata Display**: View real-time token information including:
  - Token name and symbol
  - Total supply
  - Initial price and slope parameters
  - Current price based on the bonding curve
  - Contract address with copy-to-clipboard functionality
- **Swap Interface**:
  - Buy tokens with TIA (native currency)
  - Sell tokens back to the contract
  - Real-time price calculations and rate display
  - Slippage protection for buy transactions
  - Estimated output calculations before confirming transactions
  - Max button to quickly input your full balance
- **Portfolio View**:
  - Display your NAT token balance
  - Calculate and display your net worth in TIA
- **Real-time Updates**: Contract data automatically refreshes every 10 seconds
- **Transaction Management**:
  - Loading states during transactions
  - Success and error notifications
  - Transaction state reset functionality
- **Balance Display**: View both your NAT token balance and TIA balance

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- yarn

### Installation

1. Install dependencies:

```bash
yarn install
```

### Environment Setup

1. Rename `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and fill in the required environment variables:

```env
# Required: The deployed bonding curve token contract address
NEXT_PUBLIC_TOKEN_CONTRACT=0x...

# Required: WalletConnect Project ID (for wallet connection)
# Get one at https://dashboard.reown.com/sign-in
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

**Note**: Both `NEXT_PUBLIC_TOKEN_CONTRACT` and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` are required. The application will throw an error if either is not set.

### Running the Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
yarn build
yarn start
```

## How It Works

The UI connects to a bonding curve token contract deployed on the Celestia EDEN testnet. The bonding curve uses a linear pricing model where:

- Token price increases as supply increases
- Users can buy tokens by sending TIA to the contract
- Users can sell tokens back to the contract to receive TIA
- The price is calculated algorithmically based on the current supply

The application uses:

- **wagmi** and **viem** for Ethereum/Web3 interactions
- **RainbowKit** for wallet connection UI
- **TanStack Query** for data fetching and caching
- **Next.js 15** with the App Router
- **Tailwind CSS** and **DaisyUI** for styling

## Project Structure

```
ui/
├── app/
│   ├── components/     # React components (SwapCard, Portfolio, TokenMetaCard, etc.)
│   ├── hooks/          # Custom React hooks for contract interactions
│   ├── page.tsx        # Main page component
│   └── providers.tsx   # Web3 providers setup
├── lib/
│   ├── contract.ts     # Contract ABI and interaction functions
│   └── format.ts       # Utility functions for formatting numbers
└── public/             # Static assets (images, fonts)
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://rainbowkit.com)

## Disclaimer

This repo is for educational and hackathon purposes only. All vault, yield, and financial product references are illustrative ideas for developers, not investment products or live offerings. Celestia Labs does not operate the Eden network or any third-party apps mentioned.
