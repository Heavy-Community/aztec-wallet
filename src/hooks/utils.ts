import { createPXEClient, Fr, waitForPXE } from "@aztec/aztec.js";
import { BabyJubJubScalar } from "../accounts/baby jubjub";
import { GeneratorIndex } from "@aztec/circuits.js";
import { Bufferable, serializeToBufferArray } from "@aztec/foundation/serialize";
import { default as hash } from 'hash.js';


export const sha512 = (data: Buffer) => Buffer.from(hash.sha512().update(data).digest());

export const setupSandbox = async () => {
    const { PXE_URL = "http://localhost:8080" } = process.env;
    const pxe = createPXEClient(PXE_URL);
    await waitForPXE(pxe);
    return pxe;
};

export function deriveSigningKey(secretKey: Fr): BabyJubJubScalar {
    return sha512ToGrumpkinScalar([secretKey, GeneratorIndex.IVSK_M]);
}

export function serializeToBuffer(...objs: Bufferable[]): Buffer {
    return Buffer.concat(serializeToBufferArray(...objs));
}

export const sha512ToGrumpkinScalar = (data: Bufferable[]) => {
    const buffer = serializeToBuffer(data);
    return BabyJubJubScalar.fromBufferReduce(sha512(buffer));
};

function hexToBytes(hex: any) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}