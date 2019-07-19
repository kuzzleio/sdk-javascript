#!/bin/bash

# mkdir -p doc-framework/src/sdk/js/

# rm doc-framework/src/sdk/js/6

ln -s ../../../../doc/6 doc-framework/src/sdk/js/6

npm --prefix doc-framework/ install

npm --prefix doc-framework/ run build

ls doc-framework/src/.vuepress/dist