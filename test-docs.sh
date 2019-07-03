#!/bin/bash
set -e
docker-compose -f .ci/doc/docker-compose.yml pull
docker-compose -f .ci/doc/docker-compose.yml run doc-tests node index
docker-compose -f .ci/doc/docker-compose.yml down

docker-compose -f .ci/doc/docker-compose.yml up -d kuzzle

until $(curl --output /dev/null --silent --head --fail http://localhost:7512); do
  printf '.'
  sleep 5
done

apt-get install libgconf-2-4
cd doc/6/getting-started/vuejs
npm ci
npm run serve-without-vuex &
npm run test

docker-compose -f .ci/doc/docker-compose.yml down