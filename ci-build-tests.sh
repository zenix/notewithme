#!/bin/sh
npm install
bower install
gulp
node dist/app &
node_modules/protractor/bin/protractor protractor-conf.js