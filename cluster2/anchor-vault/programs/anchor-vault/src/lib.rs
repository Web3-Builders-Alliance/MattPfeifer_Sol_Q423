use anchor_lang::prelude::*;

declare_id!("3Q9kE4eqZXkKd8p6WQNjjAZf4x3TJ53joKVumW1acp3V");

#[program]
pub mod anchor_vault {
    use anchor_lang::system_program::{Transfer, transfer};

    use super::*;

    pub fn deposit(ctx: Context<Vault>, lamports: u64) -> Result<()> {
        let accounts = Transfer{
            from: ctx.accounts.owner.to_account_info(),
            to: ctx.accounts.vault.to_account_info()
        };

        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), accounts);

        transfer(cpi_ctx, lamports)
    }

    pub fn close(ctx: Context<Vault>) -> Result<()> {
        let accounts = Transfer{
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.owner.to_account_info()
        };

        let signer_seeds: [&[&[u8]]; 1] = [&[b"vault", &ctx.accounts.owner.to_account_info().key.as_ref(), &[ctx.bumps.vault]]];
        
        let cpi_ctx = CpiContext::new_with_signer(ctx.accounts.system_program.to_account_info(), accounts, &signer_seeds);


        transfer(cpi_ctx, ctx.accounts.vault.lamports())
    }



}

#[derive(Accounts)]
pub struct Vault<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut, 
        seeds = [b"vault", owner.key().as_ref()],
        // don't know the bump yet so ask anchor to calculate it
        bump
    )]
    vault: SystemAccount<'info>,
    system_program: Program<'info, System>,
}
