---
title: "Diving into picoCTF: part 3"
date: 2023-02-18T16:09:57-03:00
draft: false
tags:
- CTF
- picoCTF
- security
- web exploitation
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

## Who are you?

Another entertaining one to recapitulate on the basics, first step is accessing the given url and... we are immediately met 
with "Only people who use the official PicoBrowser are allowed on this site!", easy enough to circumvent, just need to `curl` the 
website with `-H "User-agent: PicoBrowser"` and we're in, right?

### Not yet

We're now shown "I don't trust users visiting from another site.". Cryptic, but I think I get what it's going for, we 
could probably pretend we're visiting from the same site with `--referer [URL]` and this nets us our next clue: "Sorry, this site only worked in 2018.".

HTTP date headers are an easy enough thing, just throw in that good old -H "Date: Tue, 15 Nov 2018 08:12:31 GMT".

### A Hydra with too many headers

Up ahead, we've got the first clue that calls for some actual googling, "I don't trust users who can be tracked.". Simple enough, 
there is such a thing as `-H "DNT: 1"` which stands for Do Not Track, apparently.

Our cryptic next clue, and the one that took me the longest to figure out, is "This website is only for people from Sweden.". This 
sent me on a fool's errand of trying different approaches:

1) Try to dig up a relevant HTTP header to include the country code, such as `X-Country-Code`, `Country` or `User-Origin-Countrycode`
2) `X-Language`, `Accept-Language` and `Content-Language` for `se`, `sv` and `sv-SE`.
3) Attempt to use a swedish website as `Host: [site url]`

In the end, after a bunch of attempts, I turned to look at headers that could let me use an IP address and settled on taking a random 
address from Sweden and passing it through `-H "X-forwarded-for: [swedish IP]"`. In the end, this was the correct solution, but I did 
gain some experience in looking at lists of valid HTTP headers that might be considered uncommon.

### Getting tack-y

My patience already wearing thin, I looked at what I hoped would be the last clue: "You're in Sweden but you don't speak Swedish?"

**facepalm**

One `-H "Accept-Language: sv"` and we were in, the flag ripe for the taking!
