---
title: "Cyber Apocalypse 2023 Writeup"
date: 2023-03-25T13:38:00-03:00
draft: true
tags:
- CTF
- Hackthebox
---

Having had the chance to participate in Hackthebox's 2023 Cyber Apocalypse CTF event, I saw it fit to 
make a writeup for the challenges I managed to solve and explain the pitfalls encountered along the way.

<!--more-->

Final list of solved challenges on my end was:
- [PWN] Initialise Connection
- [PWN] Questionnaire
- [PWN] Getting Started
- [Web] Trapped Source
- [Web] Gunhead
- [Web] Drobots
- [Web] Passman
- [Web] Orbital
- [Reversing] Shattered Tablet
- [Reversing] She Shells C Shells
- [Reversing] Needle in a Haystack
- [Misc] Persistence
- [Misc] Hijack
- [Misc] Restricted
- [Crypto] Ancient Encodings
- [ML] Reconfiguration
- [Forensics] Plaintext Treasure
- [Forensics] Alien Cradle
- [Forensics] Extraterrestrial Persistance
- [Forensics] Roten
- [Forensics] Packet Cyclone

Out of these, I'd like to highlight the ones that took the most mental effort.

## Shattered Tablet

> Deep in an ancient tomb, you've discovered a stone tablet with secret information on the locations of other relics. However, while dodging a poison dart, it slipped from your hands and shattered into hundreds of pieces. Can you reassemble it and read the clues?

Jumping into the challenge, we receive a compressed executable file with the flag (assumedly) hidden inside.

As a first step, we run `strings` and `readelf` on the file to check for anything that stands out but no luck.

Trying to execute the program, we are asked for input on what the tablet says, so it's probably comparing our input to the actual flag.
![](/rev_1_1.PNG)

Throwing the executable into Ghidra, we find tha the `main()` function takes the input and compares it to the flag character by character... but out of order.
![](/rev_1_2.PNG)

Paying attention to the order of comparisons, we spot the initial characters of the flag (`HTB{`) as `local_48`, `local_48._1_1_`, `local_48._2_1_` and `local_48._3_1_`. 
Manually continuing this process until we have what we assume to be the flag, we try the resulting string as input and... it's correct!

![](/rev_1_3.PNG)
