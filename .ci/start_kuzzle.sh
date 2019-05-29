#!/usr/bin/env bash
set -e
# Download and launch custom Kuzzle stack

docker-compose -f .ci/docker-compose.yml up -d

printf 'Waiting for Kuzzle stack to be up and running'

until $(curl --output /dev/null --silent --head --fail http://localhost:7512); do
  printf '.'
  sleep 5
done
