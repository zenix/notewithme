#!/bin/sh
npm install
npm install -g gulp
bower install
gulp
node dist/app &
node_modules/protractor/bin/protractor protractor-conf.js