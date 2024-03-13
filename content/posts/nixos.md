---
title: "NixOS"
date: 2024-02-27T01:49:42-03:00
draft: true
tags:
- NixOS
---

NixOS is, against all prior expectations, pretty cool and intuitive to use.

<!--more-->

### The pitch

NixOS' selling point is, in short, being able to copy your `configuration.nix` file anywhere and have the exact same system (save for any data within), this is immediately attractive to anyone having to set up multiple machines... or people who don't want their unique setup to be lost.

Another thing NixOS allows is fast, painless experimentation by having all the system packages defined in the same place, allowing the user to try a new package and remove it with absolutely no side-effects (sans the need for garbage collection at some point).

### How did the `switch` command go, again?

One of the first things to do when jumping onto the NixOS ship is to define your own personal aliases for the much-used `vim /etc/nixos/configuration.nix` and `nixos-rebuild switch`. In my case, I traded the convenience of short aliases for something I would actually remember:
- `nix-edit='sudo vim /etc/nixos/configuration.nix; sudo cp /etc/nixos/configuration.nix /home/peridot/dotfiles/configuration.nix'`: there is literally no way I'm remembering to update `configuration.nix` in my dotfiles repo, and having it all in one command makes it easier. This is all helped by `wheel`-group users not needing password to use `sudo` thanks to my config.
- `alias nix-refresh='sudo nixos-rebuild switch'`: very easy to remember for me.
- `alias nix-clean='sudo nix-collect-garbage -d'`: some 20 versions in, I started to get "Out of space" errors when doing `nix-refresh`, turned out I was saving all of my previous versions, which were hogging a lot of space.

### The `minecraft-server` problem

At one point, after installing and verifying that `prism-launcher` worked (it did btw), I wanted to try hosting a server locally.

Looking around `nixpkgs`, I found the package `minecraft-server`. Should be simple enough, right? Just add it to `configuration.nix` and call it to start the server, right? ***right???***

"lol", Java said, "lmao". <br/> Or rather: `"Client version (1.20.4) does not match server version (1.20.2)"`.

After racking my brain for a while (and doing some intense googling), I found that the problem came down to the fact that nixpkgs *stable* has the `1.20.2` version of the package, while `1.20.4` can be found on *unstable* nixpkgs.

This posed a question: change everything to unstable just to (maybe) host a minecraft server, or find a way to use just the one package from the unstable list. Luckily for me, this second one was pretty easy.

#### Specifically overriding ONE package

As it usually happens, I was not the first to be faced with this situation, looking through [this thread](https://discourse.nixos.org/t/howto-setting-up-a-nixos-minecraft-server-using-the-newest-version-of-minecraft/3445) I found a setup that does exactly whan I need:

```
  services.minecraft-server = {
    enable = true;
    eula = true; #required

    package = let 
      version = "1.14.3";
      url = # link to server .jar
      sha256 = # server .jar SHA256    
    in (pkgs.minecraft-server_1_14.overrideAttrs (old: rec {
      name = "minecraft-server-${version}";
      inherit version;

      src = pkgs.fetchurl {
        inherit url sha256;
      };      
    }));
  };
```

#### Downside

The one thing I realized is that for every Minecraft update on my `prism-launcher` client, I'm gonna have to re-download the `minecraft-server.jar`, get the SHA256 and replace those values in my `configuration.nix`, which should be quickly fixed by making a script for it.

### These packages, but only here

At one point I realized that if I wanted to use my NixOS computer for programming, I was going to have to be organized about it. My two options were using Flakes (more on that at some point) or `direnv`, and given the apparent complexity of flakes at first glance, I opted for the latter.

With `direnv` you can just declare the packages that you want installed inside a `nix-shell` and said shell will only be active inside the directory that contains the direnv files, resulting in (as I have) a `Python/` directory that contains my version of python of choice and any libraries I declare, but without those being present anywhere else on my system. This has the added benefit of enabling me to have a different directory on my system where I can install a completely different version of python (say `2.x` if I had to do maintenance on older code) and not run into the usual problem of `python` vs `python3`.

The only things needed to make it work are:
- inside `~/.bashrc`: `eval "$(direnv hook bash)"`
- `shell.nix`:
```nix
{ pkgs ? import <nixpkgs> {}}:

pkgs.mkShell {
  packages = [ pkgs.hugo ];
}
```
- `.envrc`: `use nix` (Flakes users would instead have `use flake .` here)
