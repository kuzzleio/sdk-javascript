#!/usr/bin/env bash

set -e

echo "[$(date --rfc-3339 seconds)] - Start Kuzzle stack"

docker-compose -f .ci/docker-compose.yml up -d

spinner="/"
until $(curl --output /dev/null --silent --head --fail http://localhost:7512); do
  printf '\r'
  echo -n "[$(date --rfc-3339 seconds)] - Waiting for Kuzzle stack to be up and running [$spinner]"

  if [ "$spinner" = "/" ]; then spinner="\\";  else spinner="/" ; fi

  sleep 1
done