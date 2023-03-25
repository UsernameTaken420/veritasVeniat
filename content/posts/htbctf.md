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

Out of these, I'd like to highlight the ones that took the most mental effort or were just plain more engaging than the rest.

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

## Roten

> The iMoS is responsible for collecting and analyzing targeting data across various galaxies. The data is collected through their webserver, which is accessible to authorized personnel only. However, the iMoS suspects that their webserver has been compromised, and they are unable to locate the source of the breach. They suspect that some kind of shell has been uploaded, but they are unable to find it. The iMoS have provided you with some network data to analyse, its up to you to save us.

Our material for this challenge is a .pcap file with just above 19k requests, time to get digging.

First order of business is to sort through the requests for the juicy bits, for this the `http.request.method` filter will be our friend.

### Missing the forest for the trees

Filtering for the `GET` requests, we can spot how they start normally, with the adversary going through the normal flow of the website, then at one point begin fuzzing for a specific file.
![](/for_1_3.PNG)

After they find it (which we see because of the request receiving a response code of 200), they start appending some query parameters to the URL, in particular `dir` and `cmd`.
![](/for_1_4.PNG)

From looking at the requests pointed at the malicious file, we can gather:
- the file is executed as user `www-data`
- the current folder has `aus-map.pdf`, `asia-map.pdf` and the malicious `galacticmap.php`
- the user can `ls` the `/` folder

But just looking at these requests is not enough to point us to the flag.

### Going POSTal

Looking for the `POST` requests made, we spot a grand total of 9 of them. 
![](/for_1_1.PNG)

Browsing through the contents of the most suspicious one, we see a .php file being submitted.
![](/for_1_2.PNG)

Taking a peep at the code does not reveal much, since it appears to be obfuscated.
![](/for_1_5.PNG)

Trying to run it in the console with `php`, we get some actual HTML and a whole lot of PHP Warnings about `eval()`
![](/for_1_6.PNG)

Throwing the file into vim and mass-replacing the `eval()` for `echo()` lets us execute the php file with no warnings, revealing the flag hidden as a comment.
![](/for_1_7.PNG)

## Passman

> Pandora discovered the presence of a mole within the ministry. To proceed with caution, she must obtain the master control password for the ministry, which is stored in a password manager. Can you hack into the password manager?

Stepping into the spawned Docker instance, we find a pretty standard login page, with the one oddity present being the option to register.
![](/web_1_1.PNG)

Intercepting a login request reveals that the website uses a GraphQL to handle the login and that sessions are handled with a JWT token. 
Decoding said token from base64 we find that it contains an `is_admin: 0` parameter, but messing around with it does not net us much success.

Stepping back and focusing on the GraphQL portion, with the help of [hacktricks.xyz](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/graphql) 
we manage to dump the entire GraphQL schema, and among the mutations offered we find `UpdatePassword`.
![](/web_1_2.PNG)

Just calling the mutation as-is confirms that authentication is required, so we register a new account and intercept the first request to a mutation made, replacing the 
target mutation with UpdatePassword and aiming it at the `admin` user. 
![](/web_1_3.PNG)

Then we log out from our test user and try the newly updated admin credentials and... we're in!

## Hijack

## Restricted
