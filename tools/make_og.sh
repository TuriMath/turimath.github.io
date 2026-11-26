#!/bin/sh
# Renders tools/og.html to img/og.png (1200x630) with headless Chrome. Run from the repo root.
# The window is taller than the card (headless Chrome eats some height), then cropped to 1200x630.
CH=$(command -v google-chrome || command -v chromium)
"$CH" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --window-size=1200,800 \
  --virtual-time-budget=5000 --screenshot="$PWD/img/og.png" "file://$PWD/tools/og.html"
convert "$PWD/img/og.png" -crop 1200x630+0+0 +repage "$PWD/img/og.png"
