#!/usr/bin/env bash
# Two-pass re-encode <in.mp4> to <out.mp4> so the file is <= <maxMB> (default 9.5). Keeps 1080x1920 + AAC 128k.
set -e
IN=${1:?in}; OUT=${2:?out}; MB=${3:-9.5}
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
VK=$(python3 -c "print(int($MB*8*1024*1024/$DUR/1000 - 128 - 20))")
TMP=$(mktemp -d)
ffmpeg -loglevel error -y -i "$IN" -c:v libx264 -preset slow -b:v ${VK}k -pass 1 -passlogfile $TMP/fitlog -an -f mp4 /dev/null
ffmpeg -loglevel error -y -i "$IN" -c:v libx264 -preset slow -b:v ${VK}k -maxrate $((VK*2))k -bufsize $((VK*4))k -pass 2 -passlogfile $TMP/fitlog -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$OUT"
rm -rf "$TMP"
python3 -c "import os,sys; print(f'{sys.argv[1]}  {float(sys.argv[2]):.1f}s  {os.path.getsize(sys.argv[1])/1048576:.2f} MB  (video {sys.argv[3]}k)')" "$OUT" "$DUR" "$VK"
