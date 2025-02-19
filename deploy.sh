#!/bin/zsh
set -e
. ~/.nvm/nvm.sh
nvm use v16.14.2
npm run build
nvm use v18.19.1
firebase deploy