import { getInitialTestAccountsWallets } from "@aztec/accounts/testing";
import {
  computeSecretHash,
  Contract,
  createPXEClient,
  ExtendedNote,
  Fr,
  loadContractArtifact,
  Note,
} from "@aztec/aztec.js";
import TokenContractJson from "@aztec/noir-contracts.js/artifacts/token_contract-Token" assert { type: "json" };
import { TokenContract } from "@aztec/noir-contracts.js/Token";

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";

const { PXE_URL = "http://localhost:8080" } = process.env;

async function main() {
  const pxe = createPXEClient(PXE_URL);
  const [ownerWallet, helperNonOwnerWallet] =
    await getInitialTestAccountsWallets(pxe);
  const ownerAddress = ownerWallet.getCompleteAddress();
  const helperNonOwnerAddress = helperNonOwnerWallet.getCompleteAddress();

  const token = await TokenContract.deploy(
    ownerWallet,
    ownerWallet.getAddress(),
    "Aztec Network Token",
    "AZT",
    18
  )
    .send()
    .deployed();

  // Create the contract abstraction and link it to On's wallet for future signing
  const tokenContractOwner = await TokenContract.at(token.address, ownerWallet);

  // Create a secret and a corresponding hash that will be used to mint funds privately
  const ownerSecret = Fr.random();
  const ownerSecretHash = computeSecretHash(ownerSecret);

  const initialSupply = 1_000_000n;
  // Mint the initial supply privately "to secret hash"
  const receipt = await tokenContractOwner.methods
    .mint_private(initialSupply, ownerSecretHash)
    .send()
    .wait();

  // Add the newly created "pending shield" note to PXE
  const note = new Note([new Fr(initialSupply), ownerSecretHash]);
  await ownerWallet.addNote(
    new ExtendedNote(
      note,
      ownerWallet.getAddress(),
      token.address,
      TokenContract.storage.pending_shields.slot,
      TokenContract.notes.TransparentNote.id,
      receipt.txHash
    )
  );

  // Make the tokens spendable by redeeming them using the secret (converts the "pending shield note" created above
  // to a "token note")
  await tokenContractOwner.methods
    .redeem_shield(ownerWallet.getAddress(), initialSupply, ownerSecret)
    .send()
    .wait();

  console.log(`Token deployed at ${token.address.toString()}`);

  const addresses = {
    token: token.address.toString(),
    owner: ownerAddress,
    helperNonOwner: helperNonOwnerAddress,
  };
  writeFileSync("addresses.json", JSON.stringify(addresses, null, 2));
}

// Execute main only if run directly
if (
  process.argv[1].replace(/\/index\.m?js$/, "") ===
  fileURLToPath(import.meta.url).replace(/\/index\.m?js$/, "")
) {
  main().catch((err) => {
    console.error(`Error in deployment script: ${err}`);
    process.exit(1);
  });
}

export { main as deploy };
