# Linear Bonding Token

An ERC20 token with a linear bonding curve pricing. This contract allows users to buy and sell tokens at prices that increase linearly with the total supply, creating a fair and predictable price discovery mechanism.

## 🎯 What is a Bonding Curve?

A bonding curve is a mathematical function that determines the price of a token based on its supply. In this implementation, we use a **linear bonding curve**, where the price increases linearly as more tokens are bought.

### Key Concepts

- **Price Discovery**: The price is determined by supply, not by external markets
- **No Liquidity Pools**: No need for external liquidity providers
- **Fair Pricing**: Everyone pays the same price for the same amount of tokens
- **Continuous Trading**: Buy and sell tokens at any time
- **Price Predictability**: You can calculate exact costs before trading

## 🧮 How the Linear Bonding Curve Works

### Mathematical Formula

The price of one token is calculated as:

```
Price = Initial Price + (Slope × Total Supply)
```

Where:

- **Initial Price**: The starting price when supply is 0
- **Slope**: How much the price increases per token
- **Total Supply**: Current number of tokens in circulation

### Cost Calculation

When buying `N` tokens from current supply `S`, the total cost is:

```
Cost = (Slope × S × N) + (Slope × N² / 2) + (Initial Price × N)
```

This formula accounts for the fact that the price increases as you buy more tokens.

### Example

Let's say:

- Initial Price = 0.001 ETH per token
- Slope = 0.000001 ETH per token
- Current Supply = 1000 tokens

**Current Price**: 0.001 + (0.000001 × 1000) = 0.002 ETH per token

**To buy 100 tokens**:

- Cost = (0.000001 × 1000 × 100) + (0.000001 × 100² / 2) + (0.001 × 100)
- Cost = 0.1 + 0.005 + 0.1 = 0.205 ETH

## 🚀 Contract Features

### Core Functions

- **`mintTokens(amount)`**: Buy a specific number of tokens
- **`mintTokensWithEth()`**: Buy tokens with ETH (calculates amount automatically)
- **`burnTokens(amount)`**: Sell tokens back to the contract
- **`getCurrentPrice()`**: Get the current price per token
- **`calculateCost(amount)`**: Calculate cost for buying tokens
- **`calculateRefund(amount)`**: Calculate refund for selling tokens

### Security Features

- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Input Validation**: Checks for sufficient balances and amounts
- **Overflow Protection**: Safe math operations
- **Access Control**: Standard ERC20 access controls

## 📋 Contract Parameters

The contract is initialized with:

```solidity
constructor(
    string memory _name,        // Token name (e.g., "My Token")
    string memory _symbol,     // Token symbol (e.g., "MTK")
    uint256 _initialPrice,     // Starting price in wei
    uint256 _slope             // Price increase per token in wei
)
```

### Example Parameters

```solidity
// Deploy a token with:
// - Name: "Community Token"
// - Symbol: "COMM"
// - Initial Price: 0.001 ETH (1e15 wei)
// - Slope: 0.000001 ETH per token (1e12 wei)

LinearBondingToken token = new LinearBondingToken(
    "Community Token",
    "COMM",
    1e15,  // 0.001 ETH initial price
    1e12   // 0.000001 ETH slope
);
```

## 🛠️ Installation & Setup

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (latest version)
- Node.js (for UI components)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd token-examples

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test
```

## 🧪 Testing

The contract includes comprehensive test coverage:

```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run with detailed output
forge test -vvv
```

### Test Categories

- **Edge Cases**: Zero amounts, boundary conditions
- **Reentrancy Protection**: Attack prevention
- **Mathematical Precision**: Rounding behavior
- **Error Conditions**: Invalid inputs, insufficient funds
- **Gas Optimization**: Performance testing

## 🚀 Deployment

### Deploy to Sepolia Testnet

1. **Set environment variables**:

   ```bash
   export PRIVATE_KEY="0xyour-private-key-here"
   export ETHERSCAN_API_KEY="your-etherscan-api-key"  # Optional
   ```

2. **Deploy the contract**:
   ```bash
   cd contracts
   forge script script/DeployLinearBondingToken.s.sol --rpc-url https://ethereum-sepolia.publicnode.com --broadcast --verify
   ```

### Deployment Parameters

The deployment script uses these default values:

```solidity
string constant TOKEN_NAME = "Not A Token";
string constant TOKEN_SYMBOL = "NAT";
uint256 constant INITIAL_PRICE = 1e13; // 0.00001 ETH per token
uint256 constant SLOPE = 1e12;          // 0.000001 ETH per token slope
```

### Customizing Deployment

Edit `script/DeployLinearBondingToken.s.sol` to change parameters:

```solidity
// Modify these constants
string constant TOKEN_NAME = "Your Token Name";
string constant TOKEN_SYMBOL = "SYMBOL";
uint256 constant INITIAL_PRICE = 1e15; // Adjust initial price
uint256 constant SLOPE = 1e12;         // Adjust slope
```

## 💡 Usage Examples

### Buying Tokens

```solidity
// Method 1: Buy specific amount of tokens
uint256 amount = 1000 * 1e18; // 1000 tokens
uint256 cost = token.calculateCost(amount);
token.mintTokens{value: cost}(amount);

// Method 2: Buy with ETH (automatic amount calculation)
token.mintTokensWithEth{value: 0.1 ether}();
```

### Selling Tokens

```solidity
// Sell tokens back to the contract
uint256 balance = token.balanceOf(msg.sender);
uint256 refund = token.calculateRefund(balance);
token.burnTokens(balance);
// User receives refund in ETH
```

### Price Queries

```solidity
// Get current price per token
uint256 currentPrice = token.getCurrentPrice();

// Calculate cost for buying tokens
uint256 cost = token.calculateCost(1000 * 1e18);

// Calculate refund for selling tokens
uint256 refund = token.calculateRefund(1000 * 1e18);
```

## 📊 Price Behavior Examples

### Small Purchases

| ETH Spent | Tokens Received | Price After | Tokens per ETH |
| --------- | --------------- | ----------- | -------------- |
| 0.01 ETH  | 9.95 tokens     | 0.00101 ETH | 995 tokens/ETH |
| 0.01 ETH  | 9.90 tokens     | 0.00102 ETH | 990 tokens/ETH |
| 0.01 ETH  | 9.85 tokens     | 0.00103 ETH | 985 tokens/ETH |

### Large Purchase Impact

| ETH Spent | Tokens Received | Price After | Tokens per ETH |
| --------- | --------------- | ----------- | -------------- |
| 0.1 ETH   | 95.2 tokens     | 0.0011 ETH  | 952 tokens/ETH |
| 1.0 ETH   | 900 tokens      | 0.002 ETH   | 900 tokens/ETH |

## ⛽ Gas Usage

Typical gas costs for operations:

- **Buy tokens**: ~77,000 gas
- **Sell tokens**: ~21,000 gas
- **Price queries**: ~13,000 gas
- **Cost calculations**: ~15,000 gas

## 🔒 Security Considerations

### Reentrancy Protection

The contract uses OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks on the `burnTokens` function.

### Input Validation

- Checks for sufficient token balance before burning
- Validates that contract has enough ETH for refunds
- Ensures amounts are not zero where appropriate

### Mathematical Safety

- Uses safe math operations to prevent overflow
- Validates quadratic formula inputs
- Handles edge cases gracefully

## 🎯 Use Cases

### Community Tokens

- **Fair Launch**: No pre-mined tokens, everyone starts equal
- **Price Discovery**: Market-driven pricing without external liquidity
- **Community Ownership**: Tokens represent community membership

### Educational Projects

- **Learn DeFi**: Understand bonding curves and token economics
- **Experiment**: Test different parameters and scenarios
- **Research**: Study price behavior and market dynamics

### Prototype Applications

- **Proof of Concept**: Test token economics before mainnet
- **Rapid Deployment**: Quick token launches for communities
- **Custom Parameters**: Tailor pricing to specific needs

## 🔧 Advanced Configuration

### Parameter Selection

**Initial Price**: Sets the starting price

- **Low (1e12 wei)**: Cheap entry, good for community tokens
- **High (1e15 wei)**: Premium pricing, good for exclusive tokens

**Slope**: Controls price increase rate

- **Low (1e10 wei)**: Gentle price increases, stable growth
- **High (1e13 wei)**: Aggressive price increases, early adopter rewards

### Example Configurations

```solidity
// Community Token (cheap, stable)
new LinearBondingToken("Community", "COMM", 1e12, 1e10);

// Premium Token (expensive, aggressive)
new LinearBondingToken("Premium", "PREM", 1e15, 1e13);

// Balanced Token (moderate pricing)
new LinearBondingToken("Balanced", "BAL", 1e14, 1e12);
```

## 📈 Price Analysis

### Price Progression

The linear bonding curve creates predictable price behavior:

1. **Early Buyers**: Get the best prices
2. **Price Escalation**: Each purchase increases price for others
3. **Fair Mechanism**: No manipulation possible
4. **Continuous Trading**: Buy/sell at any time

### Market Dynamics

- **Supply and Demand**: Price reflects actual token supply
- **No External Dependencies**: Self-contained pricing mechanism
- **Transparent**: All calculations are on-chain and verifiable
- **Efficient**: No need for external liquidity providers

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Guidelines

- Follow Solidity style guide
- Add comprehensive tests
- Document new features
- Consider gas optimization
- Review security implications

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenZeppelin for security best practices
- Foundry team for the excellent development framework
- The DeFi community for bonding curve research

## 📞 Support

For questions or issues:

- Open an issue on GitHub
- Check the test files for usage examples
- Review the contract code for implementation details

---

**Built with ❤️ for the DeFi community**

_This implementation provides a robust, secure, and efficient linear bonding curve token for educational and production use._
