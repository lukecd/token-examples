// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {LinearBondingToken} from "../src/LinearBondingToken.sol";

/**
 * @title DeployLinearBondingToken
 * @dev Deploy script for LinearBondingToken on Sepolia
 *
 * Usage:
 * forge script script/DeployLinearBondingToken.s.sol --rpc-url sepolia --broadcast --verify
 *
 * Environment variables (set via CLI, not in .env):
 * - PRIVATE_KEY: Your private key for deployment
 * - ETHERSCAN_API_KEY: For contract verification
 */
contract DeployLinearBondingToken is Script {
    // Deployment parameters - modify these as needed
    string constant TOKEN_NAME = "Not A Token";
    string constant TOKEN_SYMBOL = "NAT";
    uint256 constant INITIAL_PRICE = 1e13; // 0.00001 ETH per token initially
    uint256 constant SLOPE = 1e12; // 0.000001 ETH per token slope

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying LinearBondingToken to Sepolia...");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 1e18, "ETH");
        console.log("Token name:", TOKEN_NAME);
        console.log("Token symbol:", TOKEN_SYMBOL);
        console.log("Initial price:", INITIAL_PRICE, "wei");
        console.log("Slope:", SLOPE, "wei per token");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract (no initial ETH required)
        LinearBondingToken token = new LinearBondingToken(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            INITIAL_PRICE,
            SLOPE
        );

        vm.stopBroadcast();

        console.log("LinearBondingToken deployed at:", address(token));
        console.log("Contract balance:", address(token).balance / 1e18, "ETH");
        console.log("Initial price:", token.getCurrentPrice(), "wei");
        console.log("Total supply:", token.totalSupply() / 1e18, "tokens");

        // Verify deployment
        require(address(token) != address(0), "Deployment failed");
        require(
            keccak256(bytes(token.name())) == keccak256(bytes(TOKEN_NAME)),
            "Name mismatch"
        );
        require(
            keccak256(bytes(token.symbol())) == keccak256(bytes(TOKEN_SYMBOL)),
            "Symbol mismatch"
        );
        require(
            token.initialPrice() == INITIAL_PRICE,
            "Initial price mismatch"
        );
        require(token.slope() == SLOPE, "Slope mismatch");

        console.log("Deployment verification: PASSED");
    }
}
