---
title: "Blogstack"
date: 2023-07-27T23:50:31-03:00
draft: false
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

### Stuff that should be eradicated from the web

Another important step in lobotomizing the default fuji template was to remove any and all mentions of Google Analytics, Adsense and Disqus. I do not want those features nor need them taking up space.

### JSON-LD

After reading [this csvbase article on The Semantic Web](https://csvbase.com/blog/13) I felt inspired to add JSON-LD to every post, if anything to make sure they're displayed correctly on Mastodon, this was an interesting excercise as the resulting `<script>` block in `head.html` amounts to the following:
```html
<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"headline": {{ .Title }},
		"description": {{ if .Summary }}{{ trim (.Summary | plainify) "\n" }}{{ else }}{{ .Site.Params.description }}{{ end }},
		"url": {{ printf "%s" .Permalink  }},
		"author": {
			"@type": "Person",
			"name": {{ if .Params.author }}{{ .Params.author }}{{ else }}{{ .Site.Params.author }}{{ end }},
			"email": "ngabin1999@gmail.com"
			"url": "https://www.veritasveniat.com/about/"
		}
		"datePublished": {{ .PublishDate }}
	}
</script>
```
It took a few tries but I got it working in the end! I'll get to `<meta>` tags at some other point...

## Issues still to be resolved

### Images

To this day, images are stored uncompressed in the same github repository that holds the entire site, this means that every time a post is loaded, any images within are sent to the user uncompressed and unoptimized, potentially resulting in slower load times (and higher bandwith use).

On this front I'm currently considering storing compressed versions of the images on an S3 instance, in order to keep in line with every part of the stack being on AWS (and not depending on something like Imgur not deleting stale images).

## Stuff I'd like to add

Mostly based around [This post](https://jamesg.blog/2024/02/19/personal-website-ideas/), I found 46, 81 and 84 to be really interesting. Given this site is created from a heavily-mutilated template, I'd like to see what it'd take to implement hovercards (sidenotes are cute, but not quite necessary).
