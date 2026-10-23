# Storybook characters: Chintu & Meera

The reusable cast for VizuCode's storybook (system design for beginners) videos. Both characters use the same
rig, so they match in proportions, line weight and style. Import them; don't copy them into each reel.

- **Chintu**: naughty, funny, always-hungry boy. He wears an orange `</>` t-shirt with navy shorts and has a spiky
  dark hair tuft. He asks the "silly" questions viewers secretly have. Caption colour `CHINTU_COL` (orange).
- **Meera**: calm, smart girl who explains with everyday analogies. She has dark hair with a side-swept fringe and
  two short pigtails with teal clips, a violet top with a white collar and a `{ }` mark, a teal skirt, teal shoes
  and eyelashes. Caption colour `MEERA_COL` (teal).

## Import

```python
import os, sys
K = os.environ['VIDEOGEN_K']                       # .claude/skills/videogeneration
sys.path.insert(0, os.path.join(K, 'scripts'))
import engine as E
from engine import *
sys.path.insert(0, os.path.join(K, 'examples', 'storybook-characters'))
from characters import chintu, meera, Cast, INK, PAPER, CHINTU_COL, MEERA_COL
```

## Draw

```python
# (cx, cy) = head centre, s = scale (head radius 110*s; the figure spans cy-155*s .. cy+360*s), t = seconds
chintu(dl, 250, 520, 0.85, t, talk=0.6, point=(700, 500), mood='happy')
meera(dl, 1670, 520, 0.85, t, wave=True, look=(-1, 0))
```

Keyword arguments (both characters):

| arg | meaning |
|---|---|
| `talk` 0..1 | mouth opening (voice amplitude) |
| `wave` | right hand waves |
| `point=(x, y)` | points at a spot, using the hand on that side |
| `mood` | `happy`, `shock`, `think`, `sad`, `laugh` |
| `look=(dx, dy)` | pupil direction, each -1..1 |
| `nod` 0..1 | listener nod |
| `bounce` 0..1 | speaker hop |
| `walk=phase` | legs swing and the body bobs (pass the current time while walking) |
| `alpha` | fade |

## Who is talking

After `E.finish()`, `Cast` reads the voiceover (keys prefixed `chintu_...` / `meera_...`, see `vo/voices.txt`):

```python
CAST = Cast(('chintu', 'meera'))
CAST.draw('chintu', dl, 250, 520, 0.85, point=(700, 500))   # talk, bounce (speaker) and nod (listener) are automatic
CAST.speaker()      # 'chintu' | 'meera' | None at E.NOW
```

Tip: draw the characters from your `E.header` override, not from the scene functions. The engine fades the scene
layer at each cut, but the header is drawn after that fade, so the characters stay solid between chapters.
Example: the caching video (`marketing/system-design-caching.md`) uses this layout at 1920x1080:
Chintu at (250, 520, 0.85), Meera at (1670, 520, 0.85), diagram in x 470..1450, captions at y 985.
