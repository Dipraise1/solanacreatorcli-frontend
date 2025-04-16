use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    system_program,
    sysvar,
};

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub struct TokenParams {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub initial_supply: u64,
    pub image_url: String,
    pub twitter_url: String,
    pub telegram_url: String,
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub enum TokenDeployerInstruction {
    /// Create a new token
    /// 
    /// Accounts:
    /// 0. `[signer, writable]` Payer/Authority
    /// 1. `[writable]` Token mint account (to be created)
    /// 2. `[writable]` Token account (to receive initial supply)
    /// 3. `[]` Token program
    /// 4. `[]` System program
    /// 5. `[]` Rent sysvar
    CreateToken(TokenParams),

    /// Add token to liquidity pool (optional)
    /// 
    /// Accounts:
    /// 0. `[signer, writable]` Payer/Authority
    /// 1. `[]` Token mint account
    /// 2. `[writable]` Payer's token account
    /// 3. `[writable]` Quote token account (e.g. USDC)
    /// 4. `[writable]` Pool token account (to be created)
    /// 5. `[]` Token program
    /// 6. `[]` AMM program (e.g. Raydium)
    /// 7. `[]` System program
    /// 8. `[]` Rent sysvar
    AddLiquidity {
        token_amount: u64,
        quote_amount: u64,
    },
}

impl TokenDeployerInstruction {
    pub fn create_token(
        program_id: &Pubkey,
        payer: &Pubkey,
        mint: &Pubkey,
        token_account: &Pubkey,
        token_params: TokenParams,
    ) -> Instruction {
        let accounts = vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(*mint, false),
            AccountMeta::new(*token_account, false),
            AccountMeta::new(spl_token::id(), false),
            AccountMeta::new(system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ];

        let data = TokenDeployerInstruction::CreateToken(token_params).try_to_vec().unwrap();

        Instruction {
            program_id: *program_id,
            accounts,
            data,
        }
    }

    pub fn add_liquidity(
        program_id: &Pubkey,
        payer: &Pubkey,
        mint: &Pubkey,
        token_account: &Pubkey,
        quote_token_account: &Pubkey,
        pool_token_account: &Pubkey,
        amm_program_id: &Pubkey,
        token_amount: u64,
        quote_amount: u64,
    ) -> Instruction {
        let accounts = vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new_readonly(*mint, false),
            AccountMeta::new(*token_account, false),
            AccountMeta::new(*quote_token_account, false),
            AccountMeta::new(*pool_token_account, false),
            AccountMeta::new(spl_token::id(), false),
            AccountMeta::new(*amm_program_id, false),
            AccountMeta::new(system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ];

        let data = TokenDeployerInstruction::AddLiquidity {
            token_amount,
            quote_amount,
        }
        .try_to_vec()
        .unwrap();

        Instruction {
            program_id: *program_id,
            accounts,
            data,
        }
    }
} 