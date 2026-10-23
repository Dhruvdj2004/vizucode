# Caching explained with a FRIDGE 🧀 | System Design for Beginners (Chintu & Meera)

**File:** `system-design-caching.mp4` (1920x1080, 30 fps, about 5:15) · **Thumbnail:** `system-design-caching-thumb.png` (1280x720)

## YouTube title
Caching Explained with a Fridge 🧀 | System Design for Beginners

Other titles:
- Why Apps Are Fast the Second Time: Caching for Beginners
- Cache Hit, Miss, LRU and TTL in 5 Minutes (Cartoon Explainer)

## Description
Why is an app slow the first time you open it and fast the second time? The answer is caching. Chintu (always hungry) and Meera (always calm) explain it with a fridge and a grocery store.

In this video:
- Cache vs database: the small, close fridge vs the far-away store that has everything
- Cache MISS (~200 ms trip to the database) vs cache HIT (~2 ms)
- Eviction and LRU (Least Recently Used): throw out the food you haven't touched for the longest time
- Stale data, TTL (time to live) and cache invalidation
- Cache-aside vs write-through, one sentence each
- Where caches live: browser cache, CDN, Redis / Memcached
- A 3-question mini quiz at the end. Can you get all three?

Practise system design and DSA visually on https://vizucode.site
Follow @vizucode26 for more.

Next video: the CDN, a fridge in every city.

#systemdesign #caching #redis #lru #beginners #programming #vizucode

## Chapters
```
0:00 Why is it fast the second time?
0:23 The fridge vs the grocery store
1:01 Cache hit & cache miss
1:41 Eviction & LRU
2:18 Stale data, TTL & invalidation
3:13 Caches in real life (browser, CDN, Redis)
3:49 Recap: 4 key words
4:12 Mini quiz
5:00 Outro
```

## Quiz answers
1. **The data is not in the cache. Hit or miss?** It's a **miss**: the app has to go to the database.
2. **With LRU, which item goes out (milk used 1 minute ago, apple 1 hour ago, pickle 1 year ago)?** The **pickle**, because it is the least recently used.
3. **A price changed in the database but users still see the old price. What is that called?** **Stale data.** You fix it with a TTL or by invalidating the cache.

## Credits
Characters: Chintu and Meera (original VizuCode characters). The voices are edge-tts Indian-English neural voices (Prabhat for Chintu and Neerja for Meera), pitch-shifted to sound like kids. The music and sound effects are synthesized.
