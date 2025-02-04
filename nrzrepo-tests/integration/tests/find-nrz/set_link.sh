#!/bin/bash

TARGET_DIR=$1
NRZ_PATH=$2

if [[ "$OSTYPE" == "msys" ]]; then
  FILES=$(find $TARGET_DIR -type f -name nrz.exe)
else
  FILES=$(find $TARGET_DIR -type f -name nrz)
fi

for FILE in $FILES
do
  rm $FILE
  ln -s $NRZ_PATH $FILE
done
