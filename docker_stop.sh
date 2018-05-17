#!/bin/bash

CONTAINER_NAME="ldd-transform"

docker stop $CONTAINER_NAME

docker rm $CONTAINER_NAME

echo "$CONTAINER_NAME container removed."