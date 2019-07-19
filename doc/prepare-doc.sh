#!/bin/bash

set -e

echo "Init documentation framework submodule"
git submodule init framework/
git submodule update framework/

echo "Link local documentation"
mkdir framework/.repos/sdk/sdk-javascript-6/doc/
ln -s ../../../../../6 framework/.repos/sdk/sdk-javascript-6/doc/6

npm --prefix framework/ install
