import wallet from "./wallet/wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createBundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import bs58 from "bs58";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");
const bundlrUploader = createBundlrUploader(umi);

const base58PrivateKey = wallet;
const buffer = bs58.decode(base58PrivateKey);
const uint8ArrayPrivateKey = new Uint8Array(buffer);

const keypair = umi.eddsa.createKeypairFromSecretKey(uint8ArrayPrivateKey);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

    const image =
      "https://arweave.net/aLEG74Dh_Sk1ufcOZ0WkETjS3HzeNvkKyaamG5su-Kg";
    const metadata = {
      name: "RUGME",
      symbol: "RME",
      description: "The world's first rug-proof rug.",
      image,
      attributes: [
        {
          trait_type: "Background",
          value: "White",
        },
        {
          trait_type: "Rarity",
          value: "We're so back",
        },
        {
          trait_type: "Color",
          value: "Tony Hawk's Pro Skater 2",
        },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: image,
          },
        ],
      },
      creators: [],
    };
    const myUri = await bundlrUploader.uploadJson(metadata);
    console.log("Your NFT metadata URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
