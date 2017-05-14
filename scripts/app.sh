#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$SCRIPT_DIR/..

PUBLIC_SRC_DIR=$ROOT_DIR/app/public
SERVER_SRC_DIR=$ROOT_DIR/app/server
DIST_DIR=$ROOT_DIR/dist


rm -rf  $PUBLIC_SRC_DIR/dist/*
rm -rf $DIST_DIR
mkdir -p $DIST_DIR/public

echo ROOT_DIR=$ROOT_DIR

cd $ROOT_DIR

## build ui
cd $PUBLIC_SRC_DIR && npm install && bower install && gulp

## build server
cd $SERVER_SRC_DIR && npm install

####### START package #######
cd $ROOT_DIR

cp -r $PUBLIC_SRC_DIR/dist/* $DIST_DIR/public
cp -r $SERVER_SRC_DIR/* $DIST_DIR
 ####### END package #######

export ENV=DEV
export MONGO_URL='mongodb://localhost:27017/homeaze'
export PORT=3443

## START: MONGOD
$SCRIPT_DIR/start-mongod.sh
## END: MONGOD

## START: SERVER
cd $ROOT_DIR/dist && npm install && npm start
## END: STARTED SERVER
