import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { NETWORK } from './config.js';
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import { connection, loadWallet } from './config.js';

/**
 * Lists all tokens created with the CLI
 * @param {boolean} verbose - Whether to show detailed information
 * @param {string} filter - Optional filter by name or symbol
 * @returns {Promise<Array>} - Array of token objects
 */
export async function listTokens(verbose = false, filter = '') {
  console.log(chalk.blue("📋 Listing your tokens..."));
  
  // Check token-outputs directory for previously created tokens
  const outputDir = './token-outputs';
  let savedTokens = [];
  
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));
          if (data.mint) {
            // Apply filter if provided
            if (filter && 
                !data.name?.toLowerCase().includes(filter.toLowerCase()) && 
                !data.symbol?.toLowerCase().includes(filter.toLowerCase()) &&
                !data.mint?.toLowerCase().includes(filter.toLowerCase())) {
              continue;
            }
            
            savedTokens.push({
              name: data.name || 'Unknown',
              symbol: data.symbol || 'Unknown',
              mint: data.mint,
              decimals: data.decimals || 0,
              initialSupply: data.initialSupply || 0,
              metadata: data.metadata || null,
              createdAt: data.createdAt || 'Unknown',
              urls: data.urls || {},
              file
            });
          }
        } catch (err) {
          // Skip invalid files
          console.error(`Error reading file ${file}: ${err.message}`);
        }
      }
    }
  }
  
  if (savedTokens.length > 0) {
    console.log(chalk.green(`\n🪙 Found ${savedTokens.length} tokens in your output directory:`));
    
    savedTokens.sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    for (let i = 0; i < savedTokens.length; i++) {
      const token = savedTokens[i];
      console.log(chalk.white(`\n${i + 1}. ${chalk.cyan(token.name)} (${chalk.cyan(token.symbol)})`));
      console.log(chalk.white(`   Mint: ${chalk.cyan(token.mint)}`));
      
      if (verbose) {
        console.log(chalk.white(`   Decimals: ${chalk.cyan(token.decimals)}`));
        console.log(chalk.white(`   Initial Supply: ${chalk.cyan(token.initialSupply)}`));
        
        if (token.metadata?.address) {
          console.log(chalk.white(`   Metadata: ${chalk.cyan(token.metadata.address)}`));
        }
        
        console.log(chalk.white(`   Created: ${chalk.cyan(new Date(token.createdAt).toLocaleString())}`));
        console.log(chalk.white(`   File: ${chalk.cyan(token.file)}`));
      }
      
      console.log(chalk.white(`   Explorer: ${chalk.cyan(`https://explorer.solana.com/address/${token.mint}?cluster=${NETWORK}`)}`));
    }
    
    return savedTokens;
  } else {
    console.log(chalk.yellow("\n⚠️ No saved tokens found in the token-outputs directory."));
    console.log(chalk.yellow("  Create a token first or manually add token data files to the directory."));
    return [];
  }
}

/**
 * Get detailed information about a specific token
 * @param {string} mintAddress - The mint address of the token
 * @returns {Promise<Object>} - Token details
 */
export async function getTokenDetails(mintAddress) {
  console.log(chalk.blue(`🔍 Fetching details for token: ${chalk.cyan(mintAddress)}`));
  
  try {
    // Check if we have this token in our local database
    const outputDir = './token-outputs';
    let localData = null;
    
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));
            if (data.mint === mintAddress) {
              localData = data;
              break;
            }
          } catch (err) {
            // Skip invalid files
          }
        }
      }
    }
    
    // Get on-chain data
    const mint = new web3.PublicKey(mintAddress);
    const mintInfo = await splToken.getMint(connection, mint);
    
    // Get token supply with decimals considered
    const rawSupply = Number(mintInfo.supply);
    const actualSupply = rawSupply / Math.pow(10, mintInfo.decimals);
    
    // Try to get user's balance if a wallet is available
    let userBalance = 0;
    let userTokenAccount = null;
    
    try {
      const wallet = loadWallet();
      const tokenAccounts = await connection.getTokenAccountsByOwner(
        wallet.publicKey,
        { mint }
      );
      
      if (tokenAccounts.value.length > 0) {
        const tokenAccountInfo = tokenAccounts.value[0];
        userTokenAccount = tokenAccountInfo.pubkey.toBase58();
        const accountInfo = await splToken.getAccount(
          connection, 
          tokenAccountInfo.pubkey
        );
        userBalance = Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
      }
    } catch (err) {
      // Ignore errors if wallet isn't available
      console.log(chalk.yellow("Could not get user balance (wallet may not be available)"));
    }
    
    // Construct token details object
    const tokenDetails = {
      mint: mintAddress,
      decimals: mintInfo.decimals,
      supply: actualSupply,
      mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
      userBalance,
      userTokenAccount,
      // Include local data if available
      name: localData?.name || "Unknown",
      symbol: localData?.symbol || "Unknown",
      metadata: localData?.metadata || null,
      createdAt: localData?.createdAt || null,
      urls: {
        explorer: `https://explorer.solana.com/address/${mintAddress}?cluster=${NETWORK}`,
      }
    };
    
    return tokenDetails;
  } catch (error) {
    console.error(chalk.red(`Error fetching token details: ${error.message}`));
    throw error;
  }
}

/**
 * Display token details in a formatted way
 * @param {Object} tokenDetails - Token details object
 */
export function displayTokenDetails(tokenDetails) {
  console.log(chalk.bold.green("\n📊 Token Details:"));
  
  // Name & Symbol
  console.log(chalk.white(`• Name: ${chalk.cyan(tokenDetails.name)}`));
  console.log(chalk.white(`• Symbol: ${chalk.cyan(tokenDetails.symbol)}`));
  console.log(chalk.white(`• Mint Address: ${chalk.cyan(tokenDetails.mint)}`));
  
  // Supply and Decimals
  console.log(chalk.white(`• Decimals: ${chalk.cyan(tokenDetails.decimals)}`));
  console.log(chalk.white(`• Total Supply: ${chalk.cyan(tokenDetails.supply.toLocaleString())}`));
  
  // Authorities
  if (tokenDetails.mintAuthority) {
    console.log(chalk.white(`• Mint Authority: ${chalk.cyan(tokenDetails.mintAuthority)}`));
  }
  
  if (tokenDetails.freezeAuthority) {
    console.log(chalk.white(`• Freeze Authority: ${chalk.cyan(tokenDetails.freezeAuthority)}`));
  }
  
  // User Balance
  if (tokenDetails.userBalance > 0) {
    console.log(chalk.white(`• Your Balance: ${chalk.cyan(tokenDetails.userBalance.toLocaleString())}`));
    console.log(chalk.white(`• Your Token Account: ${chalk.cyan(tokenDetails.userTokenAccount)}`));
  }
  
  // Metadata if available
  if (tokenDetails.metadata) {
    console.log(chalk.bold.blue("\n🏷️ Metadata:"));
    
    if (tokenDetails.metadata.address) {
      console.log(chalk.white(`• Metadata Address: ${chalk.cyan(tokenDetails.metadata.address)}`));
    }
    
    if (tokenDetails.metadata.success !== undefined) {
      console.log(chalk.white(`• Metadata Status: ${tokenDetails.metadata.success ? 
        chalk.green('Success') : chalk.red('Failed')}`));
    }
  }
  
  // Creation date if available
  if (tokenDetails.createdAt) {
    console.log(chalk.white(`• Created: ${chalk.cyan(new Date(tokenDetails.createdAt).toLocaleString())}`));
  }
  
  // Explorer URL
  console.log(chalk.bold.blue("\n🔗 Links:"));
  console.log(chalk.white(`• Explorer: ${chalk.cyan(tokenDetails.urls.explorer)}`));
  
  if (tokenDetails.urls.metadataTransaction) {
    console.log(chalk.white(`• Metadata Transaction: ${chalk.cyan(tokenDetails.urls.metadataTransaction)}`));
  }
} 