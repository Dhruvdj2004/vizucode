#!/usr/bin/env bash
# Record every line of <workdir>/vo/lines.txt ("key|spoken text" per line) and write
# <workdir>/vo/<key>.wav (48 kHz mono). Prints each clip's duration.
# Uses macOS `say` on a Mac, edge-tts elsewhere (see tts.py). Force with VO_ENGINE=say|edge.
# Usage: make_vo.sh <workdir> [voice=Aman] [rate=180]
set -e
WORK=${1:?usage: make_vo.sh <workdir> [voice] [rate]}
VOICE=${2:-Aman}
RATE=${3:-180}
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$WORK/vo"
while IFS='|' read -r key text || [[ -n "$key" ]]; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  python3 "$HERE/tts.py" "$key.wav" "$VOICE" "$RATE" "$text"
  printf "%-10s %5.2fs\n" "$key" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$key.wav")"
done < lines.txt
