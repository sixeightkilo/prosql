#!/bin/sh
find . -name "*.jade" | entr -s "~/go/bin/jade -writer -basedir templates -pkg=views index.jade"
