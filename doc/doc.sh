#!/bin/bash

export DOC_DIR=6
export SITE_BASE=/sdk/js/6/

if [ ! -d "./$DOC_DIR"]
then
  echo "Cannot find $DOC_DIR/. You must run this script from doc/ directory."
  exit 1
fi

case $1 in
  prepare)
    echo "Clone documentation framework"
    git clone --depth 10 --single-branch --branch master https://github.com/kuzzleio/documentation.git framework/
    git -C framework/ pull origin master

    echo "Install dependencies"
    npm --prefix framework/ install
  ;;

  dev)
    ./framework/node_modules/.bin/vuepress dev $DOC_DIR/ $2
  ;;

  build)
    ./framework/node_modules/.bin/vuepress build $DOC_DIR/ $2
  ;;

  upload)
    if [ -z "$AWS_BUCKET" ]
    then
      echo "Missing AWS_BUCKET."
      exit 1
    fi

    aws s3 sync doc/$DOC_DIR/.vuepress/dist s3://$AWS_BUCKET$SITE_BASE
  ;;

  cloudfront)
    if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]
    then
      echo "Missing CLOUDFRONT_DISTRIBUTION_ID."
      exit 1
    fi

    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths '/*'
  ;;

  *)
    echo "Usage : $0 <prepare|dev|build|upload|cloudfront>"
    exit 1
  ;;
esac
