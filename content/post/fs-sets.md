---
title: "A purely functional definition of Sets"
date: 2019-01-31
description: "...without any data structures"
tags: [fsharp, types]
featured_image: "/images/fsharp.jpg"
categories: dev
comment : false
---

What would a defintion of classic sets in F# look like. These would just be composed of functions, without any underlying data types.

The simplesy defintion of a `Set` is a boundary - everything inside it belongs to the set, everything outside it does not. We can define that membership using a simple function type. 

```ocaml
type 'a Set = 'a -> bool
```

`true` for a value that belongs to the set and `false` otherwise.

For example. the set of natural numbers is:

```fsharp
let nat x = x > 0
```

## contains

Contains just calls our function, but constrains its value to `bool`- which will help out type inference down the line.

```fsharp
let contains value set : bool = set value
```

## empty

A set that contains nothing could never return `true`.

```fsharp
let empty = fun _ -> false
```

## universal

A universal set is a set which contains all objects, including itself. 
For now, our definition does not care about Russel's paradox.

```fsharp
let universal = fun _ -> true
```

## zip

A zip combines two sets with a combinator function.

```fsharp
let zip set1 set2 fn = fun v -> fn (set1 |> contains v) (set2 |> contains v)
```

## union

A set union combines the elements of both sets. We can express this with `zip`:

```fsharp
let union set1 set2 = zip set1 set2 (||) 
```

## intersect

An intersection of two sets only has members which belong in both the sets, or, ANDing.

```fsharp
let intersect set1 set2 = zip set1 set2 (&&) 
```

## filter

```fsharp
let filter fn set1 = zip set1 fn (&&) 
```

and moving on to constructing sets.

## singleton

A singleton set has only one element.

```fsharp
let singleton value = fun v -> value = v
```

## ofList

```fsharp
let ofList list = fun v -> list |> List.contains v
```

# Tests


```fsharp
assert (1 |> FSet.singleton |> FSet.contains 1)
assert (1 |> FSet.singleton |> FSet.contains 0 |> not)
assert ([1; 2; 3] |> FSet.ofList |> FSet.contains 1)
assert ([1; 2; 3] |> FSet.ofList |> FSet.union (FSet.singleton 4) |> FSet.contains 4)
assert ([1; 2; 3] |> FSet.ofList |> FSet.intersect (FSet.singleton 1) |> FSet.contains 1)
assert ([1; 2; 3] |> FSet.ofList |> FSet.intersect (FSet.singleton 4) |> FSet.contains 4 |> not)
```
