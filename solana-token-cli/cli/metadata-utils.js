import { connection, loadWallet, getExplorerUrl } from './config.js';
import * as web3 from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

// Import Metaplex token metadata module using CommonJS workaround
import pkg from '@metaplex-foundation/mpl-token-metadata';
const { createCreateMetadataAccountV3Instruction } = pkg;

// Constants
const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

/**
 * Creates metadata for a token using Metaplex Token Metadata Program
 * @param {Object} tokenInfo - Token information object
 * @param {web3.PublicKey} mint - The mint address of the token
 * @param {boolean} simulate - Whether to simulate the transaction
 * @returns {Promise<Object>} - Object containing transaction signature and metadata address
 */
export async function createTokenMetadata(tokenInfo, mint, simulate = false) {
  try {
    const { name, symbol, imageUrl, twitterUrl, telegramUrl } = tokenInfo;
    
    if (simulate) {
      console.log('SIMULATION MODE: Not creating actual token metadata');
      return {
        success: true,
        signature: 'SimulatedMetadataTx' + Math.random().toString(36).substring(2, 10),
        metadataAddress: web3.Keypair.generate().publicKey.toBase58(),
        simulated: true
      };
    }
    
    console.log('Creating token metadata using Metaplex Token Metadata Program...');
    console.log(`Token metadata: Name: ${name}, Symbol: ${symbol}, Image: ${imageUrl || 'None'}`);
    if (twitterUrl) console.log(`Twitter: @${twitterUrl}`);
    if (telegramUrl) console.log(`Telegram: t.me/${telegramUrl}`);
    
    const wallet = loadWallet();
    const mintPublicKey = new web3.PublicKey(mint);
    
    // Generate the metadata PDA (Program Derived Address)
    const [metadataPDA] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    console.log(`Metadata PDA: ${metadataPDA.toBase58()}`);
    
    // Create URI with metadata including image and social links
    let metadataUri = '';
    
    // Only create a metadata URI if we have an image or social links
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
      metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadataJson)).toString('base64')}`;
    }
    
    // Create the DataV2 structure required by the token metadata program
    const dataV2 = {
      name: name,
      symbol: symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    };
    
    // Create the accounts structure for the CreateMetadataAccountV3 instruction
    const accounts = {
      metadata: metadataPDA,
      mint: mintPublicKey,
      mintAuthority: wallet.publicKey,
      payer: wallet.publicKey,
      updateAuthority: wallet.publicKey,
    };
    
    // Create the instruction using Metaplex helper
    const instruction = createCreateMetadataAccountV3Instruction(
      accounts,
      {
        data: dataV2,
        isMutable: true,
        collectionDetails: null
      }
    );
    
    // Create transaction
    const transaction = new web3.Transaction().add(instruction);
    
    // Set transaction options
    transaction.feePayer = wallet.publicKey;
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    
    // Sign and send transaction
    transaction.sign(wallet);
    
    console.log('Sending metadata transaction...');
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    
    console.log(`Waiting for metadata transaction confirmation...`);
    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature,
    }, 'confirmed');
    
    console.log(`✅ Token metadata created successfully!`);
    console.log(`Transaction ID: ${signature}`);
    console.log(`Transaction URL: ${getExplorerUrl(signature, 'tx')}`);
    
    return {
      success: true,
      signature,
      metadataAddress: metadataPDA.toBase58(),
      simulated: false,
      socialInfo: {
        imageUrl: imageUrl || '',
        twitterUrl: twitterUrl || '',
        telegramUrl: telegramUrl || ''
      }
    };
  } catch (error) {
    console.error('Error creating token metadata:', error);
    
    // For error cases, still return a response with error info
    // so the CLI can continue and save the token details
    return {
      success: false,
      error: error.message,
      metadataAddress: null,
      simulated: false
    };
  }
} 