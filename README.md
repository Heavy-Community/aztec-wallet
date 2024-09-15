# aztec-wallet

## Overview

BLS12-381 – (Work in progress) A curve for pairing-based cryptography, commonly used in multi-signature schemes.
ECDSA (Ethereum's Curve) – The elliptic curve used by Ethereum, ensuring compatibility with Ethereum-based applications.
Schnorr – Known for its efficient and secure signature scheme, providing enhanced privacy features.

#### BabyJubJub

Structure of programs and smart contracts related to the BabyJubJub elliptic curve

```
src
├── contracts/
│   ├── babyjubjub_public_key_note/ // Creates, stores, de/serialize and computes nullifier of BabyJubJub public key
│   │   ├── src/
│   │   │    └── lib.nr
│   │   └── Nargo.toml
│   │
│   ├── babyjubjub_account/ // Main entrypoint of the BabyJubJub account, verifies its implementation.
│   │   ├── src/
│   │   │    └── main.nr
│   │   └── Nargo.toml
│   │
├── accounts/
│   ├── baby_jubjub/
│   │   ├── interface/
│   │   │    └── signature.ts
│   │   ├── account_contract.ts // Authenticates transactions with BabyJubJub signatures verified
│   │   │                       // against a public key in an immutable encrypted note.
│   │   │
│   │   ├── index.ts // BabyJubjub signature construction and helper operations.
│   │   └── signature.ts // BabyJubJub signature used for transactions.
│   │
│   └── babyjubjub.ts // Creates an Account Manager using a BabyJubJub key for authentication and retrieves a wallet with BabyJubJub signatures.
│
├── hooks/
│   └── useBabyJubJub.tsx
```

A lightweight elliptic curve optimized for zk-SNARKs, offering privacy and scalability.

<h3>The noir smart contracts implementation is practically ready but needs barretenberg cpp backend.</h3>

> [!IMPORTANT]

#### Bls12381

#### ecdsa

#### schnorr

## Installation

### Prerequisites

You need two global dependencies in your machine:

1.  Node.js >= v18 (recommend installing with nvm)
2.  Docker (visit this [page of the Docker docs](https://docs.docker.com/get-started/get-docker/) on how to install it)
3.  To install aztec's tooling, including aztec's sandbox, aztec-cli, aztec-nargo and aztec-up, run:

        bash -i <(curl -s install.aztec.network)

4.  Once these have been installed, to start the sandbox, run:

        aztec start --sandbox

5.  Go to the `src/contracts` to compile and generate contracts ABI artifacts. - go to the `babyjubjub_account`, `ecdsa_k_account` and `account_schnorr` directories respectively and execute

            aztec-nargo compile --silence-warnings

    dependencies
    this will compile each contract.

- to generate the ABI artifacts, run (_again for each contract_)

        aztec codegen target/ -o ../../../artifacts/

6.  Return back to the rooot directory and execute `yarn install` to install all the needed dependencies.
7.  Now execute this command (_in the root directory_) to deploy the token contract which will generate `accounts.json` file that can be later on used by the PXE.

        node deploy.js

8.  Finally, to run the programs in the localhost run: `yarn dev`
