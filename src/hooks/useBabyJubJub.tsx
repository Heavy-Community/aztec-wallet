import {
  AccountWallet,
  CompleteAddress,
  Contract,
  Fr,
  PXE,
} from "@aztec/aztec.js";
import { useState } from "react";
import { deriveSigningKey, setupSandbox } from "./utils";
import { getInitialTestAccountsWallets } from "@aztec/accounts/testing";
import { getBabyJubJubAccount } from "../accounts/babyjubjub";
import { BabyJubJubAccountContract } from "../../artifacts/BabyJubJubAccount";

export function useBabyJubJub() {
  const [wait_babyjub, setWaitBabyJub] = useState(false);
  const [contract, setContract] = useState<Contract | undefined>();
  const [new_account_addres, setNewAccountAddress] = useState<string | null>(
    null
  );
  const [bjj_addresses, setBjjAddresses] = useState<string[]>([]); // Array to store all bjj addresses

  const createBabyJubJubAccount = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    let pxe: PXE;
    let wallets: AccountWallet[] = [];
    let accounts: CompleteAddress[] = [];

    e.preventDefault();
    setWaitBabyJub(true);

    try {
      pxe = await setupSandbox();
      wallets = await getInitialTestAccountsWallets(pxe);
      console.log(wallets[0]);

      let secretKey = Fr.random();
      let salt = Fr.random();

      let bjjAccount = await getBabyJubJubAccount(
        pxe,
        secretKey,
        deriveSigningKey(secretKey),
        salt
      );

      console.log("bjjAccount", bjjAccount);

      let tx = await bjjAccount.deploy();
      console.log("tx", tx);

      let wallet = await bjjAccount.register();
      console.log("wallet", wallet);

      const { address, publicKeys, partialAddress } =
        bjjAccount.getCompleteAddress();

      console.log(Array.from(publicKeys.masterNullifierPublicKey.x.toBuffer()));
      console.log(Array.from(publicKeys.masterNullifierPublicKey.y.toBuffer()));

      await BabyJubJubAccountContract.deploy(
        wallets[0],
        Array.from(publicKeys.masterNullifierPublicKey.x.toBuffer()),
        Array.from(publicKeys.masterNullifierPublicKey.y.toBuffer())
      )
        .send()
        .deployed();
    } catch (error) {
      console.error("Error creating account: ", error);
    } finally {
      setWaitBabyJub(false);
    }
  };

  return {
    createBabyJubJubAccount,
    wait_babyjub,
  };
}
