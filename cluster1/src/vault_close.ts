import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@project-serum/anchor";
import { WbaVault, IDL } from "../programs/wba_vault";
import wallet from "../wba-wallet.json";
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

const closeVaultState = new PublicKey(
  "HMEbWDGeENF5g3pothkiQefp8mTm7QA8szSAB9CHmqJp"
);

(async () => {
  try {
    const signature = await program.methods
      .closeAccount()
      .accounts({
        owner: keypair.publicKey,
        vaultState,
        systemProgram: SystemProgram.programId,
        closeVaultState: closeVaultState,
      })
      .signers([keypair])
      .rpc();
    console.log(
      `Close success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
