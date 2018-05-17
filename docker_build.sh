#!/bin/bash

echo "Hello world!";

CONTAINER_NAME="ldd-transform"

## Validates that git branch has been supplied
if [ $# -eq 0 ]
    then
        echo "no arguments supplied, try again."
        echo "please specify a git branch to deploy."
        exit
fi

# stores branch name
BRANCH=$1

echo "building branch: $1"

# git fetch

# git pull

./docker_stop.sh

docker run --name ldd-transform -p 49160:3001 -d conormcneil/${CONTAINER_NAME}

echo "New container build: $CONTAINER_NAME"