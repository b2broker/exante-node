#!/bin/bash

# Pass the passphrase to gpg2
gpg2 --batch --pinentry-mode=loopback --passphrase ${PGP_PASSPHRASE} -v $@
