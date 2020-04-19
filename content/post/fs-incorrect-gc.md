---
title: "Invalid GC results in F# tests"
date: 2020-03-30
description: "Why some objects seem not to be collected"
tags: [fsharp, dotnet, optimization]
featured_image: "/images/fsharp.jpg"
categories: dev
comment : false
---

When running tests which check if something is GC'd, it might fail.

## The test

Consider the following test:

```fsharp
[<TestMethod>]
member _.TestGC() =
    let mutable obj = new Object()
    let weak = new WeakReference(obj);

    GC.Collect()

    Assert.IsTrue(obj <> null)
    Assert.IsTrue(weak.IsAlive)            

    obj <- null
    GC.Collect()

    Assert.IsTrue((obj = null))
    Assert.IsTrue(not weak.IsAlive)
```
This will fail in `DEBUG`.

## Sub-expression elaboration

This happens because of elaboration to new locals for every subexpression. For example,

```fsharp
let list1 = [1; 2; 3]
let list2 = [1; 2; 3]
assert (list1 = list2)
```

This elaborates every sub-expression to:

```fsharp
let list1 = [1; 2; 3]
let list2 = [1; 2; 3] 
let list1' = list1
let list2' = list2
let is_eq = list1'.Equals(list2')
assert (is_eq)
```

Rewriting our first example:

```fsharp
let obj' = obj
let isNull = obj' <> null
```

While this usually isn't a problem, `obj'` will end up holding a reference to the original object, so it won't be collected until it goes out of scope - which is only when the method exits.

The rewriting won't happen for `RELEASE` mode, so the test should pass. But any effects related to the lifetime of objects in memory would exist in `DEBUG`.



[1]: https://github.com/dotnet/fsharp/blob/0f514efe25899ba59778b5bb522e2724aec44a3d/src/fsharp/FSharp.Build/Fsc.fs#L120