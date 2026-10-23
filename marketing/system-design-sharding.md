# Database Sharding explained with a LIBRARY 📚 | System Design for Beginners, Part 3 (Chintu & Meera)

**File:** `system-design-sharding.mp4` (1920x1080, 30 fps, about 5:18) · **Thumbnail:** `system-design-sharding-thumb.png` (1280x720)

## YouTube title
Database Sharding Explained with a Library 📚 | System Design for Beginners

Other titles:
- Why One Database Isn't Enough: Sharding for Beginners
- Shards, Shard Keys, Range vs Hash and Hot Spots in 5 Minutes (Cartoon Explainer)

## Description
Chintu's food app went viral and his one poor database is sweating. Meera explains how big apps stay fast with database sharding, using a library that splits its books across rooms.

In this video:
- Vertical scaling (one bigger machine) vs horizontal scaling (many normal machines)
- The library trick: books split into rooms A-F, G-M, N-S, T-Z
- Shards, the shard key, and the router that sends each query to the right shard
- Range-based vs hash-based sharding: hash(user_id) % 4
- Hot spots: too many users starting with "A", or one celebrity with millions of fans
- The costs: cross-shard queries, tricky joins, re-sharding and consistent hashing
- Real apps: Instagram user data split by user ID, chat apps like WhatsApp split by user
- A 3-question mini quiz at the end. Can you get all three?

Practise system design and DSA visually on https://vizucode.site
Follow @vizucode26 for more.

Series: Part 1 Caching · Part 2 CDN · Part 3 Sharding · Next: Message Queues.

#systemdesign #sharding #database #scaling #beginners #programming #vizucode

## Chapters
```
0:00 Why is my app slow?
0:32 Just buy a bigger machine? (vertical vs horizontal)
1:03 The library trick
1:39 Shards, shard key & router
2:11 Range vs hash (and hot spots)
3:05 The costs + real apps
3:55 Recap: 4 key words
4:14 Mini quiz
4:58 Outro
```

## Quiz answers
1. **A book called "Mango". Which room: A-F, G-M, N-S or T-Z?** **G-M**, because M falls in that range.
2. **We shard by user_id % 4. Which shard gets user ID 10?** **Shard 2**: 10 divided by 4 leaves a remainder of 2.
3. **One shard is on fire while the others are chilling. What is that called?** A **hot spot**. Fix it with a better shard key, such as a hash.

## Credits
Characters: Chintu and Meera (original VizuCode characters). The voices are edge-tts Indian-English neural voices (Prabhat for Chintu and Neerja for Meera), pitch-shifted to sound like kids. The music and sound effects are synthesized.
