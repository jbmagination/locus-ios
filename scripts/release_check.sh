#!/bin/bash
mkdir $PWD/tmp
curl -Ls https://api.github.com/repos/Myzel394/locus/releases/latest > tmp/release.json 
cat tmp/release.json | grep \"id\" -m 1 | head -1 | sed 's/[^0-9]*//g' > release2.txt
echo "---"
echo $PWD
ls $PWD
cat release.txt
cat release2.txt
cat tmp/release.json
echo "---"
if [ -z "$(diff release.txt release2.txt)" ]; then
  echo "No new release, stop!"
  exit 1
else
  echo "New release found! Verifying release exists."
  export RELEASE=`cat release2.txt`
  if [ "x$ENV_VARIABLE" != "x" ]; then
    echo "Release variable empty; redo next cron!"
    exit 1
  else
    curl -Ls https://api.github.com/repos/Myzel394/locus/releases/$RELEASE > tmp/release2.json
    cat tmp/release.json | grep \"id\" -m 1 | head -1 | sed 's/[^0-9]*//g' > release3.txt
    if [ -z "$(diff release.txt release2.txt)" ]; then
      echo "New release, continue!"
    else
      echo "Something went very wrong; redo next cron!"
      exit 1
    fi
  fi
fi
