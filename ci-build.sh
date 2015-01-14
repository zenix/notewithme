#!/bin/sh
set process.env.NODE_ENV=production
npm install
bower install
gulp build