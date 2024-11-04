#!/bin/bash

set -ex

here="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$here"

docker compose -f ./doc/docker-compose.yml build
docker compose -f ./doc/docker-compose.yml pull
docker compose -f ./doc/docker-compose.yml run doc-tests node index
EXIT=$?
docker compose -f ./doc/docker-compose.yml down
