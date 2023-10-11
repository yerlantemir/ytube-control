#!/usr/bin/env bash

set -euo pipefail

zip -r - . --exclude \
  package.zip \
  package.sh \
  ".git/*" \
  README.md \
> package.zip

echo
echo "Packaged into package.zip"