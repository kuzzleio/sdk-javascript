#!/bin/bash

set -ex

here="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$here"

docker-compose -f ./doc/docker-compose.yml pull
# docker-compose -f ./doc/docker-compose.yml run doc-tests node index
# EXIT=$?
# docker-compose -f ./doc/docker-compose.yml down

docker-compose -f ./doc/docker-compose.yml up -d kuzzle

# until $(curl --output /dev/null --silent --head --fail http://localhost:7512); do
#   printf '.'
#   sleep 5
# done

# cd ${here}/../doc/7/getting-started/.react/with-redux
# npm ci
# SKIP_PREFLIGHT_CHECK=true npm run start &
# until $(curl --output /dev/null --silent --head --fail http://localhost:3000); do
#   printf '.'
#   sleep 5
# done
# npm run test
# kill $(lsof -t -i:3000)

# cd ${here}/../doc/7/getting-started/.react/standalone
# npm ci
# SKIP_PREFLIGHT_CHECK=true npm run start &
# until $(curl --output /dev/null --silent --head --fail http://localhost:3000); do
#   printf '.'
#   sleep 5
# done
# npm run test

cd ${here}/../doc/7/getting-started/.vuejs
npm ci
npm run serve-standalone &
until $(curl --output /dev/null --silent --head --fail http://localhost:8080); do
  printf '.'
  sleep 5
done
npm run test

# cd ${here}/../doc/7/getting-started/.react-native
# # Here we use install instead of ci because expo-cli cannot be installed with ci
# npm install
# npm run web &
# until $(curl --output /dev/null --silent --head --fail http://localhost:19006); do
#   printf '.'
#   sleep 5
# done
# npm run test

cd ${here}
docker-compose -f ./doc/docker-compose.yml down

exit $EXIT
