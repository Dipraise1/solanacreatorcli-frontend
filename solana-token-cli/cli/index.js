import { getTokenInfo } from './fetch-info.js';
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
    let tokenInfo;

    if (args.includes('--help') || args.includes('-h')) {
      printHelp();
      return;
    }

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
      tokenInfo = await getTokenInfo();
      
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
  console.log(chalk.cyan("  node index.js [options]\n"));
  console.log(chalk.white("Options:"));
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