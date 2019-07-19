#!/bin/bash

npm --prefix doc-framework/ install
./doc-framework/node_modules/.bin/vuepress build doc/6
