#!/bin/bash

CONTAINER_NAME="ldd-transform"

ENV=$1

npm i --only=production

grunt deploy:$1

docker stop $CONTAINER_NAME

docker rm $CONTAINER_NAME

docker build -f Dockerfile . --tag $CONTAINER_NAME:latest

docker run --name $CONTAINER_NAME -p 49160:3001 -d ${CONTAINER_NAME}:latest

echo "Container rebuilt: $CONTAINER_NAME"