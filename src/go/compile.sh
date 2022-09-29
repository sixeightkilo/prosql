#!/bin/sh
find ./ -type f \( -iname \*.go -o -iname \*.jade \) | entr -r -s "go run main.go init.go"
