use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub struct TokenInfo {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub mint: Pubkey,
    pub authority: Pubkey,
    pub initial_supply: u64,
    pub image_url: String,
    pub twitter_url: String,
    pub telegram_url: String,
    pub timestamp: i64,
}

impl TokenInfo {
    pub fn new(
        name: String,
        symbol: String,
        decimals: u8,
        mint: Pubkey,
        authority: Pubkey,
        initial_supply: u64,
        image_url: String,
        twitter_url: String,
        telegram_url: String,
        timestamp: i64,
    ) -> Self {
        Self {
            name,
            symbol,
            decimals,
            mint,
            authority,
            initial_supply,
            image_url,
            twitter_url,
            telegram_url,
            timestamp,
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub struct LiquidityPool {
    pub token_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub pool_mint: Pubkey,
    pub authority: Pubkey,
    pub token_amount: u64,
    pub quote_amount: u64,
    pub timestamp: i64,
}

impl LiquidityPool {
    pub fn new(
        token_mint: Pubkey,
        quote_mint: Pubkey,
        pool_mint: Pubkey,
        authority: Pubkey,
        token_amount: u64,
        quote_amount: u64,
        timestamp: i64,
    ) -> Self {
        Self {
            token_mint,
            quote_mint,
            pool_mint,
            authority,
            token_amount,
            quote_amount,
            timestamp,
        }
    }
} 