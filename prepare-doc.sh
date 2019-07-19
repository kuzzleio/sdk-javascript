#!/bin/bash

mkdir -p doc-framework/src/sdk/js/

ln -s ../../../../doc/6 doc-framework/src/sdk/js/6

npm --prefix doc-framework/ install

npm --prefix doc-framework/ run build
