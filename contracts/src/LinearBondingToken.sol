// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {console2} from "forge-std/console2.sol";

/**
 * @title LinearBondingToken
 * @author Your Name
 * @notice An ERC20 token with a linear bonding curve pricing mechanism
 * @dev This contract implements a bonding curve where the price increases linearly with supply
 *      Price formula: p(s) = initialPrice + (slope * supply) / 1e18
 *      The contract allows users to mint tokens by sending ETH and burn tokens to receive ETH refunds
 */
contract LinearBondingToken is ERC20, ReentrancyGuard {
    /// @notice The initial price of the token in wei (price when supply is 0)
    uint256 public initialPrice;

    /// @notice The slope of the bonding curve in wei per token
    /// @dev This determines how much the price increases per token minted
    uint256 public slope;

    /**
     * @notice Constructor for the LinearBondingToken
     * @param _name The name of the token
     * @param _symbol The symbol of the token
     * @param _initialPrice The initial price in wei (becomes the floor price)
     * @param _slope The slope of the bonding curve in wei per token
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialPrice,
        uint256 _slope
    ) ERC20(_name, _symbol) {
        initialPrice = _initialPrice; // Becomes the floor
        slope = _slope;
    }

    /**
     * @notice Returns the number of decimals for the token
     * @return The number of decimals (always 18 for this token)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    /**
     * @notice Gets the current price to buy one token
     * @dev Calculates the price using the linear bonding curve formula: p(s) = initialPrice + (slope * supply) / 1e18
     * @return The current price in wei to buy one token
     */
    function getCurrentPrice() public view returns (uint256) {
        uint256 a = slope; // In wei per token^2
        uint256 s = totalSupply(); // In wei (18 decimals)
        uint256 b = initialPrice; // In wei per token

        // Calculate price using linear bonding curve: p(s) = b + (a * s) / 1e18
        uint256 price = (a * s) / 1e18 + b;
        return price;
    }

    /**
     * @notice Calculates the cost in ETH to mint a specific amount of tokens
     * @dev Uses the trapezoid rule to calculate the area under the bonding curve
     *      Cost = (pStart + pEnd) * amount / 2, where pStart and pEnd are prices at supply points
     * @param amount The number of tokens to mint (in wei, 18 decimals)
     * @return The cost in wei to mint the specified amount of tokens
     */
    function calculateCost(uint256 amount) public view returns (uint256) {
        require(amount > 0, "amount=0");
        uint256 s = totalSupply();
        uint256 pStart = _priceAt(s);
        uint256 pEnd = _priceAt(s + amount);

        // Calculate cost using trapezoid rule: (pStart + pEnd) * amount / 2
        // Math.mulDiv performs precise multiplication and division with rounding
        // Round up so buyers never underpay by 1 wei due to truncation
        // Formula: Cost = ((pStart + pEnd) * amount) / (2 * 1e18)
        return Math.mulDiv(pStart + pEnd, amount, 2 * 1e18, Math.Rounding.Ceil);
    }

    /**
     * @notice Mints tokens by sending ETH to the contract
     * @dev Implements slippage protection to prevent sandwich attacks
     * @param amount The number of tokens to mint (in wei, 18 decimals)
     * @param minTokenOut The minimum number of tokens expected (slippage protection)
     * @dev The function calculates the exact cost and refunds any excess ETH
     * @dev Protected by ReentrancyGuard to prevent reentrancy attacks
     */
    function mintTokens(
        uint256 amount,
        uint256 minTokenOut
    ) public payable nonReentrant {
        require(amount > 0, "Cannot mint zero tokens");

        // Calculate the exact cost for the requested tokens
        uint256 cost = calculateCost(amount);
        require(msg.value >= cost, "Insufficient ETH sent");
        require(amount >= minTokenOut, "Slippage: fewer tokens than expected");

        // Mint tokens to the sender
        _mint(msg.sender, amount);

        // Refund any excess ETH sent
        if (msg.value > cost) {
            uint256 refund = msg.value - cost;
            // Use call to send ETH and check for success
            (bool ok, ) = payable(msg.sender).call{value: refund}("");
            require(ok, "Refund failed");
        }
    }

    /**
     * @notice Calculates how many tokens can be purchased with a given amount of ETH
     * @dev Uses the quadratic formula to solve for token amount given ETH input
     *      Solves: ETH = (pStart + pEnd) * amount / 2 where pStart and pEnd are prices
     *      This results in a quadratic equation: A*amount² + B*amount - ETH = 0
     * @param ethAmount The amount of ETH to spend (in wei)
     * @return The number of tokens that can be purchased (in wei, 18 decimals)
     */
    function calculateTokensForEth(
        uint256 ethAmount
    ) public view returns (uint256) {
        require(ethAmount > 0, "Must send more than 0 ETH");

        uint256 s = totalSupply(); // Current supply of tokens
        uint256 a = slope; // Slope of the bonding curve
        uint256 b = initialPrice; // Initial price
        uint256 c = ethAmount; // ETH sent by the user

        // Quadratic formula components for solving: A*amount² + B*amount - C = 0
        uint256 A = (a / 2); // Adjust slope for the quadratic term (in wei)
        uint256 B = ((a * s) / 1e18) + b; // Linear term, adjusted for decimals
        uint256 C = c; // Constant term, which is the ETH provided

        // Ensure slope is non-zero to avoid division by zero
        require(A > 0, "Slope too small");

        // Calculate the discriminant: D = B² + 4AC
        uint256 discriminant = (B * B) + (4 * A * C);
        require(discriminant >= 0, "Discriminant is negative");

        // Calculate the square root of the discriminant using Math.sqrt
        uint256 sqrtDiscriminant = Math.sqrt(discriminant);

        // Calculate the numerator: sqrt(D) - B
        uint256 numerator = sqrtDiscriminant - B;

        // Calculate the denominator: 2 * A
        uint256 denominator = 2 * A;

        // Ensure denominator is non-zero
        require(denominator > 0, "Denominator is zero");

        // Calculate the amount of tokens that can be purchased
        // Multiply by 1e18 to maintain proper decimal precision
        uint256 amount = (numerator * 1e18) / denominator;
        require(amount > 0, "Not enough ETH to buy tokens");

        return amount;
    }

    /**
     * @notice Internal helper function to calculate price at a specific supply
     * @dev Implements the linear bonding curve formula: p(s) = initialPrice + (slope * supply) / 1e18
     * @param supply The token supply at which to calculate the price (in wei, 18 decimals)
     * @return The price in wei at the given supply
     */
    function _priceAt(uint256 supply) internal view returns (uint256) {
        // Linear bonding curve formula: p(s) = b + (a * s) / 1e18
        return initialPrice + (slope * supply) / 1e18;
    }

    /**
     * @notice Calculates the ETH refund for burning a specific amount of tokens
     * @dev Uses the trapezoid rule to calculate the area under the bonding curve for the burn interval
     *      Refund = (pLow + pHigh) * amount / 2, where pLow and pHigh are prices at burn endpoints
     * @param amount The number of tokens to burn (in wei, 18 decimals)
     * @return The ETH refund in wei for burning the specified amount of tokens
     */
    function calculateRefund(uint256 amount) public view returns (uint256) {
        uint256 s = totalSupply(); // current supply (18 decimals)

        // For amount = 0, return 0 (do not revert) to match original behavior
        if (amount == 0) return 0;

        require(amount <= s, "Cannot burn more tokens than the current supply");

        // Prices at the endpoints of the burn interval [s - amount, s]
        uint256 pLow = _priceAt(s - amount);
        uint256 pHigh = _priceAt(s);

        // Calculate refund using trapezoid rule: (pLow + pHigh) * amount / 2
        // Math.mulDiv performs precise multiplication and division with rounding
        // Round DOWN for safety to ensure contract doesn't overpay
        // Formula: Refund = ((pLow + pHigh) * amount) / (2 * 1e18)
        uint256 refund = Math.mulDiv(
            (pLow + pHigh),
            amount,
            2 * 1e18,
            Math.Rounding.Floor
        );

        return refund;
    }

    /**
     * @notice Burns tokens and refunds ETH to the sender
     * @dev Calculates the refund amount before burning tokens to ensure accurate payment
     * @param amount The number of tokens to burn (in wei, 18 decimals)
     * @dev Protected by ReentrancyGuard to prevent reentrancy attacks
     * @dev Allows burning 0 tokens as a no-op for compatibility
     */
    function burnTokens(uint256 amount) public nonReentrant {
        // Allow burning 0 tokens (no-op) to match original behavior
        if (amount == 0) {
            return;
        }
        require(
            balanceOf(msg.sender) >= amount,
            "Insufficient balance to burn"
        );

        // Compute refund BEFORE burning to ensure accurate calculation
        uint256 refund = calculateRefund(amount);
        require(
            address(this).balance >= refund,
            "Contract has insufficient ETH for refund"
        );

        // Burn tokens from the sender
        _burn(msg.sender, amount);

        // Send ETH refund to the sender
        // Use call to send ETH and check for success
        (bool ok, ) = payable(msg.sender).call{value: refund}("");
        require(ok, "Refund transfer failed");
    }
}
