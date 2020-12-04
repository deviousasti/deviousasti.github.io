---
title: "Worksheet: A new way to prototype in F#"
date: 2020-12-04
description: "Turn arbitrary programs into Spreadsheets"
tags: [fsharp]
featured_image: "/images/fsharp.jpg"
categories: dev
comment : true
---

# F# Interactive now with Stories!

{{< figure src="/images/fsi-stories.jpg" >}}

Now that I have your attention, please read on for something even more exciting!

# The case for

Working with F# interactive is an exercise in selection and *Send to Interactive*. While it gives fast feedback, there's always the issue of making changes. Edit something and you have to manually send everything that the edit affects to FSI, which sometimes you may miss out on, and that results in strange behavior.

What if we could do better? What if we could generalize an arbitrary program into evaluating like a spreadsheet?

Could we have something like this?

{{< figure src="/images/excel.gif" width="60%" >}}

It turns out we can!

{{< figure src="/images/excelfsharp.gif" width="80%" >}}

# How does it work?

In a language like F#, declarations can only make references in compile order- this, coupled with referentially transparent code, serve as the building blocks of cells.

The central intuition here is that the nature of functional programs should allow them to be modeled as a directed acyclic graph (a DAG). The graph is acyclic because unlike pure OO languages, forward references are not possible - structure flows *downward*.

### Criteria for nodes

Picking graph nodes is important - we require a node to be at least a top-level declaration. To qualify to be a declaration, it must be one of the following:

| Kind                    | ----->    | Example                            |
| ----------------------- | :--------------------------------: | :--------------------------------- |
| Let binding in a module |      | `let add a b = a + b`         |
| *Do* expression         |                          | `add 1 2 `                         |
| Type declaration        |           | `type Int = Int of Int32`          |
| Exception declaration   |  | `exception OwnException of string` |
| Open declaration        |                       | `open System`                      |
| Compiler directive      |                   | `#r "System.dll"`                  |



<br /><br />



------------------------

### An example

Let's consider the following example:

```fsharp
type Tree = 
    | Empty
    | Branch of int * Tree * Tree

let empty = Empty
let singleton v = Branch(v, Empty, Empty)

let height tree = 
    let rec heightr level = function
    | Empty -> level
    | Branch(_, left, right) -> 
        let level' = level + 1
        max (heightr level' left) (heightr level' right)

    heightr 0 tree

let taller a b = max (height a) (height b)

taller empty (singleton 1)
```

Going by our above rules, we scan the AST for declarations:

| Symbol Node                  | -----> | Kind                                        |
| ---------------------------- | ------ | :------------------------------------------ |
| `Tree`                       |        | Type declaration                            |
| `empty`                      |        | Let binding                                 |
| `singleton`                  |        | Let binding                                 |
| `height`                     |        | Let binding                                 |
| `heightr`                    |        | Rejected because inside another let binding |
| `taller`                     |        | Let binding                                 |
| `taller empty (singleton 1)` |        | Do expression                               |

Looking at the AST reveals the usage of these symbols from our nodes. For example, `empty` contains a reference to the `Tree` symbol. Through instances of symbol usage, for each of these nodes, we can establish links between them.

Which allows us to generate a graph like this:

{{< figure src="/images/worksheet-diag.svg" >}}

For any given expression, it's possible to follow the chain of calls.

# Arbitrary changes

We know our cells, and relationships between the cells. But it's not going to be useful until we can track 'changes' to our metaphorical cell. Unlike a spreadsheet, we don't have a convenient labeled box to enter code in.

This is accomplished by hashing the AST for each top-level declaration. We compare this against our previously hashed AST and decide:

- If the old state contains the same hash - we keep that cell and its value.
- If a hash is absent from the new state, we remove that cell.
- If a hash is not present in the old state, we add a new cell.

This turns out to be sufficient, instead of tracking cell mutations, which we cannot because we are generalizing for arbitrary changes. If the new cell has any dependents in the graph, they qualify for evaluation as well. And so their dependents, and so on.

For every qualified cell, we evaluate its value (i.e., run the computation and save the result). 
There's some additional infrastructure around the evaluator, so things work like we expect them to:

{{< figure src="/images/fsworksheet-capture.jpg" width="80%" >}}

# Implementation

F# Worksheet has both a console version and a Visual Studio plugin.

You can use it today by [cloning the repo](https://github.com/deviousasti/fsharp-worksheet) and running `install.ps1`.

This builds and installs it as a dotnet tool. You can make it watch any script file with:

```powershell
PS> fsw program.fsx
```

and it evaluates changes every time you save changes.

{{< figure src="/images/fswatch.gif" >}}

The Visual Studio plugin is in pre-release, it needs additional UX work to make it pleasant to use. You can still build the solution to try it in preview. A brief demo:

{{< figure src="/images/fsworksheet.gif" >}}

Ideas are welcome to make it more user-friendly and visual.