#!/bin/bash
if [-z "x$RERELEASE_CHECK" != "xtrue" ]; then
  git commit -m "[auto] Update release ID" -- release.txt
  git push
else
  echo "Release check skipped; don't commit anything!"
fi
