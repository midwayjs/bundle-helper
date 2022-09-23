#!/bin/bash

VERSION=("4.6.3" "4.7.4" "4.8.3")
for value in ${VERSION[@]}
do
    echo $value
    rm -rf package.json
    rm -rf node_modules/typescript
    npm i typescript@$value
    npm run test
done
