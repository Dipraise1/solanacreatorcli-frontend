use solana_program::{
    msg,
    program_error::ProgramError,
};
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum TokenDeployerError {
    #[error("Invalid instruction")]
    InvalidInstruction,
    
    #[error("Unauthorized")]
    Unauthorized,

    #[error("Invalid token parameters")]
    InvalidTokenParameters,

    #[error("Invalid mint account")]
    InvalidMintAccount,

    #[error("Token creation failed")]
    TokenCreationFailed,

    #[error("Liquidity pool creation failed")]
    LiquidityPoolCreationFailed,
}

impl From<TokenDeployerError> for ProgramError {
    fn from(e: TokenDeployerError) -> Self {
        msg!("Error: {}", e);
        ProgramError::Custom(e as u32)
    }
} 