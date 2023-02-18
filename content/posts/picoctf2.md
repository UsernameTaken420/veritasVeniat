---
title: "Diving into picoCTF: part 2"
date: 2023-02-18T12:33:04-03:00
draft: false
tags:
- CTF
- picoCTF
- security
---

In which I continue through the General Skills section of picoCTF

<!--more-->

## Static isn't always noise

The challenge begins with the text "Can you look at the data in this binary: static? This BASH script might help!" and a link 
to the two files: a binary file titled `static` and a bash script titled `ltdis.sh`.

### Rushing into it

Straight up executing the static binary we get the output `Oh hai! Wait what? A flag? Yes, it's around here somewhere!`, given it 
seems to be a pre-made response, maybe there's some other string inside the file? Running the binary through the strings 
program as `strings static` reveals the flag, right under the output string!

### Leftovers

This, of course, was slightly underwhelming given we didn't get to use the provided bash script, so maybe let's give that a go...

Executing the bash file returns

```
Attempting disassembly of  ...
objdump: 'a.out': No such file
objdump: section '.text' mentioned in a -j option, but not found in any input file
Disassembly failed!
Usage: ltdis.sh <program-file>
Bye!
``` 
revealing the script will attempt a disassembly of the target binary. Executing as `./ltdis.sh static` gives us

```
Attempting disassembly of static ...
Disassembly successful! Available at: static.ltdis.x86_64.txt
Ripping strings from binary with file offsets...
Any strings found in static have been written to static.ltdis.strings.txt with file offset
```
so we get a diassembly of the program on `static.ltdis.x86_64.txt` and the output of putting the program through `strings` as we 
did earlier on `static.ltdis.strings.txt`. Case closed!

## Magikarp Ground Mission

Another simple challenge, consisting of booting up an instance and `ssh`ing into it, then looking around the filesystem for pieces 
of the flag.

## The heat trilogy: Let's warm up, Warmed up and 2Warm

These challenges consisted of shifting values from hex to decimal, binary and ASCII, decent for getting the hang of what each looks 
like (plus you can do the binary with your fingers).

## Strings it

Another binary file, calling `strings` on it returns a ridiculous number of lines, which gets trumped by piping the output to grep like 
`strings strings | grep picoCTF`.

## I can fix them: fixme1.py and fixme2.py

These two consisted of downloading python files and fixing the syntax error within, first one had extra whitespace (which invokes a 
syntax error in python) and the second used `=` for a comparison instead of `==`.

## Glitched Cat

We are instructed to `nc` into an address, but are warned that the flag-printing service is glitched, returning 
`'picoCTF{gl17ch_m3_n07_' + chr(0x61) + chr(0x34) + chr(0x33) + chr(0x39) + chr(0x32) + chr(0x64) + chr(0x32) + chr(0x65) + '}'`.

Recognizing the `chr()` function, we print the output through python by `python3 -c "print('picoCTF{gl17ch_m3_n07_' + chr(0x61) + chr(0x34) + chr(0x33) + chr(0x39) + chr(0x32) + chr(0x64) + chr(0x32) + chr(0x65) + '}')"` 
and obtain our flag.
