import { Fq, Point, PublicKey } from '@aztec/aztec.js';
import { BarretenbergSync } from '@aztec/bb.js';
import { numToUInt32BE } from '@aztec/foundation/serialize';
import { BabyJubJubSignature } from './signature';

/* The following functions perform operations over 
 * the embedded curve whose coordinates are defined 
 * by the configured noir field.
 * For the BN254 scalar field, this is BabyJubJub.
 */
export type BabyJubJubScalar = Fq;
export const BabyJubJubScalar = Fq;

/**
 * BabyJubjub signature construction and helper operations.
 */
export class BabyJubJub {
    private wasm = BarretenbergSync.getSingleton().getWasm();

    /**
     * Computes a BabyJubjub public key from a private key.
     * @param privateKey - The private key.
     * @returns A BabyJubjub public key.
     */
    public computePublicKey(privateKey: BabyJubJubScalar): PublicKey {
        this.wasm.writeMemory(0, privateKey.toBuffer());
        this.wasm.call('babyjubjub_compute_public_key', 0, 32);
        return Point.fromBuffer(Buffer.from(this.wasm.getMemorySlice(32, 96)));
    }

    /**
     * Constructs a BabyJubjub signature given a msg and a private key.
     * @param msg - Message over which the signature is constructed.
     * @param privateKey - The private key of the signer.
     * @returns A BabyJubjub signature of the form (s, e).
     */
    public constructSignature(msg: Uint8Array, privateKey: BabyJubJubScalar) {
        const mem = this.wasm.call('bbmalloc', msg.length + 4);
        this.wasm.writeMemory(0, privateKey.toBuffer());
        this.wasm.writeMemory(mem, Buffer.concat([numToUInt32BE(msg.length), msg]));
        this.wasm.call('babyjubjub_construct_signature', mem, 0, 32, 64);

        return new BabyJubJubSignature(Buffer.from(this.wasm.getMemorySlice(32, 96)));
    }

    /**
 * Verifies a BabyJubJub signature given a BabyJubJub public key.
 * @param msg - Message over which the signature was constructed.
 * @param pubKey - The BabyJubJub public key of the signer.
 * @param sig - The BabyJubJub signature.
 * @returns True or false.
 */
    public verifySignature(msg: Uint8Array, pubKey: PublicKey, sig: BabyJubJubSignature) {
        const mem = this.wasm.call('bbmalloc', msg.length + 4);
        this.wasm.writeMemory(0, pubKey.toBuffer());
        this.wasm.writeMemory(64, sig.s);
        this.wasm.writeMemory(96, sig.e);
        this.wasm.writeMemory(mem, Buffer.concat([numToUInt32BE(msg.length), msg]));
        this.wasm.call('babyjubjub_verify_signature', mem, 0, 64, 96, 128);
        const result = this.wasm.getMemorySlice(128, 129);
        return !Buffer.alloc(1, 0).equals(result);
    }
}