#!/bin/sh
npm install
npm install gulp
bower install
node_modules/gulp/bin/gulp.js
node dist/app &
sleep 3
node_modules/protractor/bin/protractor protractor-conf.js