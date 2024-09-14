import { AccountManager, AccountWallet, AztecAddress, Fr, PXE } from "@aztec/aztec.js";
import { BabyJubJubScalar } from "./baby jubjub";
import { Salt } from "@aztec/aztec.js/account";
import { BabyJubJubAccountContract } from "./baby jubjub/account_contract";
import { getWallet } from "@aztec/aztec.js/wallet";

/**
 * Creates an Account Manager that relies on a BabyJubJub signing key for authentication.
 * @param pxe - An PXE server instance.
 * @param secretKey - Secret key used to derive all the keystore keys.
 * @param signingPrivateKey - BabyJubJub key used for signing transactions.
 * @param salt - Deployment salt.
 */
export function getBabyJubJubAccount(
    pxe: PXE,
    secretKey: Fr,
    signingPrivateKey: BabyJubJubScalar,
    salt?: Salt,
): AccountManager {
    return new AccountManager(pxe, secretKey, new BabyJubJubAccountContract(signingPrivateKey), salt);
}

/**
 * Gets a wallet for an already registered account using BabyJubJub signatures.
 * @param pxe - An PXE server instance.
 * @param address - Address for the account.
 * @param signingPrivateKey - BabyJubJub key used for signing transactions.
 * @returns A wallet for this account that can be used to interact with a contract instance.
 */
export function getBabyJubJubWallet(
    pxe: PXE,
    address: AztecAddress,
    signingPrivateKey: BabyJubJubScalar,
): Promise<AccountWallet> {
    return getWallet(pxe, address, new BabyJubJubAccountContract(signingPrivateKey));
}