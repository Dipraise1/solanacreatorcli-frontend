import prompts from 'prompts';
import chalk from 'chalk';

export async function getTokenInfo() {
  console.log(chalk.dim('* Required fields'));

  const response = await prompts([
    {
      type: 'text',
      name: 'name',
      message: chalk.cyan('Enter your token name') + chalk.red(' *'),
      validate: value => value.length > 0 || 'Token name cannot be empty.'
    },
    {
      type: 'text',
      name: 'symbol',
      message: chalk.cyan('Enter your token symbol') + chalk.red(' *'),
      validate: value => value.length > 0 || 'Token symbol cannot be empty.'
    },
    {
      type: 'number',
      name: 'decimals',
      message: chalk.cyan('Enter number of decimals (e.g., 6)') + chalk.red(' *'),
      initial: 6,
      validate: value => value >= 0 || 'Decimals must be a non-negative number.'
    },
    {
      type: 'number',
      name: 'initialSupply',
      message: chalk.cyan('Enter the initial supply of tokens') + chalk.red(' *'),
      validate: value => value > 0 || 'Initial supply must be greater than zero.'
    },
    {
      type: 'text',
      name: 'imageUrl',
      message: chalk.cyan('Enter token image URL (optional)'),
    },
    {
      type: 'text',
      name: 'twitterUrl',
      message: chalk.cyan('Enter Twitter username without @ (optional)'),
    },
    {
      type: 'text',
      name: 'telegramUrl',
      message: chalk.cyan('Enter Telegram group/channel name (optional)'),
    },
    {
      type: 'confirm',
      name: 'addToRaydium',
      message: chalk.cyan('Do you want to add this token to Raydium liquidity pool?'),
      initial: false
    }
  ], {
    onCancel: () => {
      console.log(chalk.yellow('\nToken creation cancelled by user.'));
      return { name: '' }; // Return empty object to signal cancellation
    }
  });
  
  return response;
} 