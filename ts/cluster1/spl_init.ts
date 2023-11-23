import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import wallet from "../wba-wallet.json";
import bs58 from "bs58";

// base58 encoded private key
const base58PrivateKey = wallet;
// decode the base58 private key to a buffer
const buffer = bs58.decode(base58PrivateKey);
// convert the buffer to a Uint8Array
const uint8ArrayPrivateKey = new Uint8Array(buffer);

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(uint8ArrayPrivateKey));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
  try {
    const mint = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      6
    );
    console.log(`Mint address: ${mint.toBase58()}`);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
