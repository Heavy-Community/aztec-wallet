import { DefaultAccountContract } from "@aztec/accounts/defaults";
import { BabyJubJub, BabyJubJubScalar } from ".";
import { AuthWitness, AuthWitnessProvider, CompleteAddress, ContractArtifact } from "@aztec/aztec.js";
import { type Fr } from '@aztec/foundation/fields';
import { BabyJubJubAccountContractArtifact } from "../../../artifacts/BabyJubJubAccount";
/**
 * Account contract that authenticates transactions using BabyJubJub signatures
 * verified against a BabyJubJub public key stored in an immutable encrypted note.
 */
export class BabyJubJubAccountContract extends DefaultAccountContract {
    constructor(private signingPrivateKey: BabyJubJubScalar) {
        super(BabyJubJubAccountContractArtifact as ContractArtifact);
    }

    getDeploymentArgs() {
        const signingPublicKey = new BabyJubJub().computePublicKey(this.signingPrivateKey);
        return [signingPublicKey.x, signingPublicKey.y];
    }

    getAuthWitnessProvider(_address: CompleteAddress): AuthWitnessProvider {
        return new BabyJubJubAuthWitnessProvider(this.signingPrivateKey);
    }
}

/** Creates auth witnesses using BabyJubJub signatures. */
class BabyJubJubAuthWitnessProvider implements AuthWitnessProvider {
    constructor(private signingPrivateKey: BabyJubJubScalar) { }

    createAuthWit(messageHash: Fr): Promise<AuthWitness> {
        const babyJubJub = new BabyJubJub();
        const signature = babyJubJub.constructSignature(messageHash.toBuffer(), this.signingPrivateKey).toBuffer();
        return Promise.resolve(new AuthWitness(messageHash, [...signature]));
    }
}