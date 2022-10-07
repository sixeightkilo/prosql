#!/bin/sh
find . -name "*.jade" | entr -s "~/go/bin/jade -writer -basedir templates -pkg=views tables.jade"
#find . -name "*.jade" | entr -s "~/go/bin/jade -writer -basedir templates -pkg=views signup.jade"
#find . -name "*.jade" | entr -s "~/go/bin/jade -writer -basedir templates -pkg=views signin.jade"
#find . -name "*.jade" | entr -s "~/go/bin/jade -writer -basedir templates -pkg=views connections-user.jade"
#find . -name "*.jade" | entr -s "~/go/bin/jade -writer -basedir templates -pkg=views connections.jade"
