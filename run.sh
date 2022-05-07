#!/usr/bin/env sh
# Node Protocol Multiplexer - A simple tool to serve multiple services on the same port. Written in Node.js with zero dependencies.
# https://github.com/nggit/node-protocol-multiplexer
# Copyright (c) 2022 nggit.

NORMAL="\033[0m"
RED="\033[91m"
YELLOW="\033[93m"

if ! command -v node > /dev/null; then
    printf "%b\n" "${RED}Node.js is not installed. Please refer to the following link for installation: https://nodejs.org/en/download/package-manager/$NORMAL" 1>&2
    exit 1
fi

while :; do
    if [ -e .env ]; then
        echo "Loading environment variables from .env file"

        while IFS= read -r line; do
            line=$( echo "$line" | xargs )

            test "${line##"#"}" = "$line" || continue

            # shellcheck disable=SC2163
            test -n "$line" && export "$line" > /dev/null 2>&1
        done < .env
    else
        printf "%b\n" "$YELLOW.env file not found. The default configuration will be used$NORMAL"
    fi

    node server.js

    echo "Restarting..."
    sleep 1
done
