
if [[ $TRAVIS_BRANCH =~ ^master|[0-9]+-stable$ ]]; then BRANCH=stable; else BRANCH=dev; fi
echo $BRANCH
