#!/usr/bin/env bash

read -r -d '' CONFIG <<- EOF
{
  "telemetry_enabled": true
}
EOF

TMP_DIR=$(mktemp -d -t nrz-XXXXXXXXXX)

# duplicate over to XDG var so that nrz picks it up
export XDG_CONFIG_HOME=$TMP_DIR
export HOME=$TMP_DIR
export NRZ_TELEMETRY_MESSAGE_DISABLED=1
export NRZ_CONFIG_DIR_PATH=$TMP_DIR

# For Linux
mkdir -p "$TMP_DIR/nrzrepo"
echo $CONFIG > "$TMP_DIR/nrzrepo/telemetry_config.json"

# For macOS
MACOS_DIR="$TMP_DIR/Library/Application Support"
mkdir -p "$MACOS_DIR/nrzrepo"
echo "$CONFIG" > "$MACOS_DIR/nrzrepo/telemetry_config.json"
