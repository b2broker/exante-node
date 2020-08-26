#!/bin/bash

gpg2 --batch --symmetric --cipher-algo AES256 \
  --output ./.github/pgp/pgp_key.asc.gpg --passphrase=${PRIVATE_KEY_PASSPHRASE} \
  ./.github/pgp/pgp_key.asc
