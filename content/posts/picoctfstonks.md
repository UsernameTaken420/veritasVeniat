---
title: "Diving into picoCTF: Stonks"
date: 2023-02-11T21:46:00-03:00
draft: false
tags:
- CTF
- picoCTF
- security
- reverse engineering
- binary exploitation
---

# The challenge

The "Stonks" challenge from picoCTF2021 presents us with a binary epxloitation excercise, we are supposed to connect via netcat to an address 
presented to us as `nc mercury.picoctf.net 53437` and we have a downloadable file titled `vuln.c`.

<!--more-->

## Staring at the sauce

Peeping at `vuln.c` and alternatively building it, we see it refuses to function without a file titled `api` in the same directory, then it reads 
from user input whether to display a portfolio or "buy stonks", which prompts the user for an api key.

## The naive attempt

First idea was to throw an excessive amount of characters at any of the steps where user input is taken, this resulted in the program pipe being 
broken after 1025 'a's, executing whatever is typed after said characters on the shell.

![](/whoami.PNG)

Trying this against `nc mercury.picoctf.net 53437` proved futile since the netcat connection breaks as soon as the program exits, but that didn't 
stop me from trying:

1. Setting up an http server and serving the api file
2. `scp`ing the file to my computer
3. Attempting to netcat to a listener on my computer

None of these worked.

## Advanced giving up

So I decided to look up a writeup of the challenge, feeling defeated at the sight of disassembled functions without much of a footing. Luckily, the 
[first writeup I found](https://github.com/HHousen/PicoCTF-2021/blob/master/Binary%20Exploitation/Stonks/README.md) mentioned being based on a solution 
from a different writeup for a different excercise, so I figured reading through that one and trying to extrapolate a solution for this problem could 
be worth a try, which introduced me to the concept of Format Strings

## f"strings?"

The writeup I found suggested hitting the excercise with a bunch of `%p` in order to extract values off the stack (given the api flag is read at one point), 
this results in the user being handed hexadecimal values corresponding to whatever's loaded at the time. 
Searching for the hex encoding of "pico" and correcting for endian-ness (cyberchef's "swap endianness" function) 
results in the flag being output among some garbage characters.

## Learnings

- `printf` is dangerous
- knowing the program uses user input, attempt to print `%p` and `%s` a number of times to verify 
