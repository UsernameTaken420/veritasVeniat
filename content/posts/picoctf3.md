---
title: "Diving into picoCTF: part 3"
date: 2023-02-18T16:09:57-03:00
draft: false
tags:
- CTF
- picoCTF
- security
---

Jumping over to the Web Exploitation category for a change

<!--more-->

## GET aHEAD

We are presented with this beautiful piece of color contrast-having design:

![](/colors.PNG)

Seems like pressing the "red" button turns the background red while "blue" makes it blue, amazing.
The challenge names gives me two ideas: look at the html's `<head>` and use the HEAD HTTP method.

### `<head>` empty

There was nothing interesting there.

### No thoughts

Throwing a `curl --head http://mercury.picoctf.net:21939/` was indeed the correct answer.

## Cookies

Next up is a challenge titled after the very thing we're going to be messing with: cookies.

Inputting the prefilled answer to the form reveals the stored cookie to become `"name=0"`, figuring this 
is going to take a while, we set up Burp Intruder to try all values from 0 to 100...

| value | response code |
| --- | --- |
| 0 | 302 |
| 1 | 200 |
| 2 | 200 |
| ... | ... |
| 28 | 200 |
| 29 | 302 |
| ... | ... |

So we can figure out the existing cookie values are between 1 and 28 including, we start browsing through them, until 
one of them looks a bit different from the others. Looking at the response sizes, `18` seems to stand out, and trying 
it ourselves by editing the document's cookie on the console returns the flag to the challenge.

## Insp3ct0r

This challenge has us looking through the page's HTML, CSS and js to obtain pieces of the flag commented inside, a step 
down in difficulty compared to the last one.

## Scavenger Hunt

This one takes after Insp3ctor, starting with looking at the HTML and CSS for smaller pieces of the flag. A look at the js 
reveals the question "how do I stop google from indexing my website?", this nods us in the direction of the `robots.txt` file, 
which contains another piece and the clue "I think this is an apache server... can you Access the next flag?".

A quick google search later and we find the Apache configuration is stored in `.htaccess`, which turns out to be correct, awarding 
us another piece of the flag and the tip "I love making websites on my Mac, I can Store a lot of information there.".

To my memory, the one standout thing from working on macs is the `.DS_Store` file, which indeed gives us the last piece of the flag!
