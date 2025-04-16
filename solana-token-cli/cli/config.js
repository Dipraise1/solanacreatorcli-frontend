import fs from 'fs';
import { Keypair, Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || 'https://api.testnet.solana.com';
const WALLET_PATH = process.env.WALLET_PATH;
export const NETWORK = process.env.NETWORK || 'testnet';

if (!WALLET_PATH) {
  throw new Error('WALLET_PATH must be set in the .env file.');
}

console.log(`Connecting to Solana ${NETWORK} network: ${RPC_ENDPOINT}`);

// Create a connection instance for the Solana cluster
export const connection = new Connection(RPC_ENDPOINT);

// Load a wallet from the JSON file
export function loadWallet() {
  try {
    console.log(`Loading wallet from: ${WALLET_PATH}`);
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(WALLET_PATH, { encoding: 'utf-8' })));
    const wallet = Keypair.fromSecretKey(secretKey);
    console.log(`Wallet loaded successfully: ${wallet.publicKey.toString()}`);
    return wallet;
  } catch (error) {
    console.error('Error loading wallet from', WALLET_PATH);
    console.error('Make sure the wallet file exists and contains a valid secret key.');
    console.error('You can create a new wallet using: solana-keygen new --outfile wallet.json');
    throw error;
  }
}

// Get the Solana Explorer URL based on the network
export function getExplorerUrl(address, type = 'address') {
  const baseUrl = 'https://explorer.solana.com';
  const networkParam = NETWORK === 'mainnet-beta' ? '' : `?cluster=${NETWORK}`;
  return `${baseUrl}/${type}/${address}${networkParam}`;
} 