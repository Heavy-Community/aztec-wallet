contract BLS12381Account {
    use dep::aztec::prelude::{PrivateContext, PrivateImmutable};
    use dep::aztec::{
        encrypted_logs::encrypted_note_emission::encode_and_encrypt_note_with_keys,
        keys::getters::get_current_public_keys
    };
    use dep::authwit::{
        entrypoint::{app::AppPayload, fee::FeePayload}, account::AccountActions,
        auth_witness::get_auth_witness
    };
    use public_key_bls12_381_note::{BLS12381PublicKeyNote, verify_signature};

    #[aztec(storage)]
    struct Storage {
        public_key: PrivateImmutable<BLS12381PublicKeyNote>,
    }

    // Creates a new account out of a BLS12-381 public key to use for signature verification
    #[aztec(initializer)]
    #[aztec(private)]
    fn constructor(signing_pub_key_x: [u8; 48], signing_pub_key_y: [u8; 48]) {
        let this = context.this_address();

        let this_keys = get_current_public_keys(&mut context, this);
        let mut pub_key_note = BLS12381PublicKeyNote::new(signing_pub_key_x, signing_pub_key_y, this_keys.npk_m.hash());
        storage.public_key.initialize(&mut pub_key_note).emit(encode_and_encrypt_note_with_keys(&mut context, this_keys.ovpk_m, this_keys.ivpk_m, this));
    }

    #[aztec(private)]
    fn entrypoint(app_payload: AppPayload, fee_payload: FeePayload, cancellable: bool) {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.entrypoint(app_payload, fee_payload, cancellable);
    }

    #[aztec(private)]
    #[aztec(noinitcheck)]
    #[aztec(view)]
    fn verify_private_authwit(inner_hash: Field) -> Field {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.verify_private_authwit(inner_hash)
    }

    #[contract_library_method]
    fn is_valid_impl(context: &mut PrivateContext, outer_hash: Field) -> bool {
        // Load public key from storage
        let storage = Storage::init(context);
        let public_key = storage.public_key.get_note();

        // Load auth witness
        let witness: [Field; 192] = unsafe {
            get_auth_witness(outer_hash)
        };

        // u8 casting
        let mut signature: [u8; 192] = [0; 192];
        for i in 0..192 {
            signature[i] = witness[i] as u8;
        }

        let outer_hash_bytes: [u8; 32] = outer_hash.to_be_bytes(32).as_array();
        let hashed_message: [u8; 32] = std::hash::sha256(outer_hash_bytes);
        verify_signature(public_key.x, public_key.y, signature, hashed_message)
    }
}
