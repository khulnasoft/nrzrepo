#!/usr/bin/env bash

THIS_DIR=$(dirname "${BASH_SOURCE[0]}")
MONOREPO_ROOT_DIR="${THIS_DIR}/../.."

if [[ "${OSTYPE}" == "msys" ]]; then
  EXT=".exe"
else
  EXT=""
fi

# disable the first-run telemetry message
export NRZ_TELEMETRY_MESSAGE_DISABLED=1
export NRZ_GLOBAL_WARNING_DISABLED=1
export NRZ_DOWNLOAD_LOCAL_ENABLED=0
export NRZ_PRINT_VERSION_DISABLED=1
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
NRZ=${MONOREPO_ROOT_DIR}/target/debug/nrz${EXT}
