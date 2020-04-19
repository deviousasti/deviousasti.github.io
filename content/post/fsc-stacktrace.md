---
title: "Incorrect stack traces in F#"
date: 2020-03-23
description: "The stack trace missing a few calls?"
tags: [fsharp, dotnet, optimization]
featured_image: "/images/fsharp.jpg"
categories: dev
comment : false
---

Consider the following simple program:

```fsharp
let foo () =
    failwithf "foo"

[<EntryPoint>]
let main argv =
    foo ()
    0
```
Pretty straightforward. But depending on the circumstances, you may never see that `foo` in the stack trace. 

```
Unhandled Exception: System.Exception: foo
   at Microsoft.FSharp.Core.PrintfModule.PrintFormatToStringThenFail@1639.Invoke(String message)
   at Program.main(String[] argv) in Program.fs:line 13
```

And the reason for that is optimizations. For `fsc`, optimizations are [turned on by default][1].

## Inlining

This is the most common thing you're likely to see. `foo()` isn't even called - if the method body is small enough, `fsc` will easily inline it. 
The resulting IL is equivalent to (all inlined):

    let main argv =
    	PrintfModule.PrintFormatToStringThenFail(new PrintfFormat<_>("foo"));
    	0

Inlining can be disabled with ` --optimize-`

    fsc -g --optimize- Program.fs

## Tail-call optimization

A tail-call optimization avoids allocating a new stack frame for a function call. Tail call optimizations can be applied for functions whose *return value* is the call to another function (or itself). And since it works by the elimination of stack-frames, you don't see it in the stack trace.

`foo` meets this criteria as it shorts `main`.

Tail calls can be turned off this off with `--tailcalls-`.

## Turning off optimizations

For the full debugging experience, go with a standard `DEBUG` configuration:

    fsc --debug:full --define:DEBUG --define:TRACE --optimize- --tailcalls- Program.fs

The stack trace should be as expected:

    Unhandled Exception: System.Exception: foo
       at Microsoft.FSharp.Core.PrintfModule.PrintFormatToStringThenFail@1639.Invoke(String message)
       at Program.foo[a]() in Program.fs:line 4
       at Program.main(String[] argv) in Program.fs:line 13



[1]: https://github.com/dotnet/fsharp/blob/0f514efe25899ba59778b5bb522e2724aec44a3d/src/fsharp/FSharp.Build/Fsc.fs#L120