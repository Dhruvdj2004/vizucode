#!/usr/bin/env bash
# Record every line of <workdir>/vo/lines.txt ("key|spoken text" per line) and write
# <workdir>/vo/<key>.wav (48 kHz mono). Prints each clip's duration.
# Uses macOS `say` on a Mac, edge-tts elsewhere (see tts.py). Force with VO_ENGINE=say|edge.
#
# Several speakers: add <workdir>/vo/voices.txt with "key-prefix|voice|pitch" lines, e.g.
#   chintu|Aman|1.2
#   meera|Tara|1.12
# A line whose key starts with "chintu" (chintu_hook, chintu3, ...) then uses Aman at pitch 1.2.
# Keys that match no prefix use the default voice and pitch 1.0.
# Usage: make_vo.sh <workdir> [voice=Aman] [rate=180]
set -e
WORK=${1:?usage: make_vo.sh <workdir> [voice] [rate]}
VOICE=${2:-Aman}
RATE=${3:-180}
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$WORK/vo"
while IFS='|' read -r key text || [[ -n "$key" ]]; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  v=$VOICE; p=1.0
  if [[ -f voices.txt ]]; then
    while IFS='|' read -r pre vv pp; do
      [[ -z "$pre" || "$pre" == \#* ]] && continue
      if [[ "$key" == "$pre"* ]]; then v=$vv; p=${pp:-1.0}; break; fi
    done < voices.txt
  fi
  python3 "$HERE/tts.py" "$key.wav" "$v" "$RATE" "$text" --pitch "$p" < /dev/null
  printf "%-12s %-6s %5.2fs\n" "$key" "$v" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$key.wav" < /dev/null)"
done < lines.txt
