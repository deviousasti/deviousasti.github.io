---
title: "Daisy chains in Altium"
date: 2018-12-21
description: "Easily daisy chain any number of sub-circuits"
tags: [eda, altium]
featured_image: "/images/literal-daisychain.jpg"
categories: eda
comment : false
---

## Why a way to daisy-chain?

If you wanted to daisy chain any component the conventional way, say a bunch of WS2812s on your board, you'd be making multiple instances and manually wiring them to each other.

{{< figure src="/images/notimefordat.jfif">}}

## Steps
1.  Make a sub-sheet out of the components you want to daisy chain (unless it's not in one already). 
2.  Change the designator of the sheet to `Repeat(name, 1, N)` where `N` is the number of items you want. E.g., `Repeat(SW, 1, 8)`
3.  Change the daisy chain input port to `Repeat(DIN)`and output to `Repeat(DOUT)` - the usual 
5.  Connect `DIN` to a bus with net label `DIN[2..N]`. E.g., `DOUT[2..8]`
6.  Connect `DOUT` to a bus with net label `DOUT[1..N-1]`. E.g., `DOUT[1..7]`
7.  That's it. Just connect the two buses together and you're done.

Your daisy chain's input will be `DIN1` and the output should be `DOUT<N>`. (i.e., `DIN1` and `DOUT8`)

## Example

The final schematic should look something like this:
{{< figure src="/images/altium-daisychain.jpg">}}

- It's not too much effort to set this up.
- You can simply change the values for `N=16` or `N=100` and the daisy chaining will be set up correctly
- Since the sheet is repeated, you can use room commands for laying out and ordering all of them - and you only need to route one of them
- Automation [caveats apply][1].

**Note**

You might need to place a `NOERC` on the output with "nets containing multiple names", because technically `DIN(N)` is connected to `DOUT(N+1)`


[1]: https://xkcd.com/1319/