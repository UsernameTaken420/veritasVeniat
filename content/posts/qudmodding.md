---
title: "Getting into Modding: Caves of Qud"
date: 2023-04-18T21:21:32-03:00
draft: true
tags:
- modding
---

Being a long-time player of roguelikes, I figured it was about time to dip my toes into the modding 
community for one of the games I've played the most and that (supposedly) boasts good modding capabilities.

And so began my fight against Caves of Qud, XML and even my own file system.

<!--more-->

## Adventures in XML

The first point to understand in making mods for this game is that the entirety of the creatures within are 
defined by way of XML files, from their base stats to their bodyplans and whether they generate a corpse on death.

For my first modding objective, I wanted to add a particular worm-like creature: a Sliver from Magic: the Gathering. 
Such a creature's XML started by looking like this:

```xml
<?xml version="1.0" encoding="utf-8"?>
<objects>
	<object Name="sleepy_Sliver" Load="Load" Inherits="BaseWorm">
	</object>
</objects>
```

The first line defines the XML version to be used in the file and the encoding, standard stuff. Next up we define 
a list of `objects` and immediately start to define an `object` inside (intuitive, huh?).

It is defined in the "modding best practices" section of the game wiki to prefix every modded object name with an 
unique ID, usually the modder's name as an example and as I've done above.

`Load` is an interesting attribute, it dictates how the game will attempt to load the object or table, either 
appending it to an existing one (say, if one wished to add something by default to one of the existing creatures 
in the game) by setting the attribute to `Merge`, which merges everything in the current object with an existing 
one with the same name (and funnily enough, does not instance a new one if such an object does not already exist). 
The other option, used here, is `Load`, which simply instances the object as a new one.
