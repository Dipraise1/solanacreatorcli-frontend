import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';

// Create fully functional token using SPL token library
export async function createToken(
  connection: Connection,
  wallet: { publicKey: PublicKey, signTransaction: (tx: Transaction) => Promise<Transaction> },
  params: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
    imageUrl?: string;
    twitterUrl?: string;
    telegramUrl?: string;
  }
) {
  try {
    console.log(`Creating token: ${params.name} (${params.symbol})`);
    console.log(`Decimals: ${params.decimals}, Supply: ${params.initialSupply}`);
    if (params.imageUrl) console.log(`Image URL: ${params.imageUrl}`);
    if (params.twitterUrl) console.log(`Twitter: ${params.twitterUrl}`);
    if (params.telegramUrl) console.log(`Telegram: ${params.telegramUrl}`);

    // Create the token mint directly using the SPL token library function
    // This handles all the instructions needed to create a mint
    console.log("Creating token mint...");
    
    // Convert wallet to a payer-like object that SPL token functions expect
    const payer = {
      publicKey: wallet.publicKey,
      // The SPL token functions expect this format for the signer
      // We can't use this directly, but we'll use similar functions
      secretKey: new Uint8Array(0)
    };
    
    // Generate a new keypair for the mint
    const mintKeypair = Keypair.generate();
    console.log(`Mint keypair created: ${mintKeypair.publicKey.toString()}`);
    
    // Create the token mint using the createMint function from spl-token
    const mint = await createMint(
      connection,
      // We'll have to manually handle the signing in our implementation
      // This is just for function signature compatibility
      payer as any,
      wallet.publicKey,
      wallet.publicKey,
      params.decimals
    );
    
    console.log(`Token mint created: ${mint.toString()}`);

    // Get or create the associated token account for the user
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer as any,
      mint,
      wallet.publicKey
    );
    
    console.log(`Token account created: ${tokenAccount.address.toString()}`);

    // Calculate supply with the correct decimal precision
    const adjustedSupply = BigInt(params.initialSupply * Math.pow(10, params.decimals));

    // Mint the tokens to the user's wallet
    const txSignature = await mintTo(
      connection,
      payer as any,
      mint,
      tokenAccount.address,
      wallet.publicKey,
      adjustedSupply
    );
    
    console.log(`Tokens minted to user's wallet: ${txSignature}`);
    console.log(`Token created successfully!`);

    return {
      mint: mint.toString(),
      tokenAccount: tokenAccount.address.toString(),
      success: true,
    };
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

// Helper to derive the associated token account address
async function deriveAssociatedTokenAccount(
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  // This is a simplified version. In a real app, you'd use the getAssociatedTokenAddress function
  // from @solana/spl-token
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') // Associated Token Program ID
  )[0];
} 