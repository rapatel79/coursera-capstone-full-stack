#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR/../ionic/homeaze-ionic
ionic serve --lab --browser "google-chrome"
