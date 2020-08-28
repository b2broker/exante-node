#!/bin/bash

# Descrypt the private key
gpg --quiet --batch --yes --decrypt --passphrase=${PRIVATE_KEY_PASSPHRASE} \
  --output ./.github/pgp/key.asc ./.github/pgp/key.asc.gpg

# Set the access permissions
chmod 600 ./.github/pgp/pgp_key.asc

# Import the private key
gpg --batch --yes --import ./.github/pgp/pgp_key.asc
