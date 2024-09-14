import { randomBytes } from '@aztec/foundation/crypto';
import { Fr } from '@aztec/foundation/fields';
import { BufferReader, mapTuple } from '@aztec/foundation/serialize';

import { type Signature } from './interface/signature';

/**
 * BabyJubJub signature used for transactions.
 */
export class BabyJubJubSignature implements Signature {
    /**
     * The size of the signature in bytes.
     */
    public static SIZE = 64;

    /**
     * An empty signature.
     */
    public static EMPTY = new BabyJubJubSignature(Buffer.alloc(64));

    constructor(private buffer: Buffer) {
        if (buffer.length !== BabyJubJubSignature.SIZE) {
            throw new Error(`Invalid signature buffer of length ${buffer.length}.`);
        }
    }

    /**
     * Determines if the provided signature is valid or not.
     * @param signature - The data to be checked.
     * @returns Boolean indicating if the provided data is a valid BabyJubJub signature.
     */
    public static isSignature(signature: string) {
        return /^(0x)?[0-9a-f]{128}$/i.test(signature);
    }

    /**
     * Constructs a BabyJubJubSignature from the provided string.
     * @param signature - The string to be converted to a BabyJubJub signature.
     * @returns The constructed BabyJubJub signature.
     */
    public static fromString(signature: string) {
        if (!BabyJubJubSignature.isSignature(signature)) {
            throw new Error(`Invalid signature string: ${signature}`);
        }
        return new BabyJubJubSignature(Buffer.from(signature.replace(/^0x/i, ''), 'hex'));
    }

    /**
     * Generates a random BabyJubJub signature.
     * @returns The randomly constructed signature.
     */
    public static random() {
        return new BabyJubJubSignature(randomBytes(64));
    }

    /**
     * Returns the 's' component of the signature.
     * @returns A buffer containing the signature's 's' component.
     */
    get s() {
        return this.buffer.subarray(0, 32);
    }

    /**
     * Returns the 'e' component of the signature.
     * @returns A buffer containing the signature's 'e' component.
     */
    get e() {
        return this.buffer.subarray(32);
    }

    /**
     * Returns the full signature as a buffer.
     * @returns A buffer containing the signature.
     */
    toBuffer() {
        return this.buffer;
    }

    /**
     * Deserializes from a buffer.
     * @param buffer - The buffer representation of the object.
     * @returns The new object.
     */
    static fromBuffer(buffer: Buffer | BufferReader): BabyJubJubSignature {
        const reader = BufferReader.asReader(buffer);
        return new BabyJubJubSignature(reader.readBytes(BabyJubJubSignature.SIZE));
    }

    /**
     * Returns the full signature as a hex string.
     * @returns A string containing the signature in hex format.
     */
    toString() {
        return `0x${this.buffer.toString('hex')}`;
    }

    /**
     * Converts the signature to an array of three fields.
     * @returns The signature components as an array of three fields
     */
    toFields(): Fr[] {
        const sig = this.toBuffer();

        const buf1 = Buffer.alloc(32);
        const buf2 = Buffer.alloc(32);
        const buf3 = Buffer.alloc(32);

        sig.copy(buf1, 1, 0, 31);
        sig.copy(buf2, 1, 31, 62);
        sig.copy(buf3, 1, 62, 64);

        return mapTuple([buf1, buf2, buf3], Fr.fromBuffer);
    }
}
