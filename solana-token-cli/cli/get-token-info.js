import { connection, loadWallet, getExplorerUrl } from './config.js';
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import chalk from 'chalk';

const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

/**
 * Get detailed information about a token by its mint address
 * @param {string} mintAddress - The mint address of the token
 * @param {boolean} verbose - Whether to print verbose output
 * @returns {Promise<Object>} - Object containing token details
 */
export async function getTokenInfo(mintAddress, verbose = false) {
  try {
    if (verbose) console.log(chalk.blue(`🔍 Fetching information for token: ${chalk.cyan(mintAddress)}`));
    
    // Parse the mint address
    const mintPubkey = new web3.PublicKey(mintAddress);
    
    // Get the token supply and decimals
    const mintInfo = await splToken.getMint(connection, mintPubkey);
    
    if (verbose) {
      console.log(chalk.green(`✅ Found token with:`));
      console.log(chalk.white(`• Supply: ${chalk.cyan(Number(mintInfo.supply) / 10 ** mintInfo.decimals)}`));
      console.log(chalk.white(`• Decimals: ${chalk.cyan(mintInfo.decimals)}`));
      console.log(chalk.white(`• Mint Authority: ${chalk.cyan(mintInfo.mintAuthority?.toBase58() || 'None')}`));
      console.log(chalk.white(`• Freeze Authority: ${chalk.cyan(mintInfo.freezeAuthority?.toBase58() || 'None')}`));
    }
    
    // Try to get token metadata
    const [metadataPDA] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    let metadata = null;
    let metadataExists = false;
    
    try {
      const metadataAccount = await connection.getAccountInfo(metadataPDA);
      metadataExists = metadataAccount !== null;
      
      if (metadataExists && metadataAccount.data.length > 0) {
        // Simple parsing of metadata (this is a simplification)
        // In a production app, you'd use Metaplex JS SDK
        const data = metadataAccount.data;
        
        // Skip first byte which is a version number
        let nameLength = data[1];
        let nameEnd = 1 + nameLength + 1;
        const name = data.slice(2, nameEnd).toString('utf8').replace(/\u0000/g, '');
        
        let symbolLength = data[nameEnd];
        let symbolEnd = nameEnd + 1 + symbolLength;
        const symbol = data.slice(nameEnd + 1, symbolEnd).toString('utf8').replace(/\u0000/g, '');
        
        let uriLength = data[symbolEnd];
        let uriEnd = symbolEnd + 1 + uriLength;
        const uri = data.slice(symbolEnd + 1, uriEnd).toString('utf8').replace(/\u0000/g, '');
        
        metadata = { name, symbol, uri };
        
        if (verbose) {
          console.log(chalk.green(`\n📋 Token Metadata:`));
          console.log(chalk.white(`• Name: ${chalk.cyan(name)}`));
          console.log(chalk.white(`• Symbol: ${chalk.cyan(symbol)}`));
          console.log(chalk.white(`• URI: ${chalk.cyan(uri || 'None')}`));
        }
      }
    } catch (err) {
      if (verbose) console.log(chalk.yellow(`⚠️ Error fetching metadata: ${err.message}`));
    }
    
    // Get token accounts by owner
    const wallet = loadWallet();
    const userTokenAccounts = await connection.getTokenAccountsByOwner(
      wallet.publicKey,
      { mint: mintPubkey }
    );
    
    let balance = 0;
    let associatedTokenAddress = null;
    
    if (userTokenAccounts.value.length > 0) {
      // Parse token account data
      for (const accountInfo of userTokenAccounts.value) {
        const accountData = splToken.AccountLayout.decode(accountInfo.account.data);
        const tokenBalance = Number(accountData.amount) / (10 ** mintInfo.decimals);
        
        if (tokenBalance > 0) {
          balance += tokenBalance;
          associatedTokenAddress = accountInfo.pubkey.toBase58();
        }
      }
      
      if (verbose) {
        console.log(chalk.green(`\n💰 Your Token Balance:`));
        console.log(chalk.white(`• Balance: ${chalk.cyan(balance)}`));
        if (associatedTokenAddress) {
          console.log(chalk.white(`• Token Account: ${chalk.cyan(associatedTokenAddress)}`));
        }
      }
    } else if (verbose) {
      console.log(chalk.yellow(`\n⚠️ You don't own any of this token.`));
    }
    
    // Return comprehensive token information
    return {
      exists: true,
      mint: mintPubkey.toBase58(),
      supply: Number(mintInfo.supply) / 10 ** mintInfo.decimals,
      decimals: mintInfo.decimals,
      mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
      metadata: metadata,
      metadataAddress: metadataPDA.toBase58(),
      metadataExists: metadataExists,
      userBalance: balance,
      userTokenAccount: associatedTokenAddress,
      urls: {
        explorer: getExplorerUrl(mintPubkey.toBase58()),
        metadata: getExplorerUrl(metadataPDA.toBase58())
      }
    };
  } catch (error) {
    if (verbose) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      if (error.message.includes('not found')) {
        console.error(chalk.red(`The token mint address ${mintAddress} was not found.`));
      }
    }
    
    return {
      exists: false,
      error: error.message,
      mint: mintAddress
    };
  }
} 