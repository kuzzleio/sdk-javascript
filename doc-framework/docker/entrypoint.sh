#!/bin/bash

if [ -z "$DEV_MODE" ]; then
  npm install --unsafe-perm
fi

chmod 777 node_modules

/app/test/snippet-testing $@
RETURN_TESTS="$?"
chmod 777 /app/test/bin/*

if [ "$RETURN_TESTS" -eq 0 ]; then
  touch /app/.ci/success/"$LANGUAGE"-"$SDK_VERSION"
  exit 0
elif [ "$RETURN_TESTS" -eq 1 ]; then
  touch /app/.ci/failed/"$LANGUAGE"-"$SDK_VERSION"
  exit 1
elif [ "$RETURN_TESTS" -eq 3 ]; then
  touch /app/.ci/not_implemented/"$LANGUAGE"-"$SDK_VERSION"
  exit 0
fi
