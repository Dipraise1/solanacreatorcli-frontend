import { getTokenInfo as getNewTokenInfo } from './fetch-info.js';
import { createToken } from './token-utils.js';
import { addLiquidity } from './raydium-utils.js';
import { listTokens, getTokenDetails, displayTokenDetails } from './token-viewer.js';
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
    
    // Check for token view command
    if (args.includes('view')) {
      await handleViewToken(args);
      return;
    }
    
    // Check for token list command
    if (args.includes('list')) {
      await handleListTokens(args);
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

    // Check if we should use Umi for metadata
    const usePureUmi = args.includes('--pure-umi');
    const useUmi = !args.includes('--no-umi');

    if (usePureUmi) {
      console.log(chalk.cyan("\n🔄 Using pure Umi implementation for token creation"));
    } else if (!useUmi) {
      console.log(chalk.yellow("\n⚠️ Using legacy metadata creation instead of Umi"));
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
    const result = await createToken({ 
      ...tokenInfo, 
      useUmi: usePureUmi ? 'pure' : useUmi 
    }, simulationMode);
    const mint = result.mint;
    
    console.log(chalk.bold.green(`\n✅ Token ${simulationMode ? "simulated" : "created"} successfully!`));
    console.log(chalk.white(`📌 Mint Address: ${chalk.cyan(mint.toBase58())}`));
    console.log(chalk.white(`🔍 View on Solana Explorer: ${chalk.cyan(result.urls.mint)}`));
    console.log(chalk.white(`🧾 Transaction: ${chalk.cyan(result.urls.transaction)}`));
    
    // Display metadata information
    console.log(chalk.bold.white(`\n📋 Token Metadata:`));
    console.log(chalk.white(`• Token will appear as ${chalk.cyan(tokenInfo.symbol)} with name ${chalk.cyan(tokenInfo.name)} in explorers`));
    console.log(chalk.white(`• Metadata created using: ${chalk.cyan(result.metadata.metadataUmi ? 'Umi' : 'Legacy')}`));
    
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

/**
 * Handle the token list command
 * @param {string[]} args - Command line arguments
 */
async function handleListTokens(args) {
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  // Check for filter argument
  let filter = '';
  const filterIndex = args.indexOf('--filter');
  if (filterIndex !== -1 && args.length > filterIndex + 1) {
    filter = args[filterIndex + 1];
    console.log(chalk.blue(`🔍 Filtering tokens with: ${chalk.cyan(filter)}`));
  }
  
  await listTokens(verbose, filter);
}

/**
 * Handle the token view command
 * @param {string[]} args - Command line arguments
 */
async function handleViewToken(args) {
  const viewIndex = args.indexOf('view') + 1;
  
  if (args.length <= viewIndex) {
    console.error(chalk.red("❌ Please provide a token mint address or index."));
    console.log(chalk.blue("Usage: solana-token view <MINT_ADDRESS_OR_INDEX>"));
    return;
  }
  
  const identifier = args[viewIndex];
  
  // Check if the identifier is a number (index) or a string (mint address)
  if (/^\d+$/.test(identifier)) {
    // It's an index, get the list of tokens
    const tokens = await listTokens(false);
    const index = parseInt(identifier) - 1;
    
    if (index < 0 || index >= tokens.length) {
      console.error(chalk.red(`❌ Invalid token index. Please choose between 1 and ${tokens.length}`));
      return;
    }
    
    const token = tokens[index];
    const tokenDetails = await getTokenDetails(token.mint);
    displayTokenDetails(tokenDetails);
  } else {
    // It's a mint address
    try {
      const tokenDetails = await getTokenDetails(identifier);
      displayTokenDetails(tokenDetails);
    } catch (error) {
      console.error(chalk.red(`❌ Failed to get token details: ${error.message}`));
    }
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
  console.log(chalk.bold.white("\nUsage: solana-token [options]"));
  console.log("\nOptions:");
  console.log("  --help, -h            Show this help message");
  console.log("  --config <file>       Use a JSON configuration file for token creation");
  console.log("  --simulate, -s        Simulate token creation without making actual transactions");
  console.log("  --yes, -y             Skip confirmation prompts");
  console.log("  --no-umi              Use legacy metadata creation instead of Umi");
  console.log("  --pure-umi            Use the pure Umi approach for token creation (new version)");
  
  console.log("\nCommands:");
  console.log("  list                  List all tokens created with this CLI");
  console.log("  list --verbose, -v    List all tokens with detailed information");
  console.log("  list --filter <text>  Filter tokens by name, symbol or address");
  console.log("  view <mint/index>     View detailed information about a specific token");
  console.log();
}

main().catch(console.error); 