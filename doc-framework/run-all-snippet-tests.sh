#/bin/bash

ERROR=0

# JS v6
bash run-snippet-tests.sh -n -p src/ -s javascript -v 6

if [[ ! $? -eq 0 ]]; then
  ERROR=1
fi

# GO v1
bash run-snippet-tests.sh -p src/ -s go -v 1

if [[ ! $? -eq 0 ]]; then
  ERROR=1
fi

exit $error
