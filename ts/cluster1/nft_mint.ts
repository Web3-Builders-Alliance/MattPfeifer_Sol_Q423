import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json";
import bs58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

// base58 encoded private key
const base58PrivateKey = wallet;
// decode the base58 private key to a buffer
const buffer = bs58.decode(base58PrivateKey);
// convert the buffer to a Uint8Array
const uint8ArrayPrivateKey = new Uint8Array(buffer);

let keypair = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(uint8ArrayPrivateKey)
);
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

(async () => {
  let tx = createNft(umi, {
    mint,
    uri: "https://arweave.net/SdkvreXsFQPBQP2R5iLJHlUb2rIa3tqJCwgF7EFwRHQ",
    name: "RugMe",
    symbol: "RME",
    sellerFeeBasisPoints: percentAmount(10),
  });
  let result = await tx.sendAndConfirm(umi);
  const signature = bs58.encode(result.signature);

  console.log(
    `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
  );

  console.log("Mint Address: ", mint.publicKey);
})();
