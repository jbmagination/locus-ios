#!/bin/bash
echo $PWD
curl -Ls https://api.github.com/repos/Myzel394/locus/releases/latest > tmp/release.json 
cat tmp/release.json | grep \"id\" -m 1 | head -1 | sed 's/[^0-9]*//g' > release2.txt
if [ -z "$(diff release.txt release2.txt)" ]; then
  echo No new release, stop.
  exit 1
else
  echo New release, continue.
fi
