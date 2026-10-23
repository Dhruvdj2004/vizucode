import subprocess, sys, os
V = sys.argv[1]
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
for line in open(f'{V}/lines.txt'):
    if '|' not in line: continue
    k, txt = line.strip().split('|', 1)
    exp = len(txt) / 14.5
    best = None
    for i in range(6):
        p = f'{V}/raw/{k}.try{i}.aiff'
        subprocess.run(['say', '-v', 'Aman', '-r', '185', '-o', p, txt], stdin=subprocess.DEVNULL, check=True)
        d = dur(p); err = abs(d - exp) / exp
        if best is None or err < best[0]: best = (err, p, d)
        if err < 0.18: break
    subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',best[1],'-af','asetrate=22050*1.2,aresample=48000,atempo=0.95','-ac','1',f'{V}/{k}.wav'], check=True)
    print(f'{k:8s} raw {best[2]:5.2f} exp {exp:5.2f} final {dur(f"{V}/{k}.wav"):5.2f}', flush=True)
