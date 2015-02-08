#!/bin/sh
npm install
npm install gulp
bower install
node_modules/gulp/bin/gulp.js
node dist/app &
#node_modules/protractor/bin/webdriver-manager update
#node_modules/protractor/bin/webdriver-manager start &
#sleep 3
node_modules/protractor/bin/protractor protractor-conf.js