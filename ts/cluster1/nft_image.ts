import wallet from "./wallet/wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createBundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import { readFile } from "fs/promises";
import bs58 from "bs58";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");
const bundlrUploader = createBundlrUploader(umi);

// base58 encoded private key
const base58PrivateKey = wallet;
// decode the base58 private key to a buffer
const buffer = bs58.decode(base58PrivateKey);
// convert the buffer to a Uint8Array
const uint8ArrayPrivateKey = new Uint8Array(buffer);

let keypair = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(uint8ArrayPrivateKey)
);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const image = await readFile("./ts/cluster1/images/generug.png");
    const nft_image = createGenericFile(image, "RugMe.png");
    const [myUri] = await bundlrUploader.upload([nft_image]);
    console.log("Your image URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
