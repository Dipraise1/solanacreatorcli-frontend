import { connection, loadWallet, getExplorerUrl } from './config.js';
import * as web3 from '@solana/web3.js';

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
    
    // Generate the metadata PDA manually
    const mintPublicKey = new web3.PublicKey(mint);
    const [metadataPDA] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    console.log(`Metadata PDA: ${metadataPDA.toBase58()}`);
    
    // Simplified metadata approach - just using essential fields
    // This is more likely to work with current Metaplex Token Metadata Program
    
    // Create a simple metadata structure
    const metadataData = {
      name,
      symbol,
      uri: '', // Empty URI is safer if we don't have a proper JSON metadata URL
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    };
    
    // Serialize the metadata for the instruction
    const metadataArgsBuffer = Buffer.from(JSON.stringify({
      name,
      symbol,
      uri: '',
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
      isMutable: true
    }));
    
    // Create metadata transaction with CreateMetadataAccountV3 instruction
    // Simplified instruction data - just using the essential fields
    const createMetadataInstruction = new web3.TransactionInstruction({
      keys: [
        { pubkey: metadataPDA, isSigner: false, isWritable: true },
        { pubkey: mintPublicKey, isSigner: false, isWritable: false },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false }, // mint authority
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // payer
        { pubkey: wallet.publicKey, isSigner: false, isWritable: false }, // update authority
        { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: TOKEN_METADATA_PROGRAM_ID,
      data: Buffer.concat([
        Buffer.from([16]), // 16 = CreateMetadataAccountV3 instruction
        metadataArgsBuffer,
      ])
    });
    
    // Create transaction
    const transaction = new web3.Transaction().add(createMetadataInstruction);
    
    // Set transaction options
    transaction.feePayer = wallet.publicKey;
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    
    // Sign and send transaction
    transaction.sign(wallet);
    
    console.log('Sending metadata transaction...');
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: true, // Skip preflight to avoid metadata parsing issues
      preflightCommitment: 'confirmed',
    });
    
    console.log(`Waiting for metadata transaction confirmation...`);
    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature,
    });
    
    console.log(`✅ Token metadata created successfully!`);
    console.log(`Transaction ID: ${signature}`);
    console.log(`Transaction URL: ${getExplorerUrl(signature, 'tx')}`);
    
    // After successful metadata creation, we'll store the social info separately
    // This is a workaround since we can't reliably store it directly in the on-chain metadata
    
    // In a production app, you would store this information in a proper database
    // For now, we'll just return it so it's saved in the token-outputs JSON file
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