# Solana Token Deployer CLI Demo Script

## Introduction
This script demonstrates creating a Solana SPL token using our professional CLI tool, with a focus on interactive user input directly in the terminal.

## Setup Phase

### 1. Navigate to the Correct Directory
```bash
# Make sure you're in the solana-token-cli directory
cd /Users/DIVINE/Desktop/solanaspldeployer/solana-token-cli
```

### 2. Check Solana CLI Version and Connection
```bash
solana --version
solana config get
solana balance
```

### 3. Check Wallet Address and Balance
```bash
# Show your wallet keypair path from config
solana config get | grep "Keypair Path"

# Check the wallet address (public key) you'll use for deployment
solana-keygen pubkey wallet-testnet.json

# Verify your wallet has enough SOL for transactions
solana balance
```

## Interactive Token Creation (Main Demo)

### 1. Show Help Information
```bash
# Make sure to run these commands from the solana-token-cli directory
node cli/index.js --help
```

### 2. Create Token with Interactive Input (Simulation Mode)
This is the key part of the demo - users providing all input in the terminal:

```bash
node cli/index.js --simulate
```

During this interactive process, you'll enter:
- Token name (e.g., "Client Demo Token")
- Token symbol (e.g., "CLNT")
- Decimals (e.g., 6)
- Initial supply (e.g., 1000000)
- Image URL (optional)
- Twitter username (optional)
- Telegram group name (optional)
- Whether to add to Raydium (Yes/No)

### 3. Deploy Real Token with Interactive Input
```bash
node cli/index.js
```

Same interactive process, but this time actually deploying to devnet.

## Verification Phase

### 1. Check the Output File
```bash
# Replace with the actual timestamp in the filename from your output
cat token-outputs/clnt-*.json
```

### 2. Verify Token on Blockchain
```bash
# Replace with the actual mint address from the output
spl-token supply <MINT_ADDRESS>
spl-token display <MINT_ADDRESS>
```

### 3. Show the Token in the Solana Explorer
Open the explorer link from the output in your browser.

## Configuration File Method (Optional Alternative)

For completeness, you can briefly show the configuration file approach:

```bash
# Show the pre-created configuration file
cat client-demo-token.json

# Use it to create a token
node cli/index.js --config client-demo-token.json --simulate --yes
```

## Explorer Links for Previously Created Token

### Token Information
- **View on Solana Explorer**: [https://explorer.solana.com/address/2EPLKAnKYykojGVypD6DQRQSkFQ4wogHoe3DfjW1HpeT?cluster=devnet](https://explorer.solana.com/address/2EPLKAnKYykojGVypD6DQRQSkFQ4wogHoe3DfjW1HpeT?cluster=devnet)

## Why Token Metadata Is Important

When explaining why tokens don't display their names in explorers, cover these key points:

### How SPL Token Names Work
1. The basic SPL token standard doesn't store names on-chain
2. The token name and symbol are only stored in our CLI output files
3. To make a token name appear in explorers, an additional metadata record must be created

### Benefits of Token Metadata 
1. Improved visibility in wallets and explorers
2. Better user experience as people see token names instead of addresses
3. Support for images, which makes tokens more recognizable

### Our Implementation
1. Our CLI already saves all metadata locally
2. We could easily add Metaplex metadata integration
3. This would be a standard add-on for any production token

## Key Talking Points

### Interactive User Experience
1. Easy-to-follow prompts with clear instructions
2. Color-coded interface with beautiful ASCII art
3. Validation of user inputs to prevent errors
4. Immediate feedback during each step of the process

### User Benefits
1. No coding knowledge required
2. Direct terminal input feels more hands-on
3. All token parameters can be customized
4. Optional simulation mode prevents costly mistakes

### Technical Highlights
1. Creates SPL tokens directly on the Solana blockchain
2. Supports custom decimals and supply amounts
3. Includes metadata like image URL and social links
4. Saves all token information for future reference

### Business Value
1. Fast deployment process (under 1 minute)
2. Enterprise-ready with simulation testing
3. Works on both devnet (for testing) and mainnet (for production)
4. Complete audit trail with transaction IDs and explorer links 