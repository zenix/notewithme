#!/bin/sh
npm install
node_modules/.bin/webdriver-manager update
node_modules/.bin/webdriver-manager start
./node_modules/protractor/bin/protractor protractor-conf.js