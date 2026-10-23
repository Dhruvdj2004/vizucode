"""Record one TTS clip to a 48 kHz mono WAV.

Uses macOS `say` when it exists (local Mac), otherwise Microsoft Edge neural TTS via the `edge-tts`
package (Linux / cloud sessions). Force one with VO_ENGINE=say|edge.

Voice names: Aman / Tara / Rishi are the Mac voices. On edge they map to Indian-English neural voices
(Aman, Rishi -> en-IN-PrabhatNeural, Tara -> en-IN-NeerjaNeural); any full edge voice name also works.
Rate is in words per minute like `say -r` (165 = student-friendly, 180 = brisk).

Pitch (optional, default 1.0): >1 raises the pitch without changing speed, e.g. 1.2 turns an adult voice
into a cartoon-kid voice (the storybook characters use this).

With edge-tts, exact word timings are also written to <out>.words.json as [[start, end], ...] in seconds
(one pair per whitespace-separated word of the text, the same format the storybook reels read).

Usage: python3 tts.py <out.wav> <voice> <rate> <text> [--pitch 1.2]
"""
import json, os, shutil, subprocess, sys, tempfile

EDGE_VOICES = {'aman': 'en-IN-PrabhatNeural', 'rishi': 'en-IN-PrabhatNeural', 'tara': 'en-IN-NeerjaNeural'}
EDGE_BASE_WPM = 170   # edge voices at +0% speak roughly this fast
EDGE_SPEED = 1.4      # user preference: edge voice 1.4x faster than its natural pace (say rate 165 -> +36%)


def edge_record(out_mp3, voice, rate, text):
    """Synthesize with edge-tts; returns word boundaries as [(start_s, end_s, word), ...].

    edge-tts verifies TLS with certifi's bundle only. Behind a proxy that re-signs TLS (cloud sessions),
    add the proxy's CA so verification still passes."""
    import certifi
    extra = [p for p in (os.environ.get('SSL_CERT_FILE'), os.environ.get('REQUESTS_CA_BUNDLE'),
                         os.environ.get('NODE_EXTRA_CA_CERTS'), '/root/.ccr/ca-bundle.crt') if p and os.path.isfile(p)]
    if extra:
        bundle = os.path.join(tempfile.mkdtemp(), 'ca.pem')
        with open(bundle, 'w') as out:
            for p in [certifi.where()] + extra:
                out.write(open(p).read() + '\n')
        certifi.where = lambda: bundle   # must happen before edge_tts is imported
    import asyncio, edge_tts

    async def run():
        words = []
        comm = edge_tts.Communicate(text, voice, rate=rate, boundary='WordBoundary')
        with open(out_mp3, 'wb') as f:
            async for chunk in comm.stream():
                if chunk['type'] == 'audio':
                    f.write(chunk['data'])
                elif chunk['type'] == 'WordBoundary':
                    s = chunk['offset'] / 1e7
                    words.append((s, s + chunk['duration'] / 1e7, chunk['text']))
        return words
    return asyncio.run(run())


def align(text, bounds):
    """Map edge word boundaries onto the text's whitespace words (punctuation-only tokens and
    split words like "LeetCode's" differ between the two), giving one [start, end] per text word."""
    import re
    toks = text.split()
    if not bounds:
        return []
    out, j = [], 0
    for tok in toks:
        bare = re.sub(r'[^\w]', '', tok).lower()
        if not bare or j >= len(bounds):   # punctuation-only token, or ran out: reuse the last time
            last = out[-1][1] if out else bounds[0][0]
            out.append([last, last]); continue
        s, e = bounds[j][0], bounds[j][1]
        acc = re.sub(r'[^\w]', '', bounds[j][2]).lower(); j += 1
        while acc != bare and len(acc) < len(bare) and j < len(bounds):   # one text word, several boundaries
            acc += re.sub(r'[^\w]', '', bounds[j][2]).lower(); e = bounds[j][1]; j += 1
        out.append([round(s, 3), round(e, 3)])
    return out


def engine():
    forced = os.environ.get('VO_ENGINE')
    if forced:
        return forced
    return 'say' if shutil.which('say') else 'edge'


def record(out_wav, voice, rate, text, pitch=1.0):
    rate = int(rate)
    pitch = float(pitch)
    tmp = tempfile.mkdtemp()
    bounds = None
    try:
        if engine() == 'say':
            src = os.path.join(tmp, 'clip.aiff')
            subprocess.run(['say', '-v', voice, '-r', str(rate), '-o', src, text], check=True,
                           stdin=subprocess.DEVNULL)
        else:
            src = os.path.join(tmp, 'clip.mp3')
            ev = EDGE_VOICES.get(voice.lower(), voice)
            pct = round((rate / EDGE_BASE_WPM * EDGE_SPEED - 1) * 100)
            bounds = edge_record(src, ev, f'{pct:+d}%', text)
        af = ['-af', f'aresample=48000,asetrate=48000*{pitch},aresample=48000,atempo={1 / pitch:.5f}'] if pitch != 1.0 else []
        subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', src, '-ar', '48000', '-ac', '1']
                       + af + [out_wav], check=True)
        if bounds:
            with open(os.path.splitext(out_wav)[0] + '.words.json', 'w') as f:
                json.dump(align(text, bounds), f)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    args = sys.argv[1:]
    pitch = 1.0
    if '--pitch' in args:
        i = args.index('--pitch'); pitch = args[i + 1]; del args[i:i + 2]
    if len(args) < 4:
        sys.exit(__doc__)
    record(args[0], args[1], args[2], ' '.join(args[3:]), pitch)
