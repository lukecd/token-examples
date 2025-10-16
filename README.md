# Bonding Curve Token Examples

This repository contains educational examples demonstrating how to create and interact with **bonding curve tokens** on Ethereum. Bonding curves provide a novel way to price tokens based on supply, eliminating the need for traditional liquidity pools.

## 🎯 What You'll Learn

- **Smart Contract Development**: How to implement bonding curve pricing in Solidity
- **Mathematical Concepts**: Understanding linear bonding curves and price discovery
- **Frontend Integration**: Building a React/Next.js interface for token trading
- **Web3 Development**: Connecting smart contracts to modern web applications

## 📁 Project Structure

```
├── contracts/          # Solidity smart contracts and tests
│   ├── src/           # Contract source code
│   ├── test/          # Foundry test suite
│   └── script/        # Deployment scripts
├── ui/                # Next.js frontend application
│   ├── app/           # React components and pages
│   ├── lib/           # Utility functions and contract integration
│   └── public/        # Static assets
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) for smart contract development
- [Git](https://git-scm.com/)

### 1. Smart Contract Development

Navigate to the `contracts/` directory to work with the Solidity contracts:

```bash
cd contracts
```

**Install dependencies:**

```bash
forge install
```

**Run tests:**

```bash
forge test
```

**Deploy to local network:**

```bash
forge script script/DeployLinearBondingToken.s.sol --rpc-url http://localhost:8545 --broadcast
```

For detailed contract documentation, see [`contracts/README.md`](./contracts/README.md).

### 2. Frontend Development

Navigate to the `ui/` directory to work with the React application:

```bash
cd ui
```

**Install dependencies:**

```bash
npm install
```

**Start development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧮 Understanding Bonding Curves

### What is a Bonding Curve?

A bonding curve is a mathematical function that determines token price based on supply. Unlike traditional markets where price is set by supply and demand, bonding curves provide **algorithmic price discovery**.

### Key Benefits

- **No Liquidity Pools**: Tokens can be traded without external liquidity providers
- **Fair Pricing**: Everyone pays the same price for the same amount of tokens
- **Continuous Trading**: Buy and sell tokens at any time
- **Price Predictability**: Calculate exact costs before trading
- **Bootstrap Liquidity**: Create liquid markets from day one

### Linear Bonding Curve Formula

```
Price = Initial Price + (Slope × Total Supply)
```

When buying `N` tokens from current supply `S`:

```
Cost = (Slope × S × N) + (Slope × N² / 2) + (Initial Price × N)
```

## 🤝 Contributing

This is an educational project! Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure contract libraries
- [Foundry](https://book.getfoundry.sh/) for the excellent development framework
- [Next.js](https://nextjs.org/) for the React framework
- The Ethereum community for bonding curve research and implementations

---

**Happy Learning!** 🚀

Start with the smart contracts in `contracts/` to understand the core mechanics, then explore the UI in `ui/` to see how everything comes together in a real application.
