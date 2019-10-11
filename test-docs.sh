#!/bin/bash
set -e

here="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$here"

docker-compose -f .ci/doc/docker-compose.yml pull
docker-compose -f .ci/doc/docker-compose.yml run doc-tests node index
EXIT=$?
docker-compose -f .ci/doc/docker-compose.yml down

docker-compose -f .ci/doc/docker-compose.yml up -d kuzzle

until $(curl --output /dev/null --silent --head --fail http://localhost:7512); do
  printf '.'
  sleep 5
done

cd ${here}/doc/7/getting-started/.react
yarn install
SKIP_PREFLIGHT_CHECK=true yarn start &
npm run test

cd ${here}/doc/7/getting-started/.vuejs
npm ci
npm run serve-standalone &
npm run test

cd ${here}
docker-compose -f .ci/doc/docker-compose.yml down

exit $EXIT
