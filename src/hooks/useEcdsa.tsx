import {
  AccountContract,
  AccountWallet,
  AuthWitness,
  AuthWitnessProvider,
  CompleteAddress,
  Contract,
  ContractArtifact,
  ContractInstanceWithAddress,
  createPXEClient,
  Fq,
  Fr,
  Grumpkin,
  GrumpkinScalar,
  NodeInfo,
  waitForPXE,
  Wallet,
} from "@aztec/aztec.js";
import { useState } from "react";
import { deployerEnv } from "../config";
import { Ecdsa } from "@aztec/circuits.js/barretenberg";
import { toast } from "react-toastify";
import { EcdsaKAccountContract } from "../../artifacts/EcdsaKAccount";
import { AccountInterface } from "@aztec/aztec.js/account";
import { DefaultAccountInterface } from "@aztec/accounts/defaults";
import { setupSandbox } from "./utils";

const ecc_grumpkin = new Grumpkin();
const secretKey = GrumpkinScalar.random();
const PUBLIC_KEY = ecc_grumpkin.mul(Grumpkin.generator, secretKey);
const PUBLIC_KEY_X = bigIntToNumberArray(PUBLIC_KEY.x.toBigInt());
const PUBLIC_KEY_Y = bigIntToNumberArray(PUBLIC_KEY.y.toBigInt());

function bigIntToNumberArray(value: bigint): number[] {
  const hex = value.toString(16).padStart(64, "0");
  const result: number[] = [];
  for (let i = 0; i < 32; i++) {
    result.push(parseInt(hex.substr(i * 2, 2), 16));
  }
  return result;
}

export function useEcdsa() {
  const [wait_ecdsa, setWait] = useState(false);
  const [new_account_addres, setNewAccountAddress] = useState<string | null>(
    null
  );
  const [ecdsa_addresses, setAddresses] = useState<string[]>([]); // Array to store all addresses

  const createEcdsaAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWait(true);

    try {
      const pxe = await setupSandbox();
      const salt = Fr.random();
      const wallet = await deployerEnv.getWallet();

      const contract = await toast.promise(
        EcdsaKAccountContract.deploy(wallet, PUBLIC_KEY_X, PUBLIC_KEY_Y)
          .send()
          .wait(),
        {
          pending: "Deploying contract...",
          success: {
            render: ({ data }) => `Address: ${data.contract.address}`,
          },
          error: "Error deploying contract",
        }
      );
      await pxe.registerContract(contract.contract);
      let secretKeyFq = new Fr(new Fq(secretKey).toBigInt());
      await pxe.registerAccount(secretKeyFq, contract.contract.partialAddress);
      setNewAccountAddress(contract.contract.address.toString());
      setAddresses((prevAddresses) => [
        ...prevAddresses,
        contract.contract.address.toString(),
      ]);

      console.log(
        "New account's address: ",
        contract.contract.address.toString()
      );
    } catch (error) {
      console.error("Error creating account: ", error);
    } finally {
      setWait(false);
    }
  };

  return {
    createEcdsaAccount,
    wait_ecdsa,
    new_account_addres,
    ecdsa_addresses,
  };
}
