// Import necessary libraries
import { PublicKey } from "@solana/web3.js";
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
const mint = new PublicKey("B2odVw8GqPZFVoQLN1br3csiXVXT9GHCfp2mAFkBtXao");

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
    let myTransaction = createMetadataAccountV3(umi, {
      // accounts
      metadata: publicKey(metadata_pda.toString()),
      mint: publicKey(mint.toString()),
      mintAuthority: signer,
      // payer: myKeypairSigner,
      updateAuthority: keypair.publicKey,
      data: {
        name: "Trustless Engineering Credits",
        symbol: "TEC",
        uri: "https://solan.ai",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: true,
      collectionDetails: null,
    });

    let result = await myTransaction.sendAndConfirm(umi);
    const signature = base58.deserialize(result.signature);

    console.log(`tx hash: `, signature);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
