#!/bin/sh
find ./ -type f \( -iname \*.go -o -iname \*.jade \) | entr -r -s "PROSQL_ENV=dev go run main.go init.go"
