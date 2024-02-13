---
title: "Blogstack"
date: 2023-07-27T23:50:31-03:00
draft: true
tags:
- Stack
- Meta
---

Or "How to make putting words in people's screens more complicated than it ought to be"

<!--more-->

## How it started

The first seedling for the wretched growth that would become this site was planted when coming across Luke Smith's video on Hugo. I had already peeped at static site generators such as Jekyll and Gatsby but decided to start by giving Hugo a shot.

{{< youtube id="ZFL09qhKi5I" >}}

### Conceptually

The idea of owning a personal domain has been a point of interest for me for quite a while, both making oneself (and your work!) more visible to interested parties and having a space to explain/rant/showcase interesting stuff felt like a decent enough contribution to the internet.

## How it's going

### The setup

From the get-go, the idea was to have everything from the blog available on [Github](https://github.com/UsernameTaken420/veritasVeniat), so this meant that the code had to be stored there and (if possible) not require any sort of manual steps to cause a site update on commit.

### Minimal AWS knowledge to the rescue

[AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html) turned out to be the answer to my plight, straight-up taking the latest Github commit, running `hugo server` and hosting the result.

### Lord of my domain

Next logical step was, of course, actually purchasing the doman for the site. This was also done through AWS, in particular, AWS Route 53 turned out to be quite intuitive for going through the process.

### It's not green, it's ~Shamrock~

I had already settled on Fuji as my theme of choice for the blog, but I needed to pick a colour scheme that was not only in line with my aesthetic preferences, but also had enough contrast to pass [AA Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) (at least). For this end, I looked through the posts from [random color contrasts](https://botsin.space/@randomColorContrasts) on Mastodon until I found a suitable combination.

## Issues still to be resolved

### Images

To this day, images are stored uncompressed in the same github repository that holds the entire site, this means that every time a post is loaded, any images within are sent to the user uncompressed and unoptimized, potentially resulting in slower load times (and higher bandwith use).

On this front I'm currently considering storing compressed versions of the images on an S3 instance, in order to keep in line with every part of the stack being on AWS (and not depending on something like Imgur not deleting stale images).
