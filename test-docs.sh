#!/bin/bash
docker-compose -f .ci/doc/docker-compose.yml pull
docker-compose -f .ci/doc/docker-compose.yml run doc-tests node index
EXIT=$?
docker-compose -f .ci/doc/docker-compose.yml down

exit $EXIT