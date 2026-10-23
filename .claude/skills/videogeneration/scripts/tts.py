"""Record one TTS clip to a 48 kHz mono WAV.

Uses macOS `say` when it exists (local Mac), otherwise Microsoft Edge neural TTS via the `edge-tts`
package (Linux / cloud sessions). Force one with VO_ENGINE=say|edge.

Voice names: Aman / Tara / Rishi are the Mac voices. On edge they map to Indian-English neural voices
(Aman, Rishi -> en-IN-PrabhatNeural, Tara -> en-IN-NeerjaNeural); any full edge voice name also works.
Rate is in words per minute like `say -r` (165 = student-friendly, 180 = brisk).

Usage: python3 tts.py <out.wav> <voice> <rate> <text>
"""
import os, shutil, subprocess, sys, tempfile

EDGE_VOICES = {'aman': 'en-IN-PrabhatNeural', 'rishi': 'en-IN-PrabhatNeural', 'tara': 'en-IN-NeerjaNeural'}
EDGE_BASE_WPM = 170   # edge voices at +0% speak roughly this fast
EDGE_SPEED = 1.4      # user preference: edge voice 1.4x faster than its natural pace (say rate 165 -> +36%)


def engine():
    forced = os.environ.get('VO_ENGINE')
    if forced:
        return forced
    return 'say' if shutil.which('say') else 'edge'


def record(out_wav, voice, rate, text):
    rate = int(rate)
    tmp = tempfile.mkdtemp()
    try:
        if engine() == 'say':
            src = os.path.join(tmp, 'clip.aiff')
            subprocess.run(['say', '-v', voice, '-r', str(rate), '-o', src, text], check=True)
        else:
            src = os.path.join(tmp, 'clip.mp3')
            ev = EDGE_VOICES.get(voice.lower(), voice)
            pct = round((rate / EDGE_BASE_WPM * EDGE_SPEED - 1) * 100)
            subprocess.run([sys.executable, '-m', 'edge_tts', '--voice', ev, f'--rate={pct:+d}%',
                            '--text', text, '--write-media', src], check=True, stdout=subprocess.DEVNULL)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-ar', '48000', '-ac', '1', out_wav],
                       check=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    record(sys.argv[1], sys.argv[2], sys.argv[3], ' '.join(sys.argv[4:]))
