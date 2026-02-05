#!/bin/bash

START_DATE="2026-01-23"
END_DATE=$(date +%Y-%m-%d)
README="README.md"

# ensure README exists
if [ ! -f "$README" ]; then
  echo "# Project Progress" > "$README"
fi

current="$START_DATE"

while [ "$current" != "$(date -I -d "$END_DATE + 1 day")" ]; do

  # check if commit already exists on this day
  if ! git log --since="$current 00:00" --until="$current 23:59" --oneline | grep -q .; then

    #
    HOUR=$(shuf -i 1-22 -n 1)
    MINUTE=$(shuf -i 0-59 -n 1)

    TIME=$(printf "%02d:%02d:00" "$HOUR" "$MINUTE")

    echo "- Daily progress log: $current" >> "$README"
    git add "$README"

    GIT_AUTHOR_DATE="$current T$TIME" \
    GIT_COMMITTER_DATE="$current T$TIME" \
    git commit -m "docs: daily progress ($current)"

  fi

  current=$(date -I -d "$current + 1 day")
done
