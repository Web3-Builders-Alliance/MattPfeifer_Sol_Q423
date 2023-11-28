// Import necessary libraries
import { PublicKey, Keypair } from "@solana/web3.js";
import wallet from "./wallet/wba-wallet.json";
import bs58 from "bs58";

// Import Metaplex libraries
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";

// umi = universal metaplex interface
const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

const base58PrivateKey = wallet;
const buffer = bs58.decode(base58PrivateKey);
const uint8ArrayPrivateKey = new Uint8Array(buffer);

const keypair = umi.eddsa.createKeypairFromSecretKey(uint8ArrayPrivateKey);
const signer = createSignerFromKeypair(umi, keypair);

// sets the signer identity in UMI to the created signer
umi.use(signerIdentity(signer));

// Define our Mint address
const mint = new PublicKey("2QEBdYy8SKz6LaeWP2o2CHPQ1Piv7F9FKQV4vxLKTPFf");

// Add the Token Metadata Program
const token_metadata_program_id = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Create PDA for token metadata
const seeds = [
  Buffer.from("metadata"),
  token_metadata_program_id.toBuffer(),
  mint.toBuffer(),
];

// Find program address
const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(
  seeds,
  token_metadata_program_id
);

(async () => {
  try {
    let tx = createMetadataAccountV3(umi, {
      //accounts
      metadata: publicKey(metadata_pda.toString()), // The metadata account's public key
      mint: publicKey(mint.toString()), // The mint's public key
      mintAuthority: signer, // The signer who has the authority to mint tokens
      payer: signer, // The signer who will pay for the transaction
      updateAuthority: keypair.publicKey, // The public key of the account that has the authority to update the metadata
      data: {
        // The metadata to be stored
        name: "Degen Picks Token", // The name of the token
        symbol: "DPP", // The symbol of the token
        uri: "example_uri.com", // The URI where the metadata is stored
        sellerFeeBasisPoints: 0, // The fee to be paid to the seller, in basis points
        creators: null, // The creators of the token
        collection: null, // The collection to which the token belongs
        uses: null, // The uses of the token
      },
      isMutable: true, // Whether the metadata can be updated
      collectionDetails: null, // The details of the collection to which the token belongs
    });

    // Send and confirm transaction
    let result = await tx.sendAndConfirm(umi);
    console.log(result.signature);

    // Deserialize signature
    const signature = base58.deserialize(result.signature);
    console.log(signature[0]);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
