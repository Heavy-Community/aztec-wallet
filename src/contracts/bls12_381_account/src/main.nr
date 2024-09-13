contract BLS12381Account {
    use aztec::state_vars::private_immutable::PrivateImmutable;

    #[aztec(storage)]
    struct Storage {
        // signing_public_key: PrivateImmutable;
    }

    #[aztec(initializer)]
    #[aztec(private)]
    fn constructor() {}

    fn entrypoint() {}

    fn is_valid_signature() {}
}
