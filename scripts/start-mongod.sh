#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$SCRIPT_DIR/..

MONGODB_DIR=$ROOT_DIR/mongodb
MONGOD_LOG_DIR=$MONGODB_DIR/log
MONGODB_DATA_DIR=$MONGODB_DIR/data

echo ROOT_DIR=$ROOT_DIR

cd $ROOT_DIR

mkdir -p $MONGOD_LOG_DIR
mkdir -p $MONGODB_DATA_DIR

## START: START MONGO DAEMON
echo "Starting mongo daemon process ..."
mongod --dbpath=$MONGODB_DATA_DIR --fork --logpath $MONGOD_LOG_DIR/mongod.log
## END: STARTED MONGO DAEMON