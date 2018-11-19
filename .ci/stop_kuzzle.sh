#!/usr/bin/env bash
set -e
# Download and launch custom Kuzzle stack

docker-compose -f .ci/docker-compose.yml stop
