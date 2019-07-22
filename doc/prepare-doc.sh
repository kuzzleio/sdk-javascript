#!/bin/bash

set -e

echo "Clone documentation framework"
rm -rf framework
git clone --depth 10 --single-branch --branch master https://github.com/kuzzleio/documentation.git framework/

echo "Link local documentation"
mkdir framework/.repos/sdk/sdk-javascript-6/doc/
ln -s ../../../../../6 framework/.repos/sdk/sdk-javascript-6/doc/6

npm --prefix framework/ install
