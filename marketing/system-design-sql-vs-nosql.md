# SQL vs NoSQL — System Design for Beginners (Part 6)

**Video:** `system-design-sql-vs-nosql.mp4` (1920x1080, 30 fps, 5:15)
**Thumbnail:** `system-design-sql-vs-nosql-thumb.png` (1280x720)

## YouTube title

SQL vs NoSQL Explained Simply (with a School Register!) | System Design for Beginners #6

## Description

Chintu is building his snack delivery app, Chintu Eats, and his friends can't agree: "Use MySQL!" "No, use MongoDB!" Which one should he pick?

In part 6 of System Design for Beginners, Meera explains SQL and NoSQL databases using a school register and a box of note cards:

- SQL: tables, rows, columns, a fixed schema, relations and JOINs, and ACID transactions (the bank transfer example)
- NoSQL: JSON documents (MongoDB), key-value stores (Redis), wide-column stores (Cassandra) and graph databases (Neo4j)
- Scaling: scale up vs scale out, and why sharding SQL is harder
- When to pick which: payments and banking vs chats, feeds and product catalogues (and why many companies use both)
- A recap table and a 3-question quiz at the end

Practise system design on https://vizucode.site and follow @vizucode26 for part 7!

Series so far: 1 Caching · 2 CDN · 3 Database Sharding · 4 Message Queues · 5 Rate Limiting · 6 SQL vs NoSQL

#systemdesign #sql #nosql #database #mongodb #mysql #programming #beginners #vizucode

## Chapters

```
0:00 The big fight: MySQL or MongoDB?
0:28 School register vs note cards
0:57 SQL: tables, schema, JOINs and ACID
1:50 NoSQL: documents, key-value, wide-column, graph
2:32 Scaling up vs scaling out
3:08 Which one when?
3:47 Recap
4:14 Quiz time
5:00 Thanks for watching
```

## Quiz answers

1. A banking app that moves money: **SQL** (money needs ACID transactions: both steps happen, or neither).
2. A chat app with billions of messages: **NoSQL** (huge, fast data that spreads across many machines).
3. The fixed plan of columns in a SQL table: **the schema**.

## Production notes

- Voices: Chintu = Aman (pitch 1.2), Meera = Tara (pitch 1.12), recorded with edge-tts Indian-English neural voices through `make_vo.sh <work> Aman 165`.
- Render script: `.claude/skills/videogeneration/examples/storybook-sql-vs-nosql/reel.py` (+ `vo/lines.txt`, `vo/voices.txt`). Every timing comes from the clip lengths and `vo/<key>.words.json`.
