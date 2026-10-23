# What is a CDN? Explained with Pizza 🍕 | System Design for Beginners (Part 2)

**Video:** `system-design-cdn.mp4` (1920x1080, 30 fps, 5:14, 36 MB) · **Thumbnail:** `system-design-cdn-thumb.png` (1280x720)

## YouTube title
What is a CDN? Explained with Pizza 🍕 | System Design for Beginners #2

## Description
Why does a video start instantly in Delhi when the company's servers are in the USA? Chintu is confused (and hungry), so Meera explains a **CDN (Content Delivery Network)** with a pizza chain: one faraway kitchen vs. local branches near you.

In this episode:
- Origin server vs edge servers (PoPs) around the world
- Why latency drops from ~250 ms to ~20 ms
- Cache miss at the edge (fetch from origin + keep a copy) vs cache hit
- What belongs on a CDN (images, videos, CSS/JS) and what doesn't
- How a CDN protects the origin during traffic spikes (IPL final, big sales)
- TTL (time to live) and purging old files
- Real life: YouTube, Netflix, Instagram; providers like Cloudflare, Akamai, Amazon CloudFront
- Recap + a 3-question quiz

Missed Part 1? Watch **Caching** first. Next up: **Database Sharding**.

Practise system design and DSA visually at https://vizucode.site
Follow @vizucode26 for more.

#systemdesign #cdn #caching #softwareengineering #beginners #vizucode

## Chapters
0:00 The Mystery: how does a video load so fast?
0:28 The Pizza Trick
1:02 Origin vs Edge
1:45 Miss, then Hit
2:27 What Goes on a CDN
2:52 Protecting the Origin
3:11 TTL and Purge
3:34 CDNs in Real Life
3:56 Recap
4:16 Quiz
5:01 Next Up

## Quiz answers
1. What do we call the main server where the original files live? → **The origin server.**
2. Is the very first request at an edge server a cache hit or a cache miss? → **A cache miss.** The edge fetches the file from the origin, then keeps a copy.
3. You changed your logo, but users still see the old one. What do you do? → **Purge it from the CDN** (or wait for its TTL to run out).

## Production notes
- Characters: Chintu (Aman voice, pitch 1.2) and Meera (Tara voice, pitch 1.12), edge-tts Indian-English.
- Render script: `.claude/skills/videogeneration/examples/storybook-cdn/reel.py` (+ `vo/lines.txt`, `vo/voices.txt`).
