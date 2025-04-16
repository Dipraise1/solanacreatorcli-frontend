import { connection, loadWallet, getExplorerUrl } from './config.js';
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import chalk from 'chalk';

const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Hardcoded metadata for well-known tokens
const KNOWN_TOKENS = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { 
    name: 'USD Coin', 
    symbol: 'USDC',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  'So11111111111111111111111111111111111111112': {
    name: 'Wrapped SOL',
    symbol: 'wSOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    name: 'Bonk',
    symbol: 'BONK',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png'
  }
};

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
    
    // Generate the metadata PDA (Program Derived Address)
    const [metadataPDA] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    // Check if this is a known token
    let metadata = null;
    let metadataExists = false;
    const knownToken = KNOWN_TOKENS[mintAddress];
    
    if (knownToken) {
      metadata = {
        name: knownToken.name,
        symbol: knownToken.symbol,
        uri: knownToken.logoURI || ''
      };
      metadataExists = true;
      
      if (verbose) {
        console.log(chalk.green(`\n📋 Token Metadata (from known token list):`));
        console.log(chalk.white(`• Name: ${chalk.cyan(knownToken.name)}`));
        console.log(chalk.white(`• Symbol: ${chalk.cyan(knownToken.symbol)}`));
        console.log(chalk.white(`• Logo: ${chalk.cyan(knownToken.logoURI || 'None')}`));
      }
    } else {
      // Try to get token metadata from on-chain program
      try {
        const metadataAccount = await connection.getAccountInfo(metadataPDA);
        metadataExists = metadataAccount !== null;
        
        if (metadataExists && metadataAccount.data.length > 0) {
          // Better parsing of metadata using a more robust approach
          const metadataData = metadataAccount.data;
          
          // Skip header bytes (1-byte version and fixed values)
          const nameStart = 1;
          
          // Find length of name (indicated by first byte after header)
          const nameLength = metadataData[nameStart];
          
          // Read name
          let nameEnd = nameStart + 1 + nameLength;
          try {
            const name = metadataData.slice(nameStart + 1, nameEnd)
              .toString('utf8')
              .replace(/\u0000/g, '');
            
            // Find length of symbol (indicated by next byte)
            const symbolLength = metadataData[nameEnd];
            
            // Read symbol
            let symbolEnd = nameEnd + 1 + symbolLength;
            const symbol = metadataData.slice(nameEnd + 1, symbolEnd)
              .toString('utf8')
              .replace(/\u0000/g, '');
            
            // Find length of URI (indicated by next byte)
            const uriLength = metadataData[symbolEnd];
            
            // Read URI
            let uriEnd = symbolEnd + 1 + uriLength;
            const uri = metadataData.slice(symbolEnd + 1, uriEnd)
              .toString('utf8')
              .replace(/\u0000/g, '');
            
            metadata = { name, symbol, uri };
            
            if (verbose) {
              console.log(chalk.green(`\n📋 Token Metadata:`));
              console.log(chalk.white(`• Name: ${chalk.cyan(name)}`));
              console.log(chalk.white(`• Symbol: ${chalk.cyan(symbol)}`));
              console.log(chalk.white(`• URI: ${chalk.cyan(uri || 'None')}`));
            }
          } catch (error) {
            // If there's an error parsing metadata, try a simpler approach
            if (verbose) {
              console.log(chalk.yellow(`⚠️ Error parsing metadata format, trying simpler approach...`));
            }
            
            try {
              // Find first null byte after position 5 to get name string
              let pos = 5;
              while (pos < metadataData.length && metadataData[pos] !== 0) pos++;
              
              const name = metadataData.slice(5, pos).toString('utf8');
              
              // Skip null bytes
              pos++;
              while (pos < metadataData.length && metadataData[pos] === 0) pos++;
              
              // Find end of symbol string
              const symbolStart = pos;
              while (pos < metadataData.length && metadataData[pos] !== 0) pos++;
              
              const symbol = metadataData.slice(symbolStart, pos).toString('utf8');
              
              metadata = { name, symbol, uri: '' };
              
              if (verbose) {
                console.log(chalk.green(`\n📋 Token Metadata (simplified parsing):`));
                console.log(chalk.white(`• Name: ${chalk.cyan(name)}`));
                console.log(chalk.white(`• Symbol: ${chalk.cyan(symbol)}`));
              }
            } catch (innerError) {
              if (verbose) {
                console.log(chalk.yellow(`⚠️ Could not parse metadata: ${innerError.message}`));
              }
            }
          }
        }
      } catch (err) {
        if (verbose) console.log(chalk.yellow(`⚠️ Error fetching metadata: ${err.message}`));
      }
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