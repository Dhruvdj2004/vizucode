#!/usr/bin/env bash
# One-time setup for a Linux cloud session: ffmpeg + the Python packages the reel engine needs.
# Safe to re-run. Whisper (for check_vo.py) is optional and large, so it is only installed with --whisper.
set -e
if ! command -v ffmpeg >/dev/null; then
  SUDO=$(command -v sudo >/dev/null && [[ $EUID -ne 0 ]] && echo sudo || true)
  $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg
fi
python3 -m pip install -q --upgrade pillow numpy edge-tts 2>/dev/null \
  || python3 -m pip install -q --break-system-packages --upgrade pillow numpy edge-tts
if [[ "$1" == "--whisper" ]]; then
  python3 -m pip install -q openai-whisper 2>/dev/null || python3 -m pip install -q --break-system-packages openai-whisper
fi
ffmpeg -version | head -1
python3 -c "import PIL, numpy, edge_tts; print('python deps OK')"
