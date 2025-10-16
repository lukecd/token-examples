// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {console2} from "forge-std/console2.sol";

contract LinearBondingToken is ERC20, ReentrancyGuard {
    // Bonding curve parameters
    uint256 public initialPrice; // In wei
    uint256 public slope; // In wei per token

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialPrice,
        uint256 _slope
    ) ERC20(_name, _symbol) {
        initialPrice = _initialPrice;
        slope = _slope;
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    // Function to get the current price to buy one token
    function getCurrentPrice() public view returns (uint256) {
        uint256 a = slope; // In wei per token^2
        uint256 s = totalSupply(); // In wei (18 decimals)
        uint256 b = initialPrice; // In wei per token

        uint256 price = (a * s) / 1e18 + b;
        return price;
    }

    // Calculate cost for "amount" of tokens (in wei)
    function calculateCost(uint256 amount) public view returns (uint256) {
        uint256 s = totalSupply(); // In wei (18 decimals)
        uint256 a = slope; // In wei per token^2
        uint256 b = initialPrice; // In wei per token

        // Convert amounts from wei to tokens (without decimals)
        uint256 amountInTokens = amount / 1e18;
        uint256 sInTokens = s / 1e18;

        // Calculate cost using the formula:
        // cost = a * s * n + (a * n^2) / 2 + b * n
        uint256 term1 = a * sInTokens * amountInTokens;
        uint256 term2 = (a * amountInTokens * amountInTokens) / 2;
        uint256 term3 = b * amountInTokens;

        uint256 cost = term1 + term2 + term3;

        return cost;
    }

    // Function to mint 'amount' tokens by paying the required ETH
    function mintTokens(uint256 amount) public payable {
        uint256 cost = calculateCost(amount);
        require(msg.value >= cost, "Insufficient ETH sent");

        _mint(msg.sender, amount);

        // Refund any excess ETH sent
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }

    function mintTokensWithEth() public payable {
        require(msg.value > 0, "Must send more than 0 ETH");

        uint256 s = totalSupply(); // Current supply of tokens
        uint256 a = slope; // Slope of the bonding curve
        uint256 b = initialPrice; // Initial price
        uint256 c = msg.value; // ETH sent by the user
        // Quadratic formula components
        uint256 A = (a / 2); // Adjust slope for the quadratic term (in wei)
        uint256 B = ((a * s) / 1e18) + b; // Linear term, adjusted for decimals
        uint256 C = c; // Constant term, which is the ETH provided

        // Ensure slope is non-zero to avoid division by zero
        require(A > 0, "Slope too small");

        // Calculate the discriminant: D = B^2 + 4AC
        uint256 discriminant = (B * B) + (4 * A * C);
        require(discriminant >= 0, "Discriminant is negative");

        // Calculate the square root of the discriminant
        uint256 sqrtDiscriminant = Math.sqrt(discriminant);

        // Calculate the numerator: sqrt(D) - B
        uint256 numerator = sqrtDiscriminant - B;

        // Calculate the denominator: 2 * A
        uint256 denominator = 2 * A;

        // Ensure denominator is non-zero
        require(denominator > 0, "Denominator is zero");

        // Calculate the amount of tokens that can be purchased (adjust for 18 decimals)
        uint256 amount = (numerator * 1e18) / denominator; // Multiply by 1e18 to maintain decimals
        require(amount > 0, "Not enough ETH to buy tokens");

        // Mint the tokens to the sender, adjusted to 18 decimals
        _mint(msg.sender, amount);

        // Calculate the actual cost for the tokens and refund any excess ETH
        uint256 actualCost = calculateCost(amount);
        if (msg.value > actualCost) {
            payable(msg.sender).transfer(msg.value - actualCost);
        }
    }

    // Function to burn 'amount' tokens
    function burnTokens(uint256 amount) public nonReentrant {
        require(
            balanceOf(msg.sender) >= amount,
            "Insufficient balance to burn"
        );

        // Calculate refund BEFORE burning the tokens
        uint256 refund = calculateRefund(amount);

        // Ensure contract has enough ETH to refund
        require(
            address(this).balance >= refund,
            "Contract has insufficient ETH for refund"
        );

        // Burn the tokens after calculating refund
        _burn(msg.sender, amount);

        // Transfer the refund to the user
        payable(msg.sender).transfer(refund);
    }

    function calculateRefund(uint256 amount) public view returns (uint256) {
        uint256 s = totalSupply(); // Current total supply in wei (18 decimals)
        uint256 a = slope;
        uint256 b = initialPrice;

        // Ensure that we are not burning more tokens than the current supply
        require(amount <= s, "Cannot burn more tokens than the current supply");

        // Convert amounts from wei to tokens (without decimals)
        uint256 amountInTokens = amount / 1e18;
        uint256 sInTokens = s / 1e18;

        // Calculate total cost for current supply
        uint256 totalCostCurrent = (a * sInTokens * sInTokens) /
            2 +
            b *
            sInTokens;

        // New supply after burning tokens
        uint256 newSupplyInTokens = sInTokens - amountInTokens;

        // Calculate total cost for new supply
        uint256 totalCostNew = (a * newSupplyInTokens * newSupplyInTokens) /
            2 +
            b *
            newSupplyInTokens;

        // Refund is the difference between the two total costs
        uint256 refund = totalCostCurrent - totalCostNew;

        return refund;
    }
}
