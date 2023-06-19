---
title: "On utterly failing at CTFs"
date: 2023-06-19T00:07:18-03:00
tags:
- CTF
---

Or how to recover from riding the high of doing good but crashing against practical application

<!--more-->

Three months ago, I took part in Hackthebox's Cyber Apocalypse 2023 CTF and finished feeling in high spirits (see my writeup here), so I signed myself up for the immediate next CTF event, which turned out to be HeroCTF. 

## HeroCTF
In retrospective, the problems with my approach to this event were the following:
1. Not looking deep enough into the problem
2. Not looking outside the box 
3. Giving up too soon

### Not looking deep enough
One such challenge where I could spot symptoms of this problem was thus:

#### Chm0d
> Catch-22: a problematic situation for which the only solution is denied by a circumstance inherent in the problem.  

We SSH into the instance and find an empty folder, climbing back up to the root we see the file `flag.txt` is there, but we can't open it. Looking at the permissions we find...
```shell
----------   1 user user   40 May 12 11:43 flag.txt
```
So we have a file we supposedly own, but have absolutely no permissions for, so we start crossing out our list:
```shell
chmod flag.txt +777
-bash: /bin/chmod: Permission denied
mv flag.txt home/user/flag.txt
mv: cannot move 'flag.txt' to 'home/user/flag.txt': Permission denied
more flag.txt
more: cannot open flag.txt: Permission denied
lsattr
lsattr: Operation not supported While reading flags on ./sys
chown * flag.txt
chown: changing ownership of 'flag.txt': Operation not permitted
chattr +ai flag.txt
chattr: Permission denied while reading flags on flag.txt
cp flag.txt home/user/
cp: cannot open 'flag.txt' for reading: Permission denied
scp flag.txt [my-IP]/home/peridot/flag.txt
cp: cannot open 'flag.txt' for reading: Permission denied
```
Following my writeup so far, you'd be forgiven for thinking this was just the start but... it isn't. After this I could only manage to make a few attempts with other system tools but it never amounted to nothing. And the correct path can be gathered from the following official writeup:

This situation looks like it should be impossible to resolve, thankfully it isn't. We can't change the file permissions on `/bin/chmod` because it's owned by `root` so we'll have to change them on `/flag.txt`.

```shell
user@88265204b262:~$ ls -l /flag.txt /bin/chmod
---------- 1 root root 64448 Sep 24  2020 /bin/chmod
---------- 1 user user    40 May 10 19:36 /flag.txt
```

**The easy way:**

```shell
perl -e "chmod 0755,'/flag.txt'"
```

**Another way:**

```shell
# get a copy of the "chmod" binary from a debian:11 docker image
# (version info found in /etc/os-release)
docker run --rm -it -v $PWD:/app debian:11 cp /bin/chmod /app

# upload it to the server and use it to change the perms
scp -P XXXX chmod user@AAA.BBB.CCC.DDD:
```
In short, narrowing the attempts down to just flag.txt and not taking a look at the tools used for the job resulted in wasting hours attempting to move, copy, etc. the target file. In addition, the idea of bringing in outside binaries never crossed my mind, so that's another mark on the Next Time file.

### Not looking outside the box & Giving up too soon
#### pyjail
> Welcome in jail. If it's not your first time, you should be out quickly. If it is your first rodeo, people have escape before you... I'm sure you'll be fine.

From the name and description, it appears this challenge is based on breaking out of a python shell. We start the instance and are greeted by the usual `>>` of the python shell.

To get a feel for the situation, we try to run a few commands...
```python
>> import sys
An error occured. But which...
>> os.system("ls")
An error occured. But which...
>> os.popen("ls").read()
An error occured. But which...
>> import os
An error occured. But which...
>> print(1+2)
3
```
Seems it's quite harsh on what we can run and not, but then we come across a different response
```python
>> eval
You're trying something fancy aren't u ?
>> execfile('/usr/lib/python2.7/os.py')
You're trying something fancy aren't u ?
>> imp.os.system("ls")
An error occured. But which...
```
Taking a bit of a different path, we try to see what *does* return something different
```python
>> def test(input): return 1
>> print dir(test)
An error occured. But which...
>> print(1/0)
An error occured. But which...
>> print(1/1)
1.0
>> a = "stuff"
>> print(a)
An error occured. But which...
```
So after the fact, I find out that a pyjail is a fairly common type of challenge. In particular, I had started reading an article on python jailbreaks that might have amounted to something. However, after the first few inputs didn't return anything too telling, I dropped the idea.

## Nahamcon CTF 2023
Time skip some weeks and we're at Nahamcon CTF 2023 and immediately in I face a subject I had figured would come up at some point: **JWT**
### Giving up too soon?
#### Marmalade 5
> Enjoy some of our delicious home made marmalade!

On navigating to our generated URL, the user is asked for a username, and attempting to login as `admin` is not allowed.
Logging in, "only the admin can see the flag" is displayed.
The user receives a JWT with the current username encoded and the encoding displayed as MD5_HMAC, attempting to modify it returns `Invalid signature, we only accept tokens signed with our MD5_HMAC algorithm using the secret fsrwjcfszeg*****`
Given most of the work has been cut out for us, I figure I could just make a script to bruteforce the secret, it's just 5 unknown characters after all. Go through each possibility signing our existing JWT with each attempt and comparing to the one we already have.

...except I never got around to it, feeling confident in that bruteforcing it would take a while I left the challenge for the rear end of the CTF, and with life stuff getting in the way ***I never actually did it***.
Putting the life stuff aside, leaving stuff on the over and never coming back to check on it is a surefire way to not get anything done.

All in all, while coming away empty handed from a CTF feels frustrating, reading writeups after the fact and seeing how close you were to solving the problem is an even more frustrating takeaway, signifying you aimed at the right place but *just not enough*.}

## Next target?
This very Friday starts Google's own yearly CTF event, and I plan on taking all my learnings from these past CTFs and giving it an honest go in full force, see you there! 
https://capturetheflag.withgoogle.com/

