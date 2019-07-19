#!/bin/bash

set -e

git submodule init framework/

rm framework/.repos/sdk/sdk-javascript-6/doc/6
ln -s ../../../../../6 framework/.repos/sdk/sdk-javascript-6/doc/6

npm --prefix framework/ install
