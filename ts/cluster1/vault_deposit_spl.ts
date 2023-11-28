import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@project-serum/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "./wallet/wba-wallet.json";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import bs58 from "bs58";

// Import our keypair from the wallet file
const base58PrivateKey = wallet;
// decode the base58 private key to a buffer
const buffer = bs58.decode(base58PrivateKey);
// convert the buffer to a Uint8Array
const uint8ArrayPrivateKey = new Uint8Array(buffer);
const keypair = Keypair.fromSecretKey(new Uint8Array(uint8ArrayPrivateKey));

// Commitment
const commitment: Commitment = "confirmed";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider
);

// Grab initialized account
const vaultState = new PublicKey(
  "HMEbWDGeENF5g3pothkiQefp8mTm7QA8szSAB9CHmqJp"
);
console.log(`Vault public key: ${vaultState.toBase58()}`);

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState
const vaultAuthKeys = [Buffer.from("auth"), vaultState.toBuffer()];
const [vaultAuth, _bump] = PublicKey.findProgramAddressSync(
  vaultAuthKeys,
  program.programId
);

// Create the vault key
// Seeds are "vault", vaultAuth
const vaultKeys = [Buffer.from("vault"), vaultAuth.toBuffer()];
const [vaultKey, _bump2] = PublicKey.findProgramAddressSync(
  vaultKeys,
  program.programId
);

const token_decimals = 1_000_000_000;

// Define our Mint address
const mint = new PublicKey("2QEBdYy8SKz6LaeWP2o2CHPQ1Piv7F9FKQV4vxLKTPFf");

// Execute our enrollment transaction
(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const ownerAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey,
      undefined,
      commitment
    );
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth,
      true,
      commitment
    );
    const signature = await program.methods
      .depositSpl(new BN(100 * token_decimals))
      .accounts({
        owner: keypair.publicKey,
        vaultState,
        vaultAuth,
        systemProgram: SystemProgram.programId,
        ownerAta: ownerAta.address,
        vaultAta: vaultAta.address,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([keypair])
      .rpc();
    console.log(
      `Deposit SPL success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
