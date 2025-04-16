# Solana Token Deployer CLI

A command-line tool for creating and deploying SPL tokens on the Solana blockchain. 

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- Create SPL tokens on Solana (devnet or mainnet)
- Specify token metadata (name, symbol, decimals, supply)
- Add custom image URL and social media links
- (Optional) Simulate adding tokens to Raydium liquidity pools
- Save token information for future reference
- Interactive mode for guided token creation
- Config file support for automated deployments

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+) and npm installed
- [Solana CLI tools](https://docs.solana.com/cli/install-solana-cli-tools) (for wallet creation)
- A Solana wallet with SOL for transaction fees

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/solana-token-cli.git
   cd solana-token-cli
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment:
   ```
   cp cli/.env.example cli/.env
   ```

4. Edit the `.env` file with your Solana RPC endpoint and wallet path

## Setup Your Wallet

If you don't have a Solana wallet file yet:

1. Generate a new wallet:
   ```
   solana-keygen new --outfile wallet.json
   ```

2. Fund your wallet with SOL (for devnet):
   ```
   solana airdrop 2 $(solana-keygen pubkey wallet.json) --url https://api.devnet.solana.com
   ```

3. Update the `WALLET_PATH` in your `.env` file to point to your wallet.json file

## Usage

### Interactive Mode

Run the CLI in interactive mode to be guided through the token creation process:

```
node cli/index.js
```

### Using a Configuration File

Create a JSON file with your token specifications:

```json
{
  "name": "My Token",
  "symbol": "MTK",
  "decimals": 9,
  "initialSupply": 1000000,
  "imageUrl": "https://example.com/token-image.png",
  "twitterUrl": "mytoken",
  "telegramUrl": "mytokengroup",
  "addToRaydium": false
}
```

Then run:

```
node cli/index.js --config my-token-config.json
```

### Command Line Options

```
node cli/index.js --help
```

Available options:
- `--help, -h`: Show help message
- `--config <file>`: Specify a JSON configuration file
- `--yes, -y`: Skip confirmation prompts

## Output

After creating a token, the CLI will:

1. Display the token mint address and explorer URL
2. Save detailed token information to the `token-outputs/` directory

## Web Interface

This project also includes a web interface for token creation. To use it:

```
cd frontend
npm install
npm run dev
```

Then open your browser to http://localhost:3000

## Development

### Project Structure

- `cli/` - Command-line interface for token creation
  - `index.js` - Main CLI entry point
  - `config.js` - Configuration loading
  - `fetch-info.js` - Interactive prompts
  - `token-utils.js` - Token creation logic
  - `raydium-utils.js` - Raydium integration (placeholder)

- `frontend/` - Web interface for token creation
  - Built with Next.js and Tailwind CSS
  - Uses Solana wallet adapters for browser wallet integration

### Environment Variables

The following environment variables can be set in the `.env` file:

- `RPC_ENDPOINT` - Solana RPC endpoint URL
- `WALLET_PATH` - Path to your wallet keypair JSON file
- `NETWORK` - Network to deploy on (devnet, testnet, or mainnet-beta)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is provided for educational purposes only. Always thoroughly test tokens on devnet before deploying to mainnet. The creators are not responsible for any loss of funds. 