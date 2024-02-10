#!/bin/bash
curl -Ls https://api.github.com/repos/Myzel394/locus/releases/latest | grep \"id\" -m 1 | head -1 | sed 's/[^0-9]*//g' > release2.txt
if [ -z "$(diff release.txt release2.txt)" ]; then
  echo No new release, skip.
  exit 1
fi
