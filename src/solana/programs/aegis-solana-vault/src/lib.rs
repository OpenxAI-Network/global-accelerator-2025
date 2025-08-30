use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("AegisVaultSol1111111111111111111111111111111");

#[program]
pub mod aegis_solana_vault {
    use super::*;

    /// Initialize the vault with initial parameters
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        chain_id: String,
        chain_name: String,
        zeta_gateway: Pubkey,
        universal_lending: Pubkey,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.chain_id = chain_id;
        vault.chain_name = chain_name;
        vault.zeta_gateway = zeta_gateway;
        vault.universal_lending = universal_lending;
        vault.total_deposited = 0;
        vault.total_borrowed = 0;
        vault.available_liquidity = 0;
        vault.is_active = true;
        vault.bump = *ctx.bumps.get("vault").unwrap();
        
        msg!("Vault initialized for chain: {}", vault.chain_name);
        Ok(())
    }

    /// Deposit SOL into the vault for cross-chain lending
    pub fn deposit_sol(
        ctx: Context<DepositSol>,
        amount: u64,
        lock_period: i64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_deposit = &mut ctx.accounts.user_deposit;
        
        require!(vault.is_active, AegisError::VaultInactive);
        require!(amount > 0, AegisError::InvalidAmount);
        require!(amount >= MIN_DEPOSIT_AMOUNT, AegisError::AmountBelowMinimum);
        require!(amount <= MAX_DEPOSIT_AMOUNT, AegisError::AmountAboveMaximum);
        
        // Transfer SOL from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, amount)?;
        
        // Update vault state
        vault.total_deposited = vault.total_deposited.checked_add(amount)
            .ok_or(AegisError::Overflow)?;
        vault.available_liquidity = vault.available_liquidity.checked_add(amount)
            .ok_or(AegisError::Overflow)?;
        
        // Update user deposit
        user_deposit.user = ctx.accounts.user.key();
        user_deposit.asset_symbol = "SOL".to_string();
        user_deposit.amount = user_deposit.amount.checked_add(amount)
            .ok_or(AegisError::Overflow)?;
        user_deposit.timestamp = Clock::get()?.unix_timestamp;
        user_deposit.is_locked = true;
        user_deposit.unlock_time = Clock::get()?.unix_timestamp.checked_add(lock_period)
            .ok_or(AegisError::Overflow)?;
        user_deposit.bump = *ctx.bumps.get("user_deposit").unwrap();
        
        // Emit cross-chain message event (will be picked up by off-chain relayer)
        emit!(CrossChainMessageSent {
            message_id: vault.total_deposited,
            from_chain: vault.chain_id.clone(),
            to_chain: "zeta".to_string(),
            message_type: "DEPOSIT".to_string(),
            user: ctx.accounts.user.key(),
            asset_symbol: "SOL".to_string(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("SOL deposited: {} lamports, locked until: {}", amount, user_deposit.unlock_time);
        Ok(())
    }

    /// Withdraw SOL from the vault (after lock period)
    pub fn withdraw_sol(
        ctx: Context<WithdrawSol>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_deposit = &mut ctx.accounts.user_deposit;
        
        require!(vault.is_active, AegisError::VaultInactive);
        require!(amount > 0, AegisError::InvalidAmount);
        require!(user_deposit.amount >= amount, AegisError::InsufficientDeposit);
        require!(user_deposit.is_locked, AegisError::DepositNotLocked);
        require!(
            Clock::get()?.unix_timestamp >= user_deposit.unlock_time,
            AegisError::LockPeriodNotExpired
        );
        require!(vault.available_liquidity >= amount, AegisError::InsufficientVaultLiquidity);
        
        // Update vault state
        vault.total_deposited = vault.total_deposited.checked_sub(amount)
            .ok_or(AegisError::Overflow)?;
        vault.available_liquidity = vault.available_liquidity.checked_sub(amount)
            .ok_or(AegisError::Overflow)?;
        
        // Update user deposit
        user_deposit.amount = user_deposit.amount.checked_sub(amount)
            .ok_or(AegisError::Overflow)?;
        if user_deposit.amount == 0 {
            user_deposit.is_locked = false;
        }
        
        // Transfer SOL back to user
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: vault.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, amount)?;
        
        // Emit cross-chain message event
        emit!(CrossChainMessageSent {
            message_id: vault.total_deposited,
            from_chain: vault.chain_id.clone(),
            to_chain: "zeta".to_string(),
            message_type: "WITHDRAW".to_string(),
            user: ctx.accounts.user.key(),
            asset_symbol: "SOL".to_string(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("SOL withdrawn: {} lamports", amount);
        Ok(())
    }

    /// Borrow liquidity from the vault (called by ZetaChain Gateway)
    pub fn borrow_liquidity(
        ctx: Context<BorrowLiquidity>,
        borrower: Pubkey,
        asset_symbol: String,
        amount: u64,
        interest_rate: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        require!(vault.is_active, AegisError::VaultInactive);
        require!(msg.sender.key() == vault.zeta_gateway, AegisError::Unauthorized);
        require!(amount > 0, AegisError::InvalidAmount);
        require!(vault.available_liquidity >= amount, AegisError::InsufficientVaultLiquidity);
        
        // Update vault state
        vault.total_borrowed = vault.total_borrowed.checked_add(amount)
            .ok_or(AegisError::Overflow)?;
        vault.available_liquidity = vault.available_liquidity.checked_sub(amount)
            .ok_or(AegisError::Overflow)?;
        
        // Transfer SOL to borrower
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.borrower_token_account.to_account_info(),
                authority: vault.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, amount)?;
        
        emit!(LiquidityBorrowed {
            borrower,
            asset_symbol,
            amount,
            interest_rate,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Liquidity borrowed: {} lamports by {}", amount, borrower);
        Ok(())
    }

    /// Repay borrowed liquidity
    pub fn repay_liquidity(
        ctx: Context<RepayLiquidity>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        require!(vault.is_active, AegisError::VaultInactive);
        require!(amount > 0, AegisError::InvalidAmount);
        
        // Transfer SOL from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, amount)?;
        
        // Update vault state
        vault.total_borrowed = vault.total_borrowed.checked_sub(amount)
            .unwrap_or(0);
        vault.available_liquidity = vault.available_liquidity.checked_add(amount)
            .ok_or(AegisError::Overflow)?;
        
        // Emit cross-chain message event
        emit!(CrossChainMessageSent {
            message_id: vault.total_deposited,
            from_chain: vault.chain_id.clone(),
            to_chain: "zeta".to_string(),
            message_type: "REPAY".to_string(),
            user: ctx.accounts.user.key(),
            asset_symbol: "SOL".to_string(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Liquidity repaid: {} lamports", amount);
        Ok(())
    }

    /// Receive cross-chain message from ZetaChain
    pub fn receive_cross_chain_message(
        ctx: Context<ReceiveCrossChainMessage>,
        from_chain: String,
        message_type: String,
        data: Vec<u8>,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        require!(msg.sender.key() == vault.zeta_gateway, AegisError::Unauthorized);
        
        // Process the message based on type
        match message_type.as_str() {
            "LOAN_APPROVAL" => {
                // Process loan approval from ZetaChain
                let (borrower, asset_symbol, amount, interest_rate) = 
                    decode_loan_approval_data(&data)?;
                
                // Call borrow function (would need to be restructured for this)
                msg!("Loan approval received for {}: {} {}", borrower, amount, asset_symbol);
            }
            "LIQUIDATION" => {
                // Process liquidation order from ZetaChain
                let (user, asset_symbol, amount) = decode_liquidation_data(&data)?;
                msg!("Liquidation order received for {}: {} {}", user, amount, asset_symbol);
            }
            _ => {
                msg!("Unknown message type: {}", message_type);
            }
        }
        
        emit!(CrossChainMessageReceived {
            message_id: vault.total_deposited,
            from_chain,
            to_chain: vault.chain_id.clone(),
            message_type,
            data,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Update vault parameters (admin only)
    pub fn update_vault_params(
        ctx: Context<UpdateVaultParams>,
        new_zeta_gateway: Option<Pubkey>,
        new_universal_lending: Option<Pubkey>,
        is_active: Option<bool>,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(ctx.accounts.authority.key() == vault.authority, AegisError::Unauthorized);
        
        if let Some(gateway) = new_zeta_gateway {
            vault.zeta_gateway = gateway;
        }
        if let Some(lending) = new_universal_lending {
            vault.universal_lending = lending;
        }
        if let Some(active) = is_active {
            vault.is_active = active;
        }
        
        msg!("Vault parameters updated");
        Ok(())
    }
}

// ============ ACCOUNT STRUCTURES ============

#[account]
pub struct Vault {
    pub authority: Pubkey,           // Vault admin
    pub chain_id: String,            // "solana"
    pub chain_name: String,          // "Solana"
    pub zeta_gateway: Pubkey,        // ZetaChain Gateway address
    pub universal_lending: Pubkey,   // ZetaChain Universal Lending contract
    pub total_deposited: u64,        // Total SOL deposited
    pub total_borrowed: u64,         // Total SOL borrowed
    pub available_liquidity: u64,    // Available SOL for borrowing
    pub is_active: bool,             // Vault status
    pub bump: u8,                    // PDA bump
}

#[account]
pub struct UserDeposit {
    pub user: Pubkey,                // User address
    pub asset_symbol: String,        // Asset symbol (SOL)
    pub amount: u64,                 // Deposited amount
    pub timestamp: i64,              // Deposit timestamp
    pub is_locked: bool,             // Lock status
    pub unlock_time: i64,            // Unlock timestamp
    pub bump: u8,                    // PDA bump
}

// ============ CONTEXT STRUCTURES ============

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump,
        constraint = vault.is_active @ AegisError::VaultInactive
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserDeposit::INIT_SPACE,
        seeds = [b"user_deposit", user.key().as_ref(), b"SOL"],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key()
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump,
        constraint = vault.is_active @ AegisError::VaultInactive
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        seeds = [b"user_deposit", user.key().as_ref(), b"SOL"],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key()
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key()
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BorrowLiquidity<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump,
        constraint = vault.is_active @ AegisError::VaultInactive
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        constraint = borrower_token_account.owner == borrower
    )]
    pub borrower_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key()
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub borrower: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RepayLiquidity<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump,
        constraint = vault.is_active @ AegisError::VaultInactive
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key()
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ReceiveCrossChainMessage<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    
    pub zeta_gateway: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateVaultParams<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    
    pub authority: Signer<'info>,
}

// ============ EVENTS ============

#[event]
pub struct CrossChainMessageSent {
    pub message_id: u64,
    pub from_chain: String,
    pub to_chain: String,
    pub message_type: String,
    pub user: Pubkey,
    pub asset_symbol: String,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct CrossChainMessageReceived {
    pub message_id: u64,
    pub from_chain: String,
    pub to_chain: String,
    pub message_type: String,
    pub data: Vec<u8>,
    pub timestamp: i64,
}

#[event]
pub struct LiquidityBorrowed {
    pub borrower: Pubkey,
    pub asset_symbol: String,
    pub amount: u64,
    pub interest_rate: u64,
    pub timestamp: i64,
}

// ============ CONSTANTS ============

const MIN_DEPOSIT_AMOUNT: u64 = 100_000_000; // 0.1 SOL in lamports
const MAX_DEPOSIT_AMOUNT: u64 = 1_000_000_000_000; // 1000 SOL in lamports

// ============ ERROR CODES ============

#[error_code]
pub enum AegisError {
    #[msg("Vault is not active")]
    VaultInactive,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Amount below minimum")]
    AmountBelowMinimum,
    #[msg("Amount above maximum")]
    AmountAboveMaximum,
    #[msg("Insufficient deposit")]
    InsufficientDeposit,
    #[msg("Deposit not locked")]
    DepositNotLocked,
    #[msg("Lock period not expired")]
    LockPeriodNotExpired,
    #[msg("Insufficient vault liquidity")]
    InsufficientVaultLiquidity,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Overflow occurred")]
    Overflow,
}

// ============ HELPER FUNCTIONS ============

fn decode_loan_approval_data(data: &[u8]) -> Result<(Pubkey, String, u64, u64)> {
    // Simple decoding for demo - in production would use proper serialization
    if data.len() < 32 + 4 + 8 + 8 {
        return err!(AegisError::InvalidAmount);
    }
    
    let borrower = Pubkey::new(&data[0..32]);
    let symbol_len = u32::from_le_bytes([data[32], data[33], data[34], data[35]]);
    let asset_symbol = String::from_utf8(data[36..36+symbol_len as usize].to_vec())
        .map_err(|_| AegisError::InvalidAmount)?;
    let amount = u64::from_le_bytes([
        data[36+symbol_len as usize], data[37+symbol_len as usize],
        data[38+symbol_len as usize], data[39+symbol_len as usize],
        data[40+symbol_len as usize], data[41+symbol_len as usize],
        data[42+symbol_len as usize], data[43+symbol_len as usize]
    ]);
    let interest_rate = u64::from_le_bytes([
        data[44+symbol_len as usize], data[45+symbol_len as usize],
        data[46+symbol_len as usize], data[47+symbol_len as usize],
        data[48+symbol_len as usize], data[49+symbol_len as usize],
        data[50+symbol_len as usize], data[51+symbol_len as usize]
    ]);
    
    Ok((borrower, asset_symbol, amount, interest_rate))
}

fn decode_liquidation_data(data: &[u8]) -> Result<(Pubkey, String, u64)> {
    // Simple decoding for demo - in production would use proper serialization
    if data.len() < 32 + 4 + 8 {
        return err!(AegisError::InvalidAmount);
    }
    
    let user = Pubkey::new(&data[0..32]);
    let symbol_len = u32::from_le_bytes([data[32], data[33], data[34], data[35]]);
    let asset_symbol = String::from_utf8(data[36..36+symbol_len as usize].to_vec())
        .map_err(|_| AegisError::InvalidAmount)?;
    let amount = u64::from_le_bytes([
        data[36+symbol_len as usize], data[37+symbol_len as usize],
        data[38+symbol_len as usize], data[39+symbol_len as usize],
        data[40+symbol_len as usize], data[41+symbol_len as usize],
        data[42+symbol_len as usize], data[43+symbol_len as usize]
    ]);
    
    Ok((user, asset_symbol, amount))
}
