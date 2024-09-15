# aztec-wallet

## Overview

<h3>The curves that are used to create the account abstractions are:</h3>

### BabyJubJub

A lightweight elliptic curve optimized for zk-SNARKs, offering privacy and scalability.
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

<h3>⚠️ The noir smart contracts implementation is practically ready but needs barretenberg cpp backend. ⚠️</h3>

> [!IMPORTANT]
> As shown in the structure above, there is an AztecJS implementation of the BabyJubJub signature verification and creation, the account creation with the help of `BarretenbergSync` from the `bb.js` library. That's why the deployment of the account created with the BabyJubJub curve isn't yet available because of the aforementioned reasons. But since it's using 64 bytes for signature and 32 bytes for the public key's coordinates which are the same as Schnorr's signature and public key coordinates respecitvely, we are using Schnorr's barretenberg cpp implementation for the sake of PoC.

### Bls12381

(Ongoing development) A curve for pairing-based cryptography, commonly used in multi-signature schemes.
Structure of programs and smart contracts related to the Bls12381 elliptic curve:

```
src
├── contracts/
│   ├── public_key_bls12_381_note/
│   │   │                          // Creates, stores, de/serialize and computes
│   │   │                          // nullifier of bls12381 public key.
│   │   │                          // Serialized to be compatible for the 254 bits field size.
│   │   ├── src/
│   │   │    └── lib.nr
│   │   └── Nargo.toml
│   │
│   ├── bls12_381_account/ // Main entrypoint of the Bls12381 account, verifies its implementation.
│   │   ├── src/
│   │   │    └── main.nr
│   │   └── Nargo.toml

```

<h4>The implementation of the bls curve library is compatible to be computed over the bn254 field</h4>

### schnorr

Schnorr – Known for its efficient and secure signature scheme, providing enhanced privacy features.

<h4>Successful account creation and deployment with hardcoded public key.</h4>

```
src
├── contracts/
│   ├── account_schnorr/
│   │   ├── src/
│   │   │    └── main.nr
│   │   └── Nargo.toml
│   ├── hooks/
│   │   └── useSchnorr.tsx
```

#### ecdsa

ECDSA (Ethereum's Curve) – The elliptic curve used by Ethereum, ensuring compatibility with Ethereum-based applications.

## Installation

### Prerequisites

You need two global dependencies in your machine:

1.  Node.js >= v18 (recommend installing with nvm)
2.  Docker (visit this [page of the Docker docs](https://docs.docker.com/get-started/get-docker/) on how to install it)
3.  To install aztec's tooling, including aztec's sandbox, aztec-cli, aztec-nargo and aztec-up, run:

        bash -i <(curl -s install.aztec.network)

4.  Once these have been installed, to start the sandbox, run:

        aztec start --sandbox

### Steps

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
