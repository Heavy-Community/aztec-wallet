import {
  AccountContract,
  AuthWitness,
  AuthWitnessProvider,
  CompleteAddress,
  Contract,
  ContractArtifact,
  ContractInstanceWithAddress,
  createPXEClient,
  Fr,
  GrumpkinScalar,
  NodeInfo,
  Schnorr,
  waitForPXE,
  Wallet,
} from "@aztec/aztec.js";
import { useState } from "react";
import { deployerEnv } from "../config";
import { toast } from "react-toastify";
import { SchnorrHardcodedAccountContract } from "../../artifacts/SchnorrHardcodedAccount";
import { AccountInterface } from "@aztec/aztec.js/account";
import { DefaultAccountInterface } from "@aztec/accounts/defaults";

const PRIVATE_KEY = GrumpkinScalar.fromString(
  "0xd35d743ac0dfe3d6dbe6be8c877cb524a00ab1e3d52d7bada095dfc8894ccfa"
);

class SchnorrAccountContract
  extends SchnorrHardcodedAccountContract
  implements AccountContract
{
  constructor(
    private privateKey = PRIVATE_KEY,
    wallet: Wallet,
    instance: ContractInstanceWithAddress
  ) {
    super(instance, wallet);
  }

  getContractArtifact(): ContractArtifact {
    return this.artifact;
  }

  getInterface(address: CompleteAddress, nodeInfo: NodeInfo): AccountInterface {
    return new DefaultAccountInterface(
      this.getAuthWitnessProvider(address),
      address,
      nodeInfo
    );
  }

  getDeploymentArgs(): any[] | undefined {
    return undefined;
  }

  getAuthWitnessProvider(address: CompleteAddress): AuthWitnessProvider {
    const privateKey = this.privateKey;
    return {
      createAuthWit(messageHash: Fr): Promise<AuthWitness> {
        const signer = new Schnorr();
        const signature = signer.constructSignature(
          messageHash.toBuffer(),
          privateKey
        );
        return Promise.resolve(
          new AuthWitness(messageHash, [...signature.toBuffer()])
        );
      },
    };
  }
}

const setupSandbox = async () => {
  const { PXE_URL = "http://localhost:8080" } = process.env;
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  return pxe;
};

export function useSchnorr() {
  const [wait, setWait] = useState(false);
  const [contract, setContract] = useState<Contract | undefined>();
  const [new_account_addres, setNewAccountAddress] = useState<string | null>(
    null
  );
  const [addresses, setAddresses] = useState<string[]>([]); // Array to store all addresses

  const createSchnorrAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWait(true);

    try {
      // const pxe = await setupSandbox();
      const salt = Fr.random();
      const wallet = await deployerEnv.getWallet();
      const deployment_tx = SchnorrAccountContract.deploy(wallet).send({
        contractAddressSalt: salt,
      });

      const contract = await toast.promise(deployment_tx.deployed(), {
        pending: "Deploying contract...",
        success: {
          render: ({ data }) => `Address: ${data.address}`,
        },
        error: "Error deploying contract",
      });

      const accountAddressStr = (
        await deployment_tx.deployed()
      ).address.toString();

      // let k = await pxe.registerAccount(salt, contract.partialAddress);
      // // console.log("k is: ", k);
      // // console.log("contract.partialAddress is: ", contract.partialAddress);

      setNewAccountAddress(accountAddressStr);
      setAddresses((prevAddresses) => [...prevAddresses, accountAddressStr]); // Add new address to the array
      setContract(contract);

      console.log("New account's address: ", accountAddressStr);
      console.log("addresses are: ", addresses);
    } catch (error) {
      console.error("Error creating account: ", error);
    } finally {
      setWait(false);
    }
  };

  return {
    createSchnorrAccount,
    contract,
    wait,
    new_account_addres,
    addresses,
  };
}
