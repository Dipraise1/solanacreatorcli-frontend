import { getTokenInfo as getNewTokenInfo } from './fetch-info.js';
import { getTokenInfo as getExistingTokenInfo } from './get-token-info.js';
import { createToken } from './token-utils.js';
import { addLiquidity } from './raydium-utils.js';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { NETWORK } from './config.js';

// ASCII art logo
const asciiLogo = `
   ███████╗ ██████╗ ██╗      █████╗ ███╗   ██╗ █████╗ 
   ██╔════╝██╔═══██╗██║     ██╔══██╗████╗  ██║██╔══██╗
   ███████╗██║   ██║██║     ███████║██╔██╗ ██║███████║
   ╚════██║██║   ██║██║     ██╔══██║██║╚██╗██║██╔══██║
   ███████║╚██████╔╝███████╗██║  ██║██║ ╚████║██║  ██║
   ╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
                                      
   ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗      
   ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║      
      ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║      
      ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║      
      ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║      
      ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝      
                                                      
   ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗███████╗██████╗ 
   ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝██╔════╝██╔══██╗
   ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ █████╗  ██████╔╝
   ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██╔══╝  ██╔══██╗
   ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   ███████╗██║  ██║
   ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝
   
                                                 v1.0.0
`;

async function main() {
  // Print colored ASCII logo
  console.log(chalk.cyan(asciiLogo));

  // Print welcome message
  console.log(chalk.bold.white("Welcome to the Solana Token Deployer CLI"));
  console.log(chalk.white("A powerful tool for creating and managing SPL tokens on Solana\n"));

  // Print running environment
  console.log(chalk.bold.yellow(`🔗 Network: ${chalk.white(NETWORK.toUpperCase())}`));
  console.log(chalk.bold.yellow(`📅 Time: ${chalk.white(new Date().toLocaleString())}\n`));

  try {
    // Check for command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      printHelp();
      return;
    }
    
    // Check if we're in token info retrieval mode
    if (args.includes('info')) {
      await handleTokenInfo(args);
      return;
    }
    
    // Check if we're in token list mode
    if (args.includes('list')) {
      await handleTokenList();
      return;
    }

    // Continue with token creation flow
    let tokenInfo;
    
    // Check if we're in simulation mode
    const simulationMode = args.includes('--simulate') || args.includes('-s');
    if (simulationMode) {
      console.log(chalk.bgYellow.black("\n🧪 SIMULATION MODE ENABLED"));
      console.log(chalk.yellow("No actual blockchain transactions will be made\n"));
    }

    // Check if configuration file is specified
    const configIndex = args.indexOf('--config');
    if (configIndex !== -1 && args.length > configIndex + 1) {
      const configFile = args[configIndex + 1];
      console.log(chalk.blue(`📄 Loading configuration from: ${chalk.white(configFile)}`));
      
      try {
        const configData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        tokenInfo = configData;
        console.log(chalk.green("✅ Configuration loaded successfully.\n"));
      } catch (error) {
        console.error(chalk.red(`❌ Error loading configuration file: ${error.message}`));
        console.log(chalk.yellow("Falling back to interactive mode...\n"));
      }
    }

    // If no config file or it failed to load, use interactive mode
    if (!tokenInfo) {
      console.log(chalk.blue("🔍 Please provide details for your new token:"));
      tokenInfo = await getNewTokenInfo();
      
      if (!tokenInfo.name) {
        console.log(chalk.yellow("Token creation cancelled."));
        return;
      }
    }
    
    // Display token details
    console.log(chalk.bold.white("\n📝 Token details:"));
    console.log(chalk.white(`• Name: ${chalk.cyan(tokenInfo.name)}`));
    console.log(chalk.white(`• Symbol: ${chalk.cyan(tokenInfo.symbol)}`));
    console.log(chalk.white(`• Decimals: ${chalk.cyan(tokenInfo.decimals)}`));
    console.log(chalk.white(`• Initial Supply: ${chalk.cyan(tokenInfo.initialSupply)}`));
    if (tokenInfo.imageUrl) console.log(chalk.white(`• Image URL: ${chalk.cyan(tokenInfo.imageUrl)}`));
    if (tokenInfo.twitterUrl) console.log(chalk.white(`• Twitter: ${chalk.cyan('@' + tokenInfo.twitterUrl)}`));
    if (tokenInfo.telegramUrl) console.log(chalk.white(`• Telegram: ${chalk.cyan('t.me/' + tokenInfo.telegramUrl)}`));
    console.log(chalk.white(`• Add to Raydium: ${tokenInfo.addToRaydium ? chalk.green('Yes') : chalk.red('No')}`));
    console.log();

    // Confirm if user wants to proceed
    if (!args.includes('--yes') && !args.includes('-y')) {
      const { proceed } = await getConfirmation();
      if (!proceed) {
        console.log(chalk.yellow("Token creation cancelled."));
        return;
      }
    }

    // Create and mint the token
    console.log(chalk.blue("\n🔨 Creating token..."));
    const result = await createToken(tokenInfo, simulationMode);
    const mint = result.mint;
    
    console.log(chalk.bold.green(`\n✅ Token ${simulationMode ? "simulated" : "created"} successfully!`));
    console.log(chalk.white(`📌 Mint Address: ${chalk.cyan(mint.toBase58())}`));
    console.log(chalk.white(`🔍 View on Solana Explorer: ${chalk.cyan(result.urls.mint)}`));
    console.log(chalk.white(`🧾 Transaction: ${chalk.cyan(result.urls.transaction)}`));
    
    // Display metadata information
    console.log(chalk.bold.white(`\n📋 Token Metadata:`));
    console.log(chalk.white(`• Token will appear as ${chalk.cyan(tokenInfo.symbol)} with name ${chalk.cyan(tokenInfo.name)} in explorers`));
    
    // Check if metadata was created successfully
    if (result.metadata.metadataSuccess) {
      console.log(chalk.white(`• Metadata Address: ${chalk.cyan(result.metadata.metadataAddress)}`));
      if (result.urls.metadataTransaction) {
        console.log(chalk.white(`• Metadata Transaction: ${chalk.cyan(result.urls.metadataTransaction)}`));
      }
    } else {
      console.log(chalk.yellow(`• Metadata creation encountered an issue, but your token is still valid.`));
      if (result.metadata.metadataError) {
        console.log(chalk.yellow(`• Metadata Error: ${result.metadata.metadataError}`));
      }
      console.log(chalk.yellow(`• Your token may appear with address instead of name in some explorers.`));
    }
    
    if (!simulationMode) {
      console.log(chalk.yellow(`\nℹ️ Note: It may take a few minutes for the token to appear with its name in explorers.`));
    }

    // Save token details to file
    const outputDir = './token-outputs';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const outputFile = path.join(outputDir, `${tokenInfo.symbol.toLowerCase()}-${Date.now()}.json`);
    const outputData = {
      ...tokenInfo,
      mint: mint.toBase58(),
      tokenAccount: result.tokenAccount.toBase58(),
      transaction: result.transaction,
      createdAt: new Date().toISOString(),
      urls: result.urls,
      metadata: {
        success: result.metadata.metadataSuccess,
        address: result.metadata.metadataAddress,
        transaction: result.metadata.metadataTransaction,
        error: result.metadata.metadataError
      }
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(chalk.white(`💾 Token details saved to: ${chalk.cyan(outputFile)}`));

    // Optionally integrate with the liquidity pool
    if (tokenInfo.addToRaydium) {
      console.log(chalk.blue("\n🌊 Proceeding with Raydium liquidity pool integration..."));
      await addLiquidity(mint, tokenInfo, simulationMode);
      console.log(chalk.green("\n💧 Liquidity pool step completed."));
    }
    
    console.log(chalk.bold.green("\n🎉 All operations completed successfully!"));
    
  } catch (error) {
    console.error(chalk.bold.red("\n❌ Error encountered:"));
    console.error(chalk.red(error.message));
    if (error.stack) {
      console.error(chalk.dim("\nStack trace:"));
      console.error(chalk.dim(error.stack));
    }
    process.exit(1);
  }
}

async function handleTokenInfo(args) {
  const mintIndex = args.indexOf('info') + 1;
  
  if (args.length <= mintIndex) {
    console.error(chalk.red("❌ Please provide a token mint address."));
    console.log(chalk.blue("Usage: node index.js info <MINT_ADDRESS>"));
    return;
  }
  
  const mintAddress = args[mintIndex];
  console.log(chalk.blue(`🔍 Looking up token information for: ${chalk.cyan(mintAddress)}`));
  
  try {
    const tokenInfo = await getExistingTokenInfo(mintAddress, true);
    
    if (!tokenInfo.exists) {
      console.error(chalk.red(`\n❌ Token not found: ${mintAddress}`));
      return;
    }
    
    // Print summary
    console.log(chalk.bold.green("\n📊 Token Summary:"));
    if (tokenInfo.metadata && tokenInfo.metadata.name) {
      console.log(chalk.white(`• Name: ${chalk.cyan(tokenInfo.metadata.name)} (${chalk.cyan(tokenInfo.metadata.symbol)})`));
    } else {
      console.log(chalk.white(`• Mint: ${chalk.cyan(tokenInfo.mint)}`));
    }
    console.log(chalk.white(`• Total Supply: ${chalk.cyan(tokenInfo.supply)}`));
    console.log(chalk.white(`• Decimals: ${chalk.cyan(tokenInfo.decimals)}`));
    console.log(chalk.white(`• Your Balance: ${chalk.cyan(tokenInfo.userBalance || 0)}`));
    
    // Explorer links
    console.log(chalk.bold.blue("\n🔗 Links:"));
    console.log(chalk.white(`• Explorer: ${chalk.cyan(tokenInfo.urls.explorer)}`));
    
    // Save to file option
    if (args.includes('--save')) {
      const outputDir = './token-outputs';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      
      const symbol = tokenInfo.metadata?.symbol || 'unknown';
      const outputFile = path.join(outputDir, `${symbol.toLowerCase()}-info-${Date.now()}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(tokenInfo, null, 2));
      console.log(chalk.white(`\n💾 Token details saved to: ${chalk.cyan(outputFile)}`));
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error looking up token: ${error.message}`));
  }
}

async function handleTokenList() {
  console.log(chalk.blue("📋 Listing your tokens..."));
  
  // Check token-outputs directory for previously created tokens
  const outputDir = './token-outputs';
  let savedTokens = [];
  
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));
          if (data.mint) {
            savedTokens.push({
              name: data.name || 'Unknown',
              symbol: data.symbol || 'Unknown',
              mint: data.mint,
              createdAt: data.createdAt || 'Unknown',
              file
            });
          }
        } catch (err) {
          // Skip invalid files
        }
      }
    }
  }
  
  if (savedTokens.length > 0) {
    console.log(chalk.green(`\n🪙 Found ${savedTokens.length} tokens in your output directory:`));
    
    savedTokens.sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    for (let i = 0; i < savedTokens.length; i++) {
      const token = savedTokens[i];
      console.log(chalk.white(`\n${i + 1}. ${chalk.cyan(token.name)} (${chalk.cyan(token.symbol)})`));
      console.log(chalk.white(`   Mint: ${chalk.cyan(token.mint)}`));
      console.log(chalk.white(`   Created: ${chalk.cyan(new Date(token.createdAt).toLocaleString())}`));
      console.log(chalk.white(`   File: ${chalk.cyan(token.file)}`));
      console.log(chalk.white(`   Explorer: ${chalk.cyan(`https://explorer.solana.com/address/${token.mint}?cluster=${NETWORK}`)}`));
    }
  } else {
    console.log(chalk.yellow("\n⚠️ No saved tokens found in the token-outputs directory."));
    console.log(chalk.yellow("  Create a token first or manually add token data files to the directory."));
  }
}

async function getConfirmation() {
  const prompts = (await import('prompts')).default;
  return prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Do you want to proceed with token creation?',
    initial: true
  });
}

function printHelp() {
  console.log(chalk.bold.cyan("Solana Token Deployer CLI Help:"));
  console.log(chalk.cyan("=================================\n"));
  console.log(chalk.white("Usage:"));
  console.log(chalk.cyan("  node index.js [options]") + chalk.white("           Create a new token"));
  console.log(chalk.cyan("  node index.js info <address> [--save]") + chalk.white(" Get information about an existing token"));
  console.log(chalk.cyan("  node index.js list") + chalk.white("                List your previously created tokens\n"));
  
  console.log(chalk.white("Options for token creation:"));
  console.log(chalk.cyan("  --help, -h          ") + chalk.white("Show this help message"));
  console.log(chalk.cyan("  --config <file>     ") + chalk.white("Specify a JSON configuration file with token details"));
  console.log(chalk.cyan("  --yes, -y           ") + chalk.white("Skip confirmation prompts"));
  console.log(chalk.cyan("  --simulate, -s      ") + chalk.white("Simulate token creation without blockchain transactions\n"));
  console.log(chalk.white("Configuration file format example:"));
  console.log(chalk.cyan(`  {
    "name": "My Token",
    "symbol": "MTK",
    "decimals": 9,
    "initialSupply": 1000000,
    "imageUrl": "https://example.com/token-image.png",
    "twitterUrl": "mytoken",
    "telegramUrl": "mytokengroup",
    "addToRaydium": false
  }\n`));
}

main().catch(console.error); 