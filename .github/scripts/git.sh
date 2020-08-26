#!/bin/bash

# Set git user name
git config user.name "${GIT_AUTHOR_NAME}"

# Set git user email
git config user.email ${GIT_AUTHOR_EMAIL}

# Set pgp siging key
git config user.signingkey ${PGP_KEY_ID}

# Set the custom gpg program (that passes the passphrase to `gpg2`)
git config gpg.program ./.github/scripts/gpg.sh

# Sign commits with PGP key
git config commit.gpgsign true
