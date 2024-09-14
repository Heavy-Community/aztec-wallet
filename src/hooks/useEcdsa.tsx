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
  Fr,
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

const PRIVATE_KEY = GrumpkinScalar.fromString(
  "0xd35d743ac0dfe3d6dbe6be8c877cb524a00ab1e3d52d7bada095dfc8894ccfa"
).toBuffer();
const SIGNING_PUBLIC_KEY = new Ecdsa().computePublicKey(PRIVATE_KEY);

class ECDSAAccountContract
  extends EcdsaKAccountContract
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
        const signer = new Ecdsa();
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

// Convert a hex string to a byte array
function hexToBytes(hex: any) {
  let bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

export function useEcdsa() {
  const [wait_ecdsa, setWait] = useState(false);
  const [contract, setContract] = useState<Contract | undefined>();
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

      const deployment_tx = ECDSAAccountContract.deploy(
        wallet,
        SIGNING_PUBLIC_KEY.subarray(0, 32) as any,
        SIGNING_PUBLIC_KEY.subarray(32, 64) as any
      ).send({
        contractAddressSalt: salt,
      });

      // private key or imported instance.deploy() | instance.sign()
      // await pxe.registerAccount(, deployment_tx.instance.address);

      console.log(
        "deployment_tx.instance.address: ",
        deployment_tx.instance.address
      );
      console.log(
        "deployment_tx.instance.publicKeysHash: ",
        deployment_tx.instance.publicKeysHash
      );

      // Awaits the buffer that contains the hash
      // let buffer_hash = (await deployment_tx.getTxHash()).buffer;
      // console.log("buffer_hash", buffer_hash);

      // await wallet.createAuthWit(buffer_hash);

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
      // console.log("k is: ", k);
      // console.log("contract.partialAddress is: ", contract.partialAddress);

      setNewAccountAddress(accountAddressStr);
      setAddresses((prevAddresses) => [...prevAddresses, accountAddressStr]); // Add new address to the array
      setContract(contract);

      console.log("New account's address: ", accountAddressStr);
      console.log("addresses are: ", ecdsa_addresses);
    } catch (error) {
      console.error("Error creating account: ", error);
    } finally {
      setWait(false);
    }
  };

  return {
    createEcdsaAccount,
    contract,
    wait_ecdsa,
    new_account_addres,
    ecdsa_addresses,
  };
}
