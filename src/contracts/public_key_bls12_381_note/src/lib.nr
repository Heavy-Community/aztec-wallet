use dep::aztec::{
    prelude::{NoteHeader, NoteInterface, PrivateContext}, note::utils::compute_note_hash_for_nullify,
    keys::getters::get_nsk_app,
    protocol_types::{constants::GENERATOR_INDEX__NOTE_NULLIFIER, hash::poseidon2_hash_with_separator}
};

global BLS12381_PUBLIC_KEY_NOTE_LEN: Field = 5;
// BLS12381_PUBLIC_KEY_NOTE_LEN * 32 + 32(storage_slot as bytes) + 32(note_type_id as bytes)
global BLS12381_PUBLIC_KEY_NOTE_BYTES_LEN: Field = BLS12381_PUBLIC_KEY_NOTE_LEN * 32 + 64;

#[aztec(note)]
struct BLS12381PublicKeyNote {
    x: [u8; 48],
    y: [u8; 48],
    // We store the npk_m_hash only to get the secret key to compute the nullifier
    npk_m_hash: Field,

}
impl NoteInterface<BLS12381_PUBLIC_KEY_NOTE_LEN, BLS12381_PUBLIC_KEY_NOTE_BYTES_LEN> for BLS12381PublicKeyNote {
    // [0] = x_1[0..31]
    // [1] = x_2[0..17]
    // [2] = y_1[0..31]
    // [3] = y_2[0..17]
    // [4] = npk_m_hash
    fn serialize_content(self) -> [Field; BLS12381_PUBLIC_KEY_NOTE_LEN] {
        let mut first_part_x: Field = 0;
        let mut first_part_y: Field = 0;
        let mut second_part_x: Field = 0;
        let mut second_part_y: Field = 0;
        let mut mul = 1;

        // Handles the first 31 bytes (bytes 0 to 30)
        for i in 0..31 {
            let byte_x: Field = self.x[31 - i] as Field;
            first_part_x = first_part_x + (byte_x * mul);
            let byte_y: Field = self.y[31 - i]  as Field;
            first_part_y += byte_y * mul;
            mul *= 256;
        }

        mul = 1;
        // Handles the remaining 17 bytes (bytes 31 to 47)
        for i in 0..17 {
            let byte_x: Field = self.x[47 - i] as Field;
            second_part_x = second_part_x + (byte_x * mul) as Field;
            let byte_y: Field = self.y[47 - i] as Field;
            second_part_y = second_part_y + (byte_y * mul) as Field;
            mul *= 256;
        }

        [first_part_x, second_part_x, first_part_y, second_part_y, self.npk_m_hash]
    }

    fn deserialize_content(serialized_note: [Field; BLS12381_PUBLIC_KEY_NOTE_LEN]) -> Self {
        let mut x: [u8; 48] = [0; 48];
        let mut y: [u8; 48] = [0; 48];

        let mut first_part_x = serialized_note[0].to_be_bytes(32);
        for i in 0..31 {
            x[i] = first_part_x[i + 1];
        }

        let mut second_part_x = serialized_note[1].to_be_bytes(17);
        for i in 31..48 {
            x[i] = second_part_x[i];
        }

        let first_part_y = serialized_note[2].to_be_bytes(32);
        for i in 0..31 {
            y[i] = first_part_y[i + 1];
        }
        
        let mut second_part_y = serialized_note[1].to_be_bytes(17);
        for i in 31..48 {
            y[i] = second_part_y[i];
        }

        Self { x, y, npk_m_hash: serialized_note[4], header: NoteHeader::empty() }
    }

    fn compute_nullifier(self, context: &mut PrivateContext, note_hash_for_nullify: Field) -> Field {
        let secret = context.request_nsk_app(self.npk_m_hash);
        poseidon2_hash_with_separator([
            note_hash_for_nullify,
            secret
        ],
            GENERATOR_INDEX__NOTE_NULLIFIER as Field,
        )
    }

    fn compute_nullifier_without_context(self) -> Field {
        let note_hash_for_nullify = compute_note_hash_for_nullify(self);
        let secret = get_nsk_app(self.npk_m_hash);
        poseidon2_hash_with_separator([
            note_hash_for_nullify,
            secret,
        ],
            GENERATOR_INDEX__NOTE_NULLIFIER as Field,
        )
    }
}

impl BLS12381PublicKeyNote {
    pub fn new(x: [u8; 48], y: [u8; 48], npk_m_hash: Field) -> Self {
        Self { x, y, npk_m_hash, header: NoteHeader::empty() }
    }
}
