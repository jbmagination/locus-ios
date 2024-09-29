#!/bin/bash
if [ -z "x$RERELEASE_CHECK" = "xfalse" ]; then
  echo "Release check skipped; don't commit anything!"
else
  git commit -m "[auto] Update release ID" -- release.txt
  git push
fi
