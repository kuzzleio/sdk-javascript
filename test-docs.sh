#!/bin/bash
set -e
docker-compose -f .ci/doc/docker-compose.yml pull
docker-compose -f .ci/doc/docker-compose.yml run doc-tests node index
docker-compose -f .ci/doc/docker-compose.yml down