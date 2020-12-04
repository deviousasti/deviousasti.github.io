---
title: "Naming of generic parameters in F#"
date: 2019-01-31
description: "and why are there numbered generic types"
tags: [fsharp, types]
featured_image: "/images/fsharp.jpg"
categories: dev
comment : false
---

F# would like to name the first inferred parameter `'a`, then `'b`, `'c` and so on. If it's in use, it will be suffixed with 0..n. Let's look at an example:

    let fn a b c d e f g h = () 
    //a:'a -> b:'b -> c:'c -> d:'d -> e:'e -> f:'f -> g:'g -> h:'h -> unit

So if you constrain `a` to something, it'll start naming from the next unconstrained parameter - `b` onwards.

    let fn (a : 'fst) b c d e f g h = ()
    //a:'fst -> b:'a -> c:'b -> d:'c -> e:'d -> f:'e -> g:'f -> h:'g -> unit

When you constrain `b`, it will have the same sequence, but skip `b`, because we named it.

    let fn a (b : 'snd) c d e f g h = ()
    //a:'a -> b:'snd -> c:'b -> d:'c -> e:'d -> f:'e -> g:'f -> h:'g -> unit

So what happens when you manually constrain with a name in the series? It's about to go from `'a` to `'b`, sees `'b` already in use, so uses a `'b0` instead.

    let fn a (b : 'b) c d e f g h = ()
    //a:'a -> b:'b -> c:'b0 -> d:'c -> e:'d -> f:'e -> g:'f -> h:'g -> unit

This sequence will continue - if `'b0` is in use, `'b1` is chosen.

    let fn a (b : 'b) (c: 'b0) d e f g h = ()
    //a:'a -> b:'b -> c:'b0 -> d:'b1 -> e:'c -> f:'d -> g:'e -> h:'f -> unit