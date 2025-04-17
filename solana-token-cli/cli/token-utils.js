import { connection, loadWallet, getExplorerUrl, getWalletPath } from './config.js';
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import { createTokenWithUmi } from './umi-token-creator.js';

export async function createToken({ name, symbol, decimals, initialSupply, imageUrl, twitterUrl, telegramUrl, useUmi = true }, simulate = false) {
  // If we're using the pure Umi approach, redirect to the new implementation
  if (useUmi && useUmi === 'pure') {
    console.log('Using pure Umi approach for token creation and metadata...');
    return createTokenWithUmi({ 
      name, symbol, decimals, initialSupply, imageUrl, twitterUrl, telegramUrl 
    }, getWalletPath(), simulate);
  }

  const wallet = loadWallet();
  console.log(`Creating token with ${decimals} decimals and initial supply of ${initialSupply}...`);
  if (imageUrl) console.log(`Token image URL: ${imageUrl}`);
  if (twitterUrl) console.log(`Twitter: @${twitterUrl}`);
  if (telegramUrl) console.log(`Telegram: t.me/${telegramUrl}`);
  
  try {
    // If in simulate mode, don't make actual blockchain transactions
    if (simulate) {
      console.log('SIMULATION MODE: Not making actual blockchain transactions');
      
      // Generate a fake mint address
      const mintKeypair = web3.Keypair.generate();
      const mint = mintKeypair.publicKey;
      console.log(`Simulated token mint created: ${mint.toBase58()}`);
      console.log(`Explorer URL (would be): ${getExplorerUrl(mint.toBase58())}`);

      // Generate a fake token account address
      const tokenAccountKeypair = web3.Keypair.generate();
      const tokenAccount = tokenAccountKeypair.publicKey;
      console.log(`Simulated token account created: ${tokenAccount.toBase58()}`);

      // Generate a fake transaction ID
      const txId = 'Simulated' + Math.random().toString(36).substring(2, 15);
      console.log(`Simulated tokens minted successfully! Transaction ID: ${txId}`);
      
      // For simulation, we'll just return simulated values without metadata
      return {
        mint: mintKeypair.publicKey,
        tokenAccount: tokenAccount,
        transaction: txId,
        metadata: {
          name,
          symbol,
          decimals,
          initialSupply,
          imageUrl: imageUrl || '',
          twitterUrl: twitterUrl || '',
          telegramUrl: telegramUrl || '',
          metadataAddress: web3.Keypair.generate().publicKey.toBase58(),
          metadataTransaction: txId,
          metadataSuccess: true,
          metadataUmi: true
        },
        urls: {
          mint: getExplorerUrl(mint.toBase58()),
          transaction: getExplorerUrl(txId, 'tx'),
          metadataTransaction: getExplorerUrl(txId, 'tx')
        },
        simulated: true
      };
    }
    
    // ACTUAL TOKEN CREATION USING SPL TOKEN DIRECTLY
    try {
      // Step 1: Generate a keypair for the mint account
      console.log('Creating token mint keypair...');
      const mintKeypair = web3.Keypair.generate();
      console.log(`Mint keypair generated: ${mintKeypair.publicKey.toBase58()}`);
      
      // Step 2: Calculate minimum lamports needed for the token mint
      const lamports = await connection.getMinimumBalanceForRentExemption(
        splToken.MINT_SIZE
      );
      
      // Step 3: Create a transaction to allocate space for the token mint account
      const createMintAccountIx = web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: splToken.MINT_SIZE,
        lamports,
        programId: splToken.TOKEN_PROGRAM_ID,
      });
      
      // Step 4: Initialize mint instruction
      const initializeMintIx = splToken.createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        wallet.publicKey,
        wallet.publicKey
      );
      
      // Step 5: Get associated token account address
      const associatedTokenAddress = await splToken.getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );
      console.log(`Associated token address: ${associatedTokenAddress.toBase58()}`);
      
      // Step 6: Create associated token account instruction
      const createAssociatedTokenAccountIx = splToken.createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedTokenAddress,
        wallet.publicKey,
        mintKeypair.publicKey
      );
      
      // Step 7: Calculate the mint amount with proper decimal places
      const mintAmount = BigInt(initialSupply) * BigInt(10 ** decimals);
      
      // Step 8: Create mint to instruction
      const mintToIx = splToken.createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAddress,
        wallet.publicKey,
        mintAmount
      );
      
      // Step 9: Create and sign transaction
      console.log('Creating and signing transaction...');
      const tx = new web3.Transaction().add(
        createMintAccountIx,
        initializeMintIx,
        createAssociatedTokenAccountIx,
        mintToIx
      );
      
      // Set transaction options
      tx.feePayer = wallet.publicKey;
      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      
      // Sign with both the payer and mint account
      tx.sign(wallet, mintKeypair);
      
      // Step 10: Send and confirm transaction
      console.log('Sending transaction...');
      const txId = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log(`Transaction sent! Waiting for confirmation...`);
      await connection.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: txId,
      });
      
      console.log(`Token created successfully!`);
      console.log(`Mint Address: ${mintKeypair.publicKey.toBase58()}`);
      console.log(`Token Account: ${associatedTokenAddress.toBase58()}`);
      console.log(`Transaction ID: ${txId}`);
      console.log(`Explorer URL: ${getExplorerUrl(mintKeypair.publicKey.toBase58())}`);
      
      // When using the legacy approach without Umi, we don't create token metadata
      // Return a response without metadata
      console.log('\nNOTE: Using legacy SPL token creation without metadata.');
      console.log('Your token will not have metadata and will appear as its address in explorers.');
      
      return {
        mint: mintKeypair.publicKey,
        tokenAccount: associatedTokenAddress,
        transaction: txId,
        metadata: {
          name,
          symbol,
          decimals,
          initialSupply,
          imageUrl: imageUrl || '',
          twitterUrl: twitterUrl || '',
          telegramUrl: telegramUrl || '',
          metadataAddress: null,
          metadataTransaction: null,
          metadataSuccess: false,
          metadataError: 'Legacy SPL token creation does not include metadata',
          metadataUmi: false
        },
        urls: {
          mint: getExplorerUrl(mintKeypair.publicKey.toBase58()),
          transaction: getExplorerUrl(txId, 'tx'),
        },
        simulated: false
      };
    } catch (err) {
      console.error('Error during real token creation:', err);
      throw err;
    }
  } catch (error) {
    console.error("Error during token creation:", error);
    throw error;
  }
} 