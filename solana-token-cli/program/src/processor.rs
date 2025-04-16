use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{clock::Clock, rent::Rent, Sysvar},
};
use spl_token::{
    instruction as token_instruction,
    state::{Account as TokenAccount, Mint},
};

use crate::{
    error::TokenDeployerError,
    instruction::TokenDeployerInstruction,
    state::{LiquidityPool, TokenInfo},
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = TokenDeployerInstruction::try_from_slice(instruction_data)
        .map_err(|_| TokenDeployerError::InvalidInstruction)?;

    match instruction {
        TokenDeployerInstruction::CreateToken(token_params) => {
            process_create_token(program_id, accounts, token_params)
        }
        TokenDeployerInstruction::AddLiquidity {
            token_amount,
            quote_amount,
        } => process_add_liquidity(program_id, accounts, token_amount, quote_amount),
    }
}

fn process_create_token(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    token_params: crate::instruction::TokenParams,
) -> ProgramResult {
    msg!("Instruction: CreateToken");
    let account_info_iter = &mut accounts.iter();

    let payer_account = next_account_info(account_info_iter)?;
    if !payer_account.is_signer {
        return Err(TokenDeployerError::Unauthorized.into());
    }

    let mint_account = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let rent_sysvar = next_account_info(account_info_iter)?;
    let rent = &Rent::from_account_info(rent_sysvar)?;
    let clock = Clock::get()?;

    // Create mint account
    let mint_rent = rent.minimum_balance(Mint::LEN);
    msg!("Creating mint account...");
    invoke(
        &system_instruction::create_account(
            payer_account.key,
            mint_account.key,
            mint_rent,
            Mint::LEN as u64,
            &spl_token::id(),
        ),
        &[
            payer_account.clone(),
            mint_account.clone(),
            system_program.clone(),
        ],
    )?;

    // Initialize mint
    msg!("Initializing mint...");
    invoke(
        &token_instruction::initialize_mint(
            &spl_token::id(),
            mint_account.key,
            payer_account.key,
            None,
            token_params.decimals,
        )?,
        &[
            mint_account.clone(),
            rent_sysvar.clone(),
            token_program.clone(),
        ],
    )?;

    // Create token account
    let token_account_rent = rent.minimum_balance(TokenAccount::LEN);
    msg!("Creating token account...");
    invoke(
        &system_instruction::create_account(
            payer_account.key,
            token_account.key,
            token_account_rent,
            TokenAccount::LEN as u64,
            &spl_token::id(),
        ),
        &[
            payer_account.clone(),
            token_account.clone(),
            system_program.clone(),
        ],
    )?;

    // Initialize token account
    msg!("Initializing token account...");
    invoke(
        &token_instruction::initialize_account(
            &spl_token::id(),
            token_account.key,
            mint_account.key,
            payer_account.key,
        )?,
        &[
            token_account.clone(),
            mint_account.clone(),
            payer_account.clone(),
            rent_sysvar.clone(),
            token_program.clone(),
        ],
    )?;

    // Mint tokens
    msg!("Minting tokens...");
    invoke(
        &token_instruction::mint_to(
            &spl_token::id(),
            mint_account.key,
            token_account.key,
            payer_account.key,
            &[],
            token_params.initial_supply,
        )?,
        &[
            mint_account.clone(),
            token_account.clone(),
            payer_account.clone(),
            token_program.clone(),
        ],
    )?;

    // Store token info in the program's account if needed
    // This would require an additional PDA account passed in

    msg!("Token created: {}", token_params.name);
    Ok(())
}

fn process_add_liquidity(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    token_amount: u64,
    quote_amount: u64,
) -> ProgramResult {
    msg!("Instruction: AddLiquidity");
    let account_info_iter = &mut accounts.iter();

    let payer_account = next_account_info(account_info_iter)?;
    if !payer_account.is_signer {
        return Err(TokenDeployerError::Unauthorized.into());
    }

    let token_mint_account = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;
    let quote_token_account = next_account_info(account_info_iter)?;
    let pool_token_account = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let amm_program = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let rent_sysvar = next_account_info(account_info_iter)?;

    msg!("This would integrate with Raydium or other AMM here");
    msg!("For this example, we're just logging the intent");
    msg!("Token amount: {}", token_amount);
    msg!("Quote amount: {}", quote_amount);

    // In a real implementation, this would call Raydium's create pool and add liquidity methods
    // For now, we're just simulating success

    Ok(())
} 