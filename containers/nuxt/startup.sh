#!/bin/bash
echo "EXEC_SETUP_FLAG=${EXEC_SETUP_FLAG:=false}"
if [[ ${EXEC_SETUP_FLAG:=false} = "true" ]]; then

  cd /var/www/application
  echo "start yarn run start"
  npm run start
else
  node
fi