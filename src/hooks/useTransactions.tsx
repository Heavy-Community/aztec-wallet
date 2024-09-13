import { getDeployedTestAccountsWallets } from "@aztec/accounts/testing";
import {
  AccountWalletWithSecretKey,
  AztecAddress,
  createPXEClient,
} from "@aztec/aztec.js";

import token from "../../addresses.json";
import { TokenContract } from "@aztec/noir-contracts.js/Token";
import React, { useState } from "react";

export function CreateTransaction() {
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [wait, setWait] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );

  const { PXE_URL = "http://localhost:8080" } = process.env;
  const sendTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!sender || !recipient || !description) {
      alert("Please fill in all fields");
      return;
    }

    setWait(true); // Disable the button while transaction is in progress
    try {
      const pxe = createPXEClient(PXE_URL);
      const accounts: AccountWalletWithSecretKey[] =
        await getDeployedTestAccountsWallets(pxe);

      // Create the contract abstraction and link it to accounts[0] for future signing
      const tokenContract = await TokenContract.at(
        AztecAddress.fromString(token.token),
        accounts[0]
      );

      const tx = await tokenContract.methods
        .transfer(AztecAddress.fromString(recipient), amount as any)
        .send()
        .wait();

      console.log("transaction is:", tx);

      // Simulate delay (you should replace this with your actual API or transaction handling code)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update the transaction status (success message)
      setTransactionStatus(
        `Transaction successful from ${sender} to ${recipient}.`
      );
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStatus("Transaction failed. Please try again.");
    } finally {
      setWait(false); // Enable the button again
    }
  };

  return {
    sendTransaction,
    amount,
    sender,
    recipient,
    description,
    wait,
    setAmount,
    setSender,
    setRecipient,
    setDescription,
    setWait,
    setTransactionStatus,
    transactionStatus,
  };
}
