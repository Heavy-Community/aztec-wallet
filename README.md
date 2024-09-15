# aztec-wallet

## Overview

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

this will compile each contract.

- to generate the ABI artifacts, run (_again for each contract_)

        aztec codegen target/ -o ../../../artifacts/

6.  Return back to the rooot directory and execute `yarn install` to install all the needed dependencies.
7.  Now execute this command (_in the root directory_) to deploy the token contract which will generate `accounts.json` file that can be later on used by the PXE.

        node deploy.js

8.  Finally, to run the programs in the localhost run: `yarn dev`
