#!/bin/bash

echo "Clone documentation framework"
git clone --depth 10 --single-branch --branch master https://github.com/kuzzleio/documentation.git framework/

echo "Link local documentation"
rm framework/src/sdk/js/6 # remove link to submodule
ln -s ../../../../6 framework/src/sdk/js/6 # use current documentation

npm --prefix framework/ install
