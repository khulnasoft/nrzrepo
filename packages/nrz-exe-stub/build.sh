#!/usr/bin/env bash

if [[ "$OSTYPE" != "msys" ]]; then
  echo "Skipping build for non-windows platform"
  exit
fi


echo "Building stub nrz.exe for windows platform"
g++ nrz.cpp -o nrz.exe


SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
UP_ONE="$SCRIPT_DIR/.."
ROOT_DIR="$SCRIPT_DIR/../.."
FIND_NRZ_FIXTURES_DIR="${ROOT_DIR}/nrzrepo-tests/integration/fixtures/find_nrz"

echo "PWD: $PWD"
echo "ROOT_DIR: $ROOT_DIR"
echo "UP_ONE: $UP_ONE"
echo "FIND_NRZ_FIXTURES_DIR: ${FIND_NRZ_FIXTURES_DIR}"

cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/hoisted/node_modules/nrz-windows-64/bin/"
cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/hoisted/node_modules/nrz-windows-arm64/bin/"

cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/linked/node_modules/.pnpm/nrz-windows-64@1.0.0/node_modules/nrz-windows-64/bin/"
cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/linked/node_modules/.pnpm/nrz-windows-arm64@1.0.0/node_modules/nrz-windows-arm64/bin/"

cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/nested/node_modules/nrz/node_modules/nrz-windows-64/bin/"
cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/nested/node_modules/nrz/node_modules/nrz-windows-arm64/bin/"

cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/self/node_modules/nrz-windows-64/bin/"
cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/self/node_modules/nrz-windows-arm64/bin/"

cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/unplugged/.yarn/unplugged/nrz-windows-64-npm-1.0.0-520925a700/node_modules/nrz-windows-64/bin/"
cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/unplugged/.yarn/unplugged/nrz-windows-arm64-npm-1.0.0-520925a700/node_modules/nrz-windows-arm64/bin/"

cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/unplugged_env_moved/.moved/unplugged/nrz-windows-64-npm-1.0.0-520925a700/node_modules/nrz-windows-64/bin/"
cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/unplugged_env_moved/.moved/unplugged/nrz-windows-arm64-npm-1.0.0-520925a700/node_modules/nrz-windows-arm64/bin/"

cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/unplugged_moved/.moved/unplugged/nrz-windows-64-npm-1.0.0-520925a700/node_modules/nrz-windows-64/bin/"
cp nrz.exe "${FIND_NRZ_FIXTURES_DIR}/unplugged_moved/.moved/unplugged/nrz-windows-arm64-npm-1.0.0-520925a700/node_modules/nrz-windows-arm64/bin/"

echo "Done copying files"
