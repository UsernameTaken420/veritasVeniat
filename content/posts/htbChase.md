---
title: "Hack the Box Challenge - Chase"
date: 2023-05-01T16:10:03-03:00
tags:
- Hackthebox
---

> One of our web servers triggered an AV alert, but none of the sysadmins say they were logged onto it. We've taken a network capture before shutting the server down to take a clone of the disk. Can you take a look at the PCAP and see if anything is up?

<!--more-->

Jump right in and download the PCAP file, then boot up Wireshark.

First order of business is to sort the entries, the PCAP is composed of a total of 216 entries, only 11 of which being HTTP requests (8 GETs, 3 POSTs).

Walking through these requests, it appears the user visits a landing page, uploads something through `/upload.aspx?operation=upload`

![](/Chase1.PNG)

From the looks of it, this appears to set up the adversary to execute commands through `cmd.exe` over Active Server Pages.

First we see it grabs Netcat from an adversary IP and proceeds to run it with the next POST request to establish a reverse shell.

![](/Chase2.PNG)

Finally, right at the bottom of the PCAP we see a GET for an interestingly-named .txt and, feeling our spidey sense tingling, we attempt to see if the name might be an encrypted string and... bingo, there's our flag

![](/Chase3.PNG)
