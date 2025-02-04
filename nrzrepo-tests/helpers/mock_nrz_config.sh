#!/usr/bin/env bash

read -r -d '' CONFIG <<- EOF
{
  "token": "normal-user-token"
}
EOF

TMP_DIR=$(mktemp -d -t nrz-XXXXXXXXXX)

# duplicate over to XDG var so that nrz picks it up
export XDG_CONFIG_HOME=$TMP_DIR
export HOME=$TMP_DIR
export NRZ_CONFIG_DIR_PATH=$TMP_DIR
export NRZ_TELEMETRY_MESSAGE_DISABLED=1

# For Linux
mkdir -p "$TMP_DIR/nrzrepo"
echo $CONFIG > "$TMP_DIR/nrzrepo/config.json"

# For macOS
MACOS_DIR="$TMP_DIR/Library/Application Support"
mkdir -p "$MACOS_DIR/nrzrepo"
echo "$CONFIG" > "$MACOS_DIR/nrzrepo/config.json"

# For Windows
WINDOWS_DIR="$TMP_DIR\\AppData\\Roaming"
mkdir -p "$WINDOWS_DIR\\nrzrepo"
echo "$CONFIG" > "$WINDOWS_DIR\\nrzrepo\\config.json"
