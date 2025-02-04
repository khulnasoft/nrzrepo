#!/bin/bash

export NRZ_DOWNLOAD_LOCAL_ENABLED=0
SCRIPT_DIR=$(dirname ${BASH_SOURCE[0]})
TARGET_DIR=$1
FIXTURE_DIR=$2

cp -a ${SCRIPT_DIR}/../../fixtures/find_nrz/$FIXTURE_DIR/. ${TARGET_DIR}/

# We need to symlink: nrz -> .pnpm/nrz@1.0.0/node_modules/nrz
# where `nrz` is the symlink
# and `.pnpm/nrz@1.0.0/node_modules/nrz` is the path to symlink to
# Note: using a nested if so it's easy to find the Windows checks in scripts around the codebase.
if [[ "$OSTYPE" == "msys" ]]; then
   if [[ $FIXTURE_DIR == "linked" ]]; then
    # Delete the existing nrz directory or file, whatever exists there
    rm -rf node_modules/nrz

    # Let's enter the node_modules directory
    # echo "entering node_modules directory"
    pushd node_modules > /dev/null || exit 1

    # Use pnpx to run symlnk-dir because installing globally doesn't work with pnpm.
    pnpx symlink-dir .pnpm/nrz@1.0.0/node_modules/nrz nrz > /dev/null 2>&1

    # Get outta there
    popd > /dev/null || exit 1
  fi
fi
