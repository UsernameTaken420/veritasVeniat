---
title: "Getting into Modding: Caves of Qud"
date: 2023-04-18T21:21:32-03:00
tags:
- modding
---

Being a long-time player of roguelikes, I figured it was about time to dip my toes into the modding 
community for one of the games I've played the most and that (supposedly) boasts good modding capabilities.

And so began my fight against [Caves of Qud](https://www.cavesofqud.com/), XML and even my own file system.

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

`Inherits` is probably the most useful attribute on this snippet, and is something those of you familiar with OOP 
will already be familiar with: it sets the given Object as a parent for this one, meaning it inherits the entire 
body plan from the parent to use as a base.

## Oh, Worm?

So for context, what I'm trying to make here is the popular [Sliver](https://mtg.fandom.com/wiki/Sliver) creature 
type from Magic: the Gathering. In particular, I'm trying to see if I can modify the base game's "Swarmer" quality 
(which gives a creature bonus to hit if there's more related creatures with Swarmer around) into the slivers' ability-sharing, 
in particular relating it to the game's mutation system.

Next up we begin building our creature's particularities:

```xml
<object Name="sleepy_baseSliver" Load="Load" Inherits="BaseWorm">
        <part Name="Render" DisplayName="Fragment" ColorString="&amp;w" RenderLayer="10" RenderIfDark="false" RenderString="G" DetailColor="c" Tile="Creatures/sw_sliver.png" ></part>
        <part Name="Brain" Hostile="true" Factions="Fragments"></part>
        <part Name="Description" Short="A sort of floating annelid, with an appendage splitting off at the abdomen. It appears to be looking for others like itself." />
        <part Name="Corpse" CorpseChance="30" CorpseBlueprint="Fragment Corpse"></part>
        <stat Name="Strength" sValue="10,1d3,(t)d1" />
        <stat Name="Agility" sValue="12,1d3,(t)d1" />
        <stat Name="Toughness" sValue="12,1d3,(t)d1" />
        <stat Name="Intelligence" sValue="10,1d3,(t)d1" />
        <stat Name="Willpower" sValue="8,1d3,(t)d1" />
        <stat Name="Ego" sValue="6,1d3,(t)d1" />

        <inventoryobject Blueprint="Fragment_Beak" Number="1" />
        <skill Name="Tactics" />
        <skill Name="Axe" />
        <skill Name="Axe_Cleave" />

        <inventoryobject Blueprint="Fragment_Talon" Number="1" />
        <skill Name="Tactics" />
        <skill Name="Dagger" />

        <part Name="Swarmer" />
        <property Name="Role" Value="Minion" ExtraBonus="1"/>

        <intproperty Name="Bleeds" Value="1" />
```

- `Brain` is there so we can set it to be hostile to the player by default and assign it its own faction
- `Stats` allow us to, well, set the base stats for our creature as a base number and an added dice roll
- `InventoryObject` and `skill`s are what we'll use to define the creature's Natural Weapons (so weaponised bodyparts)
- `Swarmer` is going to be our brainchild 

## Result

![](/sliver.PNG)

The entire code is over at [Github](https://github.com/UsernameTaken420/sleepy_Sliver)
