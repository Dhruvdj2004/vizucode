"""Verify every vo/<key>.wav really says its lines.txt text (catches garbled / wrong-language TTS).
Re-records bad clips with the same TTS as make_vo.sh (up to 4 tries).
Usage: <python with openai-whisper> check_vo.py <workdir> [voice] [rate]
(on the Mac: /opt/miniconda3/bin/python; in the cloud: run setup_cloud.sh --whisper first)"""
import sys, os, re, difflib, whisper
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tts
work = sys.argv[1]; voice = sys.argv[2] if len(sys.argv) > 2 else 'Aman'; rate = sys.argv[3] if len(sys.argv) > 3 else '180'
vo = os.path.join(work, 'vo')
model = whisper.load_model('base')
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def words(n):
    n = int(n)
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
    return ' '.join(ONES[int(d)] for d in str(n))   # 739 -> seven three nine (we write such ids digit by digit anyway)
def norm(s):
    s = re.sub(r'\d+', lambda m: ' ' + words(m.group()) + ' ', s.lower().replace('-', ' '))
    s = s.replace('bob', 'pop').replace('leet code', 'leetcode').replace('lead code', 'leetcode')
    return re.sub(r'[^a-z ]', ' ', s).split()
def score(key, text):
    r = model.transcribe(os.path.join(vo, key + '.wav'), language='en', fp16=False)
    a, b = norm(text), norm(r['text'])
    wr = difflib.SequenceMatcher(None, a, b).ratio()
    cr = difflib.SequenceMatcher(None, ''.join(a), ''.join(b)).ratio()   # letter-level: 'a b c' vs 'abc'
    return max(wr, cr), r['text'].strip()
def record(key, text):
    tts.record(os.path.join(vo, key + '.wav'), voice, rate, text)
bad = []
for line in open(os.path.join(vo, 'lines.txt')):
    if '|' not in line or line.startswith('#'): continue
    key, text = line.strip().split('|', 1)
    for attempt in range(5):
        sc, heard = score(key, text)
        if sc >= 0.75: break
        print(f'  {key}: BAD ({sc:.2f}) heard: {heard!r} -> re-recording', flush=True)
        record(key, text)
    print(f'{key:8s} {sc:.2f} {"OK" if sc >= 0.75 else "STILL BAD"}', flush=True)
    if sc < 0.75: bad.append(key)
sys.exit(1 if bad else 0)
