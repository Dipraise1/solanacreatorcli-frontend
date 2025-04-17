import {
  percentAmount,
  generateSigner,
  signerIdentity,
  createSignerFromKeypair,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  createAndMint,
  mplTokenMetadata,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import * as web3 from '@solana/web3.js';
import { readFileSync } from 'fs';
import { getExplorerUrl } from './config.js';

/**
 * Create and mint a new token with metadata using Umi
 * @param {Object} tokenInfo - Token information object
 * @param {string} walletPath - Path to wallet file
 * @param {boolean} simulate - Whether to simulate the transaction
 * @returns {Promise<Object>} - Created token info
 */
export async function createTokenWithUmi({ name, symbol, decimals, initialSupply, imageUrl, twitterUrl, telegramUrl }, walletPath, simulate = false) {
  try {
    console.log(`Creating token with ${decimals} decimals and initial supply of ${initialSupply}...`);
    if (imageUrl) console.log(`Token image URL: ${imageUrl}`);
    if (twitterUrl) console.log(`Twitter: @${twitterUrl}`);
    if (telegramUrl) console.log(`Telegram: t.me/${telegramUrl}`);
    
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
      const txId = 'SimulatedUmi' + Math.random().toString(36).substring(2, 15);
      console.log(`Simulated tokens minted successfully! Transaction ID: ${txId}`);
      
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
    
    // Load wallet keypair from the provided path
    const walletKeypairBuffer = readFileSync(walletPath, 'utf-8');
    const walletKeypairData = JSON.parse(walletKeypairBuffer);
    const walletKeypair = web3.Keypair.fromSecretKey(Uint8Array.from(walletKeypairData));
    
    // Initialize Umi for devnet
    const umi = createUmi("https://api.devnet.solana.com");
    
    // Create a Umi keypair from the wallet keypair
    const userWalletSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(walletKeypair));
    
    // Set up the metadata
    const metadata = {
      name: name,
      symbol: symbol,
      description: `${name} (${symbol}) SPL Token`,
      uri: '',
    };
    
    // If we have an image or social links, create a base64 encoded data URI
    if (imageUrl || twitterUrl || telegramUrl) {
      // Create a standard token metadata JSON object
      const metadataJson = {
        name: name,
        symbol: symbol,
        description: `${name} (${symbol}) SPL Token`,
        image: imageUrl || '',
        external_url: '',
        attributes: []
      };
      
      // Add social links as attributes and external_url
      if (twitterUrl) {
        metadataJson.external_url = `https://twitter.com/${twitterUrl}`;
        metadataJson.attributes.push({
          trait_type: 'Twitter',
          value: `@${twitterUrl}`
        });
      }
      
      if (telegramUrl) {
        if (!metadataJson.external_url) {
          metadataJson.external_url = `https://t.me/${telegramUrl}`;
        }
        metadataJson.attributes.push({
          trait_type: 'Telegram',
          value: `t.me/${telegramUrl}`
        });
      }
      
      // Store the JSON as a base64-encoded data URI for immediate availability
      metadata.uri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadataJson)).toString('base64')}`;
    }
    
    // Generate a new mint signer
    const mint = generateSigner(umi);
    console.log(`Mint keypair generated: ${mint.publicKey}`);
    
    // Set up Umi identity and add token metadata plugin
    umi.use(signerIdentity(userWalletSigner));
    umi.use(mplTokenMetadata());
    
    // Calculate the token amount with decimals
    const amount = BigInt(initialSupply) * BigInt(10 ** decimals);
    
    console.log('Creating and minting token...');
    const result = await createAndMint(umi, {
      mint,
      authority: umi.identity,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: decimals,
      amount: amount,
      tokenOwner: userWalletSigner.publicKey,
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi);
    
    // Convert signature to base58 string
    const signature = Buffer.from(result.signature).toString('base58');
    
    console.log(`Token created successfully!`);
    console.log(`Mint Address: ${mint.publicKey}`);
    console.log(`Transaction ID: ${signature}`);
    console.log(`Explorer URL: ${getExplorerUrl(mint.publicKey.toString())}`);
    
    // Find the metadata PDA
    const metadataPda = findMetadataPda(umi, { mint: mint.publicKey })[0];
    
    // Convert the Umi publicKey to string
    const mintAddress = mint.publicKey.toString();
    
    // For legacy compatibility, we need to create a web3 PublicKey for the token account
    // In Umi, this would be the associated token account for the wallet
    const tokenAccountAddress = web3.PublicKey.findProgramAddressSync(
      [
        walletKeypair.publicKey.toBuffer(),
        new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(),
        new web3.PublicKey(mintAddress).toBuffer(),
      ],
      new web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    )[0];
    
    return {
      mint: new web3.PublicKey(mintAddress),
      tokenAccount: tokenAccountAddress,
      transaction: signature,
      metadata: {
        name,
        symbol,
        decimals,
        initialSupply,
        imageUrl: imageUrl || '',
        twitterUrl: twitterUrl || '',
        telegramUrl: telegramUrl || '',
        metadataAddress: metadataPda.toString(),
        metadataTransaction: signature,
        metadataSuccess: true,
        metadataUmi: true
      },
      urls: {
        mint: getExplorerUrl(mintAddress),
        transaction: getExplorerUrl(signature, 'tx'),
        metadataTransaction: getExplorerUrl(signature, 'tx')
      },
      simulated: false
    };
  } catch (error) {
    console.error("Error during Umi token creation:", error);
    throw error;
  }
} 