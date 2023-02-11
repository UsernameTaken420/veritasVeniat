---
title: "Diving into picoCTF: part 1"
date: 2023-02-11T15:14:29-03:00
draft: false
tags:
- CTF
- picoCTF
- security
---

# What is picoCTF? (from official website)

picoCTF is a free computer security education program with original content built on a capture-the-flag 
framework created by security and privacy experts at Carnegie Mellon University.

The following are my writeups on the first few "General Skills" challenges.

<!--more-->

## Obedient Cat

A simple challenge worth 5 points, the user downloads a `flag` file which contains the flag in cleartext, 
all just a `cat flag` away.

## Python Wrangling

The user is given the following list of files:

```
ende.py
pw.txt
flag.txt.en
```

Cold-calling the python file reveals the use to be `-d | -e [file]`, attempting to (assumedly) decrypt the 
flag file displays `Enter the password:`. This suggests the user to try `cat pw.txt | python3 ende.py -d flag.txt.en` 
which reveals the flag.
