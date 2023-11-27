import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import wallet from "../wba-wallet.json";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import bs58 from "bs58";

// base58 encoded private key
const base58PrivateKey = wallet;
const buffer = bs58.decode(base58PrivateKey);
const uint8ArrayPrivateKey = new Uint8Array(buffer);
const keypair = Keypair.fromSecretKey(uint8ArrayPrivateKey);

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("2QEBdYy8SKz6LaeWP2o2CHPQ1Piv7F9FKQV4vxLKTPFf");

// Recipient address
const to = new PublicKey("H1fnjEg9pobH5k74eb3nfDDThHfGganjuABABUeebpGf");

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromATA = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey,
      undefined,
      commitment
    );
    console.log(`Your ata is: ${fromATA.address.toBase58()}`);
    // Get the token account of the toWallet address, and if it does not exist, create it
    const toATA = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to,
      undefined,
      commitment
    );
    console.log(`Their ata is: ${toATA.address.toBase58()}`);
    // Transfer the new token to the "toTokenAccount" we just created
    const signature = await transfer(
      connection,
      keypair,
      fromATA.address,
      toATA.address,
      keypair.publicKey,
      10
    );

    console.log(`Your transfer txid: ${signature}`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
